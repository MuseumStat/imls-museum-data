(function () {
    'use strict';

    /* ngInject */
    function HouseholdsTabController($log, $scope, ACSAggregate, ACSGraphs, ACSVariables) {
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

            $scope.$watch(function () { return ctl.data; }, onSumDataChanged);
        }

        function onSumDataChanged(newData) {
            $log.info($scope);
            $log.info('HouseholdsTabController.onSumDataChanged', newData);
            if (newData && newData.headers && newData.data) {
                ctl.data = newData;
                ctl.sumData = ACSAggregate.sum(ctl.data);

                ACSGraphs.drawBarChart('household-language',
                                       ACSGraphs.generateSeries(ctl.sumData, houseLangVariables));
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