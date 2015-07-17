(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController($log, $scope, $timeout, $window, ACS) {
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
            $log.debug(event);
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
            acsRequest.then(function () {
                // TODO: do something with results
            });
        }

        function setMapExpanded(isExpanded) {
            ctl.mapExpanded = !!(isExpanded);
            $timeout(function () {
                map.invalidateSize();
            }, MAP_SLIDE_TRANSITION_MS);
        }
    }

    angular.module('imls.views.museum')
    .controller('MuseumController', MuseumController);

})();
