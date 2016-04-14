/**
 * Control to allow the user to select or draw custom ACS analysis areas on the cartodb-vis map
 *
 * Events:
 * imls:area-analysis-control:radius:changed Triggered when the radius is changed in the
 *                                           control select dropdown
 *     {Number} radius The radius selected in meters
 *
 * imls:area-analysis-control:draw:start Triggered when the user clicks on any of the custom
 *                                       draw buttons
 *     {String} drawType The button selected, currently one of 'circle'|'polygon'
 *
 * imls:area-analysis-control:draw:complete Triggered when the user finishes drawing a custom shape
 *     {Event} drawEvent The event fired by the L.Draw control, passed through
 *
 * imls:area-analysis-control:draw:cancel Listened for on scope, trigger elsewhere to clear the
 *                                        draw handler and reset the control
 *
 */

(function () {
    'use strict';

    /** @ngInject */
    function AreaAnalysisController($filter, $scope, Area) {
        var CUSTOM_RADIUS_VALUE = -1;
        var ONE_MILE_IN_M = 1609.344;
        var drawHandler = null;
        var map = null;

        var ctl = this;
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
            ctl.acsRadius = ctl.acsRadiusOptions[0].value;
            setArea(ctl.acsRadius);

            ctl._onRadiusChanged = _onRadiusChanged;
            ctl.onStartDrawPolygon = onStartDrawPolygon;
            ctl.onStartDrawCircle = onStartDrawCircle;

            $scope.$on('imls:vis:ready', function (event, vis, newMap) {
                map = newMap;
                map.on('draw:created', onDrawComplete);
                _onRadiusChanged();
            });

            $scope.$on('imls:area-analysis-control:draw:cancel', onDrawCancel);
        }

        function onDrawCancel() {
            clearDrawHandler();
        }

        function _onRadiusChanged() {
            clearDrawHandler();
            clearCustomRadiusOption();
            setArea(Area.circle(ctl.acsRadius));
            $scope.$emit('imls:area-analysis-control:radius:changed', ctl.acsRadius);
        }

        function onStartDrawPolygon() {
            clearDrawHandler();
            addCustomRadiusOption();
            ctl.acsRadius = -1;
            var polygonDrawOptions = {};
            drawHandler = new L.Draw.Polygon(map, polygonDrawOptions);
            drawHandler.enable();

            $scope.$emit('imls:area-analysis-control:draw:start', 'polygon');
        }

        function onStartDrawCircle() {
            clearDrawHandler();
            addCustomRadiusOption();
            ctl.acsRadius = -1;
            var circleDrawOptions = {};
            drawHandler = new L.Draw.Circle(map, circleDrawOptions);
            drawHandler.enable();
            $scope.$emit('imls:area-analysis-control:draw:start', 'circle');
        }

        function addCustomRadiusOption() {
            if (!_.find(ctl.acsRadiusOptions, function (option) { return option.value === CUSTOM_RADIUS_VALUE; })) {
                ctl.acsRadiusOptions.splice(0, 0, { value: CUSTOM_RADIUS_VALUE, label: 'Custom' });
            }
        }

        function clearCustomRadiusOption() {
            _.remove(ctl.acsRadiusOptions, function (option) {
                return option.value === CUSTOM_RADIUS_VALUE;
            });
        }

        function onDrawComplete(event) {
            var layer = event.layer;
            if (event.layerType === 'polygon') {
                var points = layer.toGeoJSON().geometry.coordinates[0];
                setArea(Area.polygon([points]));
            } else if (event.layerType === 'circle') {
                var radius = layer.getRadius();
                setArea(Area.circle(radius));
            }

            $scope.$emit('imls:area-analysis-control:draw:complete', event);
        }

        function setArea(areaMeters) {
            var areaMiles = Math.abs(areaMeters) * 0.000621371 * 0.000621371;
            var decimalPlaces = 2;
            if (areaMiles > 10) {
                decimalPlaces = 0;
            } else if (areaMiles > 1) {
                decimalPlaces = 1;
            }
            ctl.area = $filter('number')(areaMiles, decimalPlaces);
        }

        function clearDrawHandler() {
            if (drawHandler) {
                drawHandler.disable();
                drawHandler = null;
            }
        }
    }

    /** @ngInject */
    function areaAnalysisControl() {
        var module = {
            restrict: 'A',
            templateUrl: 'scripts/map/area-analysis-control-partial.html',
            scope: true,
            controller: 'AreaAnalysisController',
            controllerAs: 'aac',
            bindToController: true
        };
        return module;
    }

    angular.module('imls.map')
    .controller('AreaAnalysisController', AreaAnalysisController)
    .directive('areaAnalysisControl', areaAnalysisControl);

})();
