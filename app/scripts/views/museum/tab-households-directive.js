(function () {
    'use strict';

    /* ngInject */
    function HouseholdsTabController($log, $scope, ACSGraphs, ACSVariables) {
        var ctl = this;

        var houseLangVariables = [
            'B16002_002E',
            'B16002_003E',
            'B16002_006E',
            'B16002_009E',
            'B16002_012E'
        ];

        initialize();

        function initialize() {
            ctl.acsVariables = ACSVariables;

            $scope.$watch(function () { return ctl.data; }, onDataChanged);
        }

        function onDataChanged(newData) {
            if (newData) {
                ctl.data = newData;

                ACSGraphs.drawBarChart('household-language',
                                       ACSGraphs.generateSeries(ctl.data, 'sum', houseLangVariables));
            }
        }
    }

    /* ngInject */
    function imlsTabHouseholds() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/tab-households-partial.html',
            scope: {
                data: '='
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