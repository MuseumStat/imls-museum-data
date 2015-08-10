(function () {
    'use strict';

    // TODO: Refactor this and the HouseholdTabController into a single controller and move
    // draw logic elsewhere
    //
    // isTabVisible is a bit hacky, couldn't come up with a good way to trigger the chart redraw
    // when the tab changes, which is necessary because the width: auto of the charts improperly
    // draws the charts when the tab is hidden. We don't want a static width on those charts
    // because they can change with browser width

    /* ngInject */
    function PeopleTabController($log, $scope, $timeout, ACSGraphs, ACSVariables) {
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
        var genderVariables = [
            'B01001_002E',
            'B01001_026E'
        ];

        initialize();

        function initialize() {
            ctl.acsVariables = ACSVariables;
            ctl.charts = {};

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
                // If we don't delay by a digest cycle, the tab still hasn't finished drawing
                // and therefore we don't draw the chart into a properly sized div
                $timeout(function () {
                    draw(true);
                });
            }
        }

        function draw(forceRedraw) {
            ACSGraphs.drawBarChart('race',
                                   ACSGraphs.generateSeries(ctl.data, 'sum', raceVariables),
                                   forceRedraw);
            ACSGraphs.drawBarChart('employment',
                                   ACSGraphs.generateSeries(ctl.data, 'sum', employmentVariables),
                                   forceRedraw);
            ACSGraphs.drawPieChart('gender',
                                   ACSGraphs.generateSeries(ctl.data, 'sum', genderVariables));
            ACSGraphs.updateCharts();
        }
    }

    /* ngInject */
    function imlsTabPeople() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/tab-people-partial.html',
            scope: {
                data: '=',
                isTabVisible: '='
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
