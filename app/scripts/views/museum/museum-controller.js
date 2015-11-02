(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController($cookies, $log, $scope, $state, $stateParams, $timeout, $window, resize,
                              Config, ACS, ACSGraphs, MapStyle, Museum) {
        var ctl = this;

        var ONE_MILE_IN_M = 1609.344;
        var LOAD_TIMEOUT_MS = 300;
        var CUSTOM_RADIUS_VALUE = -1;

        var vis = null;
        var map = null;
        var searchPolygon = null;
        var lastSearchPolygon = null;
        var drawHandler = null;
        var searchPolygonStyle = angular.extend({}, MapStyle.circle, {
            dashArray: '8',
        });

        initialize();

        function initialize() {
            // A 'custom' option is dynamically added to this list whenever
            //  the user draws a custom polygon
            ctl.acsRadiusOptions = [{
                value: ONE_MILE_IN_M,
                label: '1 Mile Radius'
            }, {
                value: ONE_MILE_IN_M * 3,
                label: '3 Mile Radius'
            }, {
                value: ONE_MILE_IN_M * 5,
                label: '5 Mile Radius'
            }, {
                value: ONE_MILE_IN_M * 25,
                label: '25 Mile Radius'
            }];
            ctl.tabStates = {
                LOADING: 0,
                TABS: 1,
                ERROR: 2
            };
            ctl.acsRadius = ctl.acsRadiusOptions[0].value;
            ctl.mapExpanded = false;
            ctl.activeTab = 'people';
            ctl.tabState = ctl.tabStates.LOADING;

            ctl.onBackButtonClicked = onBackButtonClicked;
            ctl.onMapExpanded = onMapExpanded;
            ctl.onRadiusChanged = onRadiusChanged;
            ctl.onStartDrawPolygon = onStartDrawPolygon;
            ctl.onStartDrawCircle = onStartDrawCircle;
            ctl.onPrintClicked = onPrintClicked;

            $scope.$on('imls:vis:ready', onVisReady);

            resize($scope).call(ACSGraphs.updateCharts);
        }

        function onVisReady(event, newVis, newMap) {
            vis = newVis;
            map = newMap;

            map.on('draw:created', onDrawCreated);

            Museum.detail($stateParams.museum).then(setMuseum).catch(function (error) {
                $log.error('Error loading museum', $stateParams.museum, error);
            });
        }

        function addLocationMarker(position) {
            // should only happen once
            var icon = L.icon({
                iconUrl: 'images/map-marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            });
            var marker = L.marker([position.y, position.x], {
                clickable: false,
                keyboard: false,
                icon: icon
            });
            marker.addTo(map);
        }

        function setMuseum(rows) {
            ctl.museum = rows[0];
            Museum.byTypeInState(ctl.museum.gstate).then(function (response) {
                ctl.nearbyInState = response;
            });
            addLocationMarker({x: ctl.museum.longitude, y: ctl.museum.latitude});
            $log.info(ctl.museum);
            onRadiusChanged();
        }

        function onPrintClicked() {
            $window.print();
        }

        function onRadiusChanged() {
            clearCustomRadiusOption();
            var center = L.latLng(ctl.museum.latitude, ctl.museum.longitude);
            // Initialize charts with data in a 1 mi radius
            setACSSearchRadius(center, ctl.acsRadius);
            var dfd = ACS.getRadius(center.lng, center.lat, ctl.acsRadius).then(onACSDataComplete, onACSDataError);
            attachSpinner(dfd);
            Museum.byTypeInRadius(center.lng, center.lat, ctl.acsRadius).then(function (data) {
                ctl.nearbyInArea = data;
            });
        }

        function onStartDrawPolygon() {
            addCustomRadiusOption();
            ctl.acsRadius = -1;
            clearSearchPolygon();
            var polygonDrawOptions = {};
            drawHandler = new L.Draw.Polygon(map, polygonDrawOptions);
            drawHandler.enable();
            setMapExpanded(true);
        }

        function onStartDrawCircle() {
            addCustomRadiusOption();
            ctl.acsRadius = -1;
            clearSearchPolygon();
            var circleDrawOptions = {};
            drawHandler = new L.Draw.Circle(map, circleDrawOptions);
            drawHandler.enable();
            setMapExpanded(true);
        }

        function onDrawCreated(event) {
            var layer = event.layer;
            var acsRequest;
            var nearbyRequest;
            if (event.layerType === 'polygon') {
                var points = layer.toGeoJSON().geometry.coordinates[0];
                $log.info(points);
                acsRequest = ACS.getPolygon(points);
                nearbyRequest = Museum.byTypeInPolygon(points);
                setACSSearchPolygon(_.map(points, function (p) { return [p[1], p[0]]; }), {
                    resetBounds: false
                });
                setMapExpanded(false);
            } else if (event.layerType === 'circle') {
                var latlng = layer.getLatLng();
                var radius = layer.getRadius();
                acsRequest = ACS.getRadius(latlng.lng, latlng.lat, radius);
                nearbyRequest = Museum.byTypeInRadius(latlng.lng, latlng.lat, radius);
                setACSSearchRadius(latlng, radius, { resetBounds: false });
                setMapExpanded(false);
            }
            attachSpinner(acsRequest.then(onACSDataComplete, onACSDataError));
            nearbyRequest.then(function (data) {
                ctl.nearbyInArea = data;
            });
        }

        function onMapExpanded(isOpen) {
            if (!isOpen) {
                if (searchPolygon) {
                    map.fitBounds(searchPolygon.getBounds());
                // User is in the middle of drawing, cancel drawing and restore last used
                // searchPolygon
                } else if (drawHandler) {
                    drawHandler.disable();
                    searchPolygon = lastSearchPolygon;
                    lastSearchPolygon = null;
                    map.addLayer(searchPolygon);
                }
            }
        }

        function setMapExpanded(isExpanded) {
            ctl.mapExpanded = !!(isExpanded);
        }

        function onACSDataComplete(data) {
            ctl.tabState = ctl.tabStates.TABS;
            ctl.acsData = data;
        }

        function onACSDataError(error) {
            ctl.tabState = ctl.tabStates.ERROR;
            $log.error('ACS Data Load:', error);
        }

        function setACSSearchPolygon(points, options) {
            var defaults = { resetBounds: true };
            var opts = angular.extend({}, defaults, options);
            clearSearchPolygon();
            searchPolygon = L.polygon(points, searchPolygonStyle);
            map.addLayer(searchPolygon);
            if (opts.resetBounds) {
                map.fitBounds(searchPolygon.getBounds());
            }
        }

        function setACSSearchRadius(center, radius, options) {
            var defaults = { resetBounds: true };
            var opts = angular.extend({}, defaults, options);
            clearSearchPolygon();
            searchPolygon = L.circle(center, radius, searchPolygonStyle);
            map.addLayer(searchPolygon);
            if (opts.resetBounds) {
                map.fitBounds(searchPolygon.getBounds());
            }
        }

        function setLastPositionCookie() {
            if (!ctl.museum) {
                return;
            }
            $cookies.putObject(Config.cookies.LAST_SEARCHED, {
                text: ctl.museum.commonname || '',
                position: {
                    x: ctl.museum.longitude,
                    y: ctl.museum.latitude
                }
            }, {
                // Set expiry to 12hrs from set time
                expires: new Date(new Date().getTime() + 12 * 3600 * 1000)
            });
        }

        function onBackButtonClicked() {
            setLastPositionCookie();
            $state.go('home');
        }

        function clearSearchPolygon() {
            if (searchPolygon) {
                lastSearchPolygon = searchPolygon;
                map.removeLayer(searchPolygon);
                searchPolygon = null;
            }
        }

        function addCustomRadiusOption() {
            if (!_.find(ctl.acsRadiusOptions, function (option) { option.value === CUSTOM_RADIUS_VALUE })) {
                ctl.acsRadiusOptions.splice(0, 0, { value: CUSTOM_RADIUS_VALUE, label: 'Custom' });
            }
        }

        function clearCustomRadiusOption() {
            _.remove(ctl.acsRadiusOptions, function (option) {
                return option.value === CUSTOM_RADIUS_VALUE;
            })
        }

        function attachSpinner(dfd) {
            var timeoutId = $timeout(function () {
                ctl.tabState = ctl.tabStates.LOADING;
            }, LOAD_TIMEOUT_MS);
            return dfd.finally(function () {
                $timeout.cancel(timeoutId);
            });
        }
    }

    angular.module('imls.views.museum')
    .controller('MuseumController', MuseumController);

})();
