(function () {
    'use strict';

    /* ngInject */
    function NearbyMuseumsTabController($log, $scope, $timeout, ACSGraphs) {
        var ctl = this;

        initialize();

        function initialize() {
            $scope.$watch(function () { return ctl.stateData; }, onStateDataChanged);
            $scope.$watch(function () { return ctl.areaData; }, onAreaDataChanged);
            $scope.$watch(function () { return ctl.isTabVisible; }, onTabVisibleChanged);
        }

        function onStateDataChanged(newData) {
            if (newData) {
                ctl.stateData = newData;
                if (ctl.areaData) {
                    draw();
                }
            }
        }

        function onAreaDataChanged(newData) {
            if (newData) {
                ctl.areaData = newData;
                if (ctl.stateData) {
                    draw();
                }
            }
        }

        function onTabVisibleChanged() {
            if (ctl.isTabVisible) {
                $timeout(function () {
                    draw(true);
                });
            }
        }

        function draw(forceRedraw) {
            var barOpts = {
                forceRedraw: forceRedraw,
                margin: {
                    left: 200,
                    right: 30
                }
            };
            ACSGraphs.drawBarChart('nearby-state',
                                   ctl.stateData,
                                   barOpts);
            ACSGraphs.drawBarChart('nearby-area',
                                   ctl.areaData,
                                   barOpts);
        }
    }

    /* ngInject */
    function imlsTabNearbyMuseums() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/tab-nearby-museums-partial.html',
            scope: {
                stateData: '=',
                areaData: '=',
                isTabVisible: '='
            },
            controller: 'NearbyMuseumsTabController',
            controllerAs: 'nearby',
            bindToController: true
        };
        return module;
    }

    angular.module('imls.views.museum')
    .controller('NearbyMuseumsTabController', NearbyMuseumsTabController)
    .directive('imlsTabNearbyMuseums', imlsTabNearbyMuseums);

})();
