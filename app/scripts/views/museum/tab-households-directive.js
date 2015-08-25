(function () {
    'use strict';

    /* ngInject */
    function HouseholdsTabController($log, $scope, $timeout, ACSGraphs, ACSVariables) {
        var ctl = this;

        var houseLangVariables = [
            'B16002_002E',
            'B16002_003E',
            'B16002_006E',
            'B16002_009E',
            'B16002_012E'
        ];

        var houseTypeVariables = [
            'B11001_002E',
            'B11001_007E'
        ];

        initialize();

        function initialize() {
            ctl.acsVariables = ACSVariables;

            $scope.$watch(function () { return ctl.data; }, onDataChanged);
            $scope.$watch(function () { return ctl.isTabVisible; }, onTabVisibleChanged);
        }

        function onDataChanged(newData) {
            if (newData) {
                ctl.data = newData;
                draw();
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
            var householdOpts = {
                forceRedraw: forceRedraw,
                margin: {
                    left: 200,
                    right: 30
                }
            };
            ACSGraphs.drawBarChart('household-language',
                                   ACSGraphs.generateSeries(ctl.data, 'sum', houseLangVariables),
                                   householdOpts);
            ACSGraphs.drawPieChart('household-type',
                                   ACSGraphs.generateSeries(ctl.data, 'sum', houseTypeVariables),
                                   forceRedraw);
        }
    }

    /* ngInject */
    function imlsTabHouseholds() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/tab-households-partial.html',
            scope: {
                data: '=',
                isTabVisible: '='
            },
            controller: 'HouseholdsTabController',
            controllerAs: 'house',
            bindToController: true
        };
        return module;
    }

    angular.module('imls.views.museum')
    .controller('HouseholdsTabController', HouseholdsTabController)
    .directive('imlsTabHouseholds', imlsTabHouseholds);

})();
