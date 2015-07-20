(function () {
    'use strict';

    /* ngInject */
    function PeopleTabController($log, $scope, ACSAggregate, ACSVariables) {
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
        var houseLangVariables = [
            'B16002_002E',
            'B16002_003E',
            'B16002_006E',
            'B16002_009E',
            'B16002_012E'
        ];

        var raceBarChart = null;

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

                drawBarChart('race', generateSeries(ctl.sumData, raceVariables));
                drawBarChart('employment', generateSeries(ctl.sumData, employmentVariables));
                drawBarChart('household-language', generateSeries(ctl.sumData, houseLangVariables));
            }
        }

        function drawBarChart(key, series) {
            var datum = [{
                key: key,
                values: series
            }];
            if (!ctl.charts[key]) {
                var chart = nv.models.discreteBarChart()
                    .x(function(d) { return d.label.substr(0,8) + '...'; })
                    .y(function(d) { return d.value; })
                    .tooltipContent(function(d) {
                        return '<b>' + d.data.label + ': </b>' + d.data.value;
                    })
                    .staggerLabels(true)
                    .color(function () { return '#7779b1'; })
                    .margin({right: 10});
                nv.utils.windowResize(chart.update);
                ctl.charts[key] = chart;
            }
            d3.select('#bar-chart-' + key + ' svg')
                .datum(datum)
                .call(ctl.charts[key]);
        }

        function generateSeries(data, variables) {
            return _.map(variables, function (variable) {
                return {
                    value: data[variable],
                    label: ACSVariables[variable]
                };
            });
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
