(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController($cookies, $log, $scope, $state, $stateParams, $timeout, $window, resize,
                              Config, ACS, ACSGraphs, MapStyle, Museum) {
        var ctl = this;

        var MAP_SLIDE_TRANSITION_MS = 400;
        var ONE_MILE_IN_M = 1609.344;
        var LOAD_TIMEOUT_MS = 300;

        var vis = null;
        var map = null;
        var searchPolygon = null;
        var searchPolygonStyle = angular.extend({}, MapStyle.circle, {
            dashArray: '8',
        });

        initialize();

        function initialize() {
            ctl.acsRadiusOptions = [{
                value: ONE_MILE_IN_M,
                label: '1 Mile Radius'
            }, {
                value: ONE_MILE_IN_M * 3,
                label: '3 Mile Radius'
            }, {
                value: ONE_MILE_IN_M * 5,
                label: '5 Mile Radius'
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

        function setMuseum(rows) {
            ctl.museum = rows[0];
            Museum.byTypeInState(ctl.museum.gstate).then(function (response) {
                ctl.nearbyInState = response;
            });
            $log.info(ctl.museum);
            onRadiusChanged();
        }

        function onPrintClicked() {
            $window.print();
        }

        function onRadiusChanged() {
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
            clearSearchPolygon();
            var polygonDrawOptions = {};
            new L.Draw.Polygon(map, polygonDrawOptions).enable();
            setMapExpanded(true);
        }

        function onStartDrawCircle() {
            clearSearchPolygon();
            var circleDrawOptions = {};
            new L.Draw.Circle(map, circleDrawOptions).enable();
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

        function setMapExpanded(isExpanded) {
            ctl.mapExpanded = !!(isExpanded);
            $timeout(function () {
                map.invalidateSize();
                if (searchPolygon) {
                    map.fitBounds(searchPolygon.getBounds());
                }
            }, MAP_SLIDE_TRANSITION_MS * 1.5);
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
                map.removeLayer(searchPolygon);
                searchPolygon = null;
            }
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
