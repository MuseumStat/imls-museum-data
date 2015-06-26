
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, $scope, $timeout) {

        var MAP_SLIDE_TRANSITION_MS = 400;
        var ctl = this;
        var map = null;
        var vis = null;

        initialize();

        function initialize() {
            ctl.error = false;
            ctl.mapExpanded = false;

            ctl.onStartDrawPolygon = onStartDrawPolygon;
            ctl.onStartDrawCircle = onStartDrawCircle;

            $scope.$on('imls:vis:ready', onVisReady);
        }

        function onVisReady(event, newVis, newMap) {
            vis = newVis;
            map = newMap;

            map.on('draw:created', onDrawCreated);
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
            if (event.layerType === 'polygon') {
                // TODO: Do something with polygon
                setMapExpanded(false);
            } else if (event.layerType === 'circle') {
                // TODO: Do something with circle
                setMapExpanded(false);
            }
        }

        function setMapExpanded(isExpanded) {
            ctl.mapExpanded = !!(isExpanded);
            $timeout(function () {
                map.invalidateSize();
            }, MAP_SLIDE_TRANSITION_MS);
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
