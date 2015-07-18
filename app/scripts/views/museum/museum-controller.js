(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController($log, $scope, $stateParams, $timeout, $window, 
                              Config, ACS, Museum) {
        var ctl = this;

        var MAP_SLIDE_TRANSITION_MS = 400;

        var vis = null;
        var map = null;

        initialize();

        function initialize() {
            ctl.mapExpanded = false;

            ctl.onStartDrawPolygon = onStartDrawPolygon;
            ctl.onStartDrawCircle = onStartDrawCircle;
            ctl.onPrintClicked = onPrintClicked;

            $scope.$on('imls:vis:ready', onVisReady);
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
            var center = L.latLng(ctl.museum.latitude, ctl.museum.longitude);
            map.setView(center, Config.detailZoom);
            $log.info(ctl.museum);
            var ONE_MILE_IN_M = 1609.344;
            ACS.getRadius(center.lng, center.lat, ONE_MILE_IN_M).then(onACSDataComplete, onACSDataError);
        }

        function onPrintClicked() {
            $window.print();
        }

        function onStartDrawPolygon() {
            var polygonDrawOptions = {};
            new L.Draw.Polygon(map, polygonDrawOptions).enable();
            setMapExpanded(true);
        }

        function onStartDrawCircle() {
            var circleDrawOptions = {};
            new L.Draw.Circle(map, circleDrawOptions).enable();
            setMapExpanded(true);
        }

        function onDrawCreated(event) {
            var layer = event.layer;
            var acsRequest;
            if (event.layerType === 'polygon') {
                acsRequest = ACS.getPolygon(layer.toGeoJSON().geometry.coordinates[0]);
                setMapExpanded(false);
            } else if (event.layerType === 'circle') {
                var latlng = layer.getLatLng();
                acsRequest = ACS.getRadius(latlng.lng, latlng.lat, layer.getRadius());
                setMapExpanded(false);
            }
            acsRequest.then(onACSDataComplete, onACSDataError);
        }

        function setMapExpanded(isExpanded) {
            ctl.mapExpanded = !!(isExpanded);
            $timeout(function () {
                map.invalidateSize();
            }, MAP_SLIDE_TRANSITION_MS);
        }

        function onACSDataComplete(data) {
            $log.info(data);
        }

        function onACSDataError(error) {
            $log.error('ACS Data Load:', error);
        }
    }

    angular.module('imls.views.museum')
    .controller('MuseumController', MuseumController);

})();
