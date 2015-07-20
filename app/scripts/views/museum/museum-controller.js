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
        var ONE_MILE_IN_M = 1609.344;

        var vis = null;
        var map = null;
        var searchPolygon = null;
        var searchPolygonStyle = {
            color: '#f6ba46',
            weight: 5,
            fill: true,
            fillColor: '#000000',
            fillOpacity: 0.1,
            dashArray: '8',
            clickable: false
        };

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
            ctl.acsRadius = ctl.acsRadiusOptions[0].value;
            ctl.mapExpanded = false;

            ctl.onRadiusChanged = onRadiusChanged;
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
            ACS.getRadius(center.lng, center.lat, ctl.acsRadius).then(onACSDataComplete, onACSDataError);
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
            if (event.layerType === 'polygon') {
                var points = layer.toGeoJSON().geometry.coordinates[0];
                $log.info(points);
                acsRequest = ACS.getPolygon(points);
                setACSSearchPolygon(_.map(points, function (p) { return [p[1], p[0]]; }));
                setMapExpanded(false);
            } else if (event.layerType === 'circle') {
                var latlng = layer.getLatLng();
                var radius = layer.getRadius();
                acsRequest = ACS.getRadius(latlng.lng, latlng.lat, radius);
                setACSSearchRadius(latLng, radius);
                setMapExpanded(false);
            }
            acsRequest.then(onACSDataComplete, onACSDataError);
        }

        function setMapExpanded(isExpanded) {
            ctl.mapExpanded = !!(isExpanded);
            $timeout(function () {
                map.invalidateSize();
                // TODO: Figure out how to properly refit bounds to searchPolygon once
                // the slide transition completes
            }, MAP_SLIDE_TRANSITION_MS);
        }

        function onACSDataComplete(data) {
            $log.info(data);
        }

        function onACSDataError(error) {
            $log.error('ACS Data Load:', error);
        }

        function setACSSearchPolygon(points) {
            clearSearchPolygon();
            searchPolygon = L.polygon(points, searchPolygonStyle);
            map.addLayer(searchPolygon);
            map.fitBounds(searchPolygon.getBounds());
        }

        function setACSSearchRadius(center, radius) {
            clearSearchPolygon();
            searchPolygon = L.circle(center, radius, searchPolygonStyle);
            map.addLayer(searchPolygon);
            map.fitBounds(searchPolygon.getBounds());
        }

        function clearSearchPolygon() {
            if (searchPolygon) {
                map.removeLayer(searchPolygon);
                searchPolygon = null;
            }
        }
    }

    angular.module('imls.views.museum')
    .controller('MuseumController', MuseumController);

})();
