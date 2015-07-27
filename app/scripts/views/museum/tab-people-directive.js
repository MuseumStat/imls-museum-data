(function () {
    'use strict';

    /* ngInject */
    function PeopleTabController($log, $scope, ACSAggregate, ACSGraphs, ACSVariables) {
        var ctl = this;

        var raceVariables = [
            // Race -- bar
            'B02001_002E',
            'B02001_003E',
            'B02001_004E',
            'B02001_005E',
            'B02001_006E',
            'B02001_007E',
            'B02001_008E'
        ];
        var employmentVariables = [
            'B23025_004E',
            'B23025_005E',
            'B23025_006E',
            'B23025_007E'
        ];

        initialize();

        function initialize() {
            ctl.acsVariables = ACSVariables;
            ctl.charts = {};

            $scope.$watch(function () { return ctl.data; }, onSumDataChanged);
        }

        function onSumDataChanged(newData) {
            $log.info('PeopleTabController.onSumDataChanged', newData);
            if (newData && newData.headers && newData.data) {
                ctl.data = newData;
                ctl.sumData = ACSAggregate.sum(ctl.data);

                ACSGraphs.drawBarChart('race',
                                       ACSGraphs.generateSeries(ctl.sumData, raceVariables));
                ACSGraphs.drawBarChart('employment',
                                       ACSGraphs.generateSeries(ctl.sumData, employmentVariables));
            }
        }
    }

    /* ngInject */
    function imlsTabPeople() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/tab-people-partial.html',
            scope: {
                data: '='
            },
            controller: 'PeopleTabController',
            controllerAs: 'people',
            bindToController: true
        };
        return module;
    }

    angular.module('imls.views.museum')
    .controller('PeopleTabController', PeopleTabController)
    .directive('imlsTabPeople', imlsTabPeople);

})();
