(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController($filter, $log, $scope, $state, $stateParams, $timeout, $window, resize,
                              Config, ACS, ACSGraphs, MapStyle, Museum) {
        var ctl = this;

        var LOAD_TIMEOUT_MS = 300;
        var ONE_MILE_IN_M = 1609.344;

        var vis = null;
        var map = null;
        var lastSearchPolygon = null;
        var searchPolygon = null;
        var searchPolygonStyle = angular.extend({}, MapStyle.circle, {
            dashArray: '8',
        });

        initialize();

        function initialize() {
            ctl.tabStates = {
                LOADING: 0,
                TABS: 1,
                ERROR: 2
            };
            ctl.mapExpanded = false;
            ctl.activeTab = 'people';
            ctl.tabState = ctl.tabStates.LOADING;

            ctl.onBackButtonClicked = onBackButtonClicked;
            ctl.onMapExpanded = onMapExpanded;
            ctl.onPrintClicked = onPrintClicked;

            $scope.$on('imls:vis:ready', onVisReady);
            $scope.$on('imls:area-analysis-control:radius:changed', onRadiusChanged);
            $scope.$on('imls:area-analysis-control:draw:start', onDrawStart);
            $scope.$on('imls:area-analysis-control:draw:complete', onDrawCreated);

            resize($scope).call(ACSGraphs.updateCharts);
        }

        function onVisReady(event, newVis, newMap) {
            vis = newVis;
            map = newMap;

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
            Museum.byTypeInState('PA').then(function (response) {
                ctl.nearbyInState = response;
            });
            addLocationMarker({x: ctl.museum.longitude, y: ctl.museum.latitude});
            $log.debug(ctl.museum);
            onRadiusChanged();
        }

        function onPrintClicked() {
            $window.print();
        }

        function onRadiusChanged(event, radius) {
            radius = radius || ONE_MILE_IN_M;
            if (!ctl.museum) { return; }
            var center = L.latLng(ctl.museum.latitude, ctl.museum.longitude);
            // Initialize charts with data in a 1 mi radius
            setACSSearchRadius(center, radius);
            var dfd = ACS.getRadius(center.lng, center.lat, radius).then(onACSDataComplete, onACSDataError);
            attachSpinner(dfd);
            Museum.byTypeInRadius(center.lng, center.lat, radius).then(function (data) {
                ctl.nearbyInArea = data;
            });
        }

        function onDrawStart() {
            ctl.isDrawing = true;
            clearSearchPolygon();
            setMapExpanded(true);
        }

        function onDrawCreated(event, drawEvent) {
            ctl.isDrawing = false;
            var layer = drawEvent.layer;
            var acsRequest;
            var nearbyRequest;
            if (drawEvent.layerType === 'polygon') {
                var points = layer.toGeoJSON().geometry.coordinates[0];
                acsRequest = ACS.getPolygon(points);
                nearbyRequest = Museum.byTypeInPolygon(points);
                setACSSearchPolygon(points, {
                    resetBounds: false
                });
                setMapExpanded(false);
            } else if (drawEvent.layerType === 'circle') {
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
                } else if (ctl.isDrawing) {
                    ctl.isDrawing = false;
                    searchPolygon = lastSearchPolygon;
                    lastSearchPolygon = null;
                    map.addLayer(searchPolygon);
                    $scope.$broadcast('imls:area-analysis-control:draw:cancel');
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
            var latLngPoints = _.map(points, function (p) { return [p[1], p[0]]; });
            clearSearchPolygon();
            searchPolygon = L.polygon(latLngPoints, searchPolygonStyle);
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

        function onBackButtonClicked() {
            $window.history.back();
        }

        function clearSearchPolygon() {
            if (searchPolygon) {
                lastSearchPolygon = searchPolygon;
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
