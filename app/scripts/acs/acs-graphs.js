
(function() {
    'use strict';

    /* ngInject */
    function ACSGraphs(ACSVariables) {

        var charts = {};

        var module = {
            drawBarChart: drawBarChart,
            generateSeries: generateSeries
        };
        return module;

        function drawBarChart(key, series) {
            var datum = [{
                key: key,
                values: series
            }];
            if (!charts[key]) {
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
                charts[key] = chart;
            }
            d3.select('#bar-chart-' + key + ' svg')
                .datum(datum)
                .call(charts[key]);
        }

        function generateSeries(data, key, variables) {
            return _.map(variables, function (variable) {
                return {
                    value: data[variable][key],
                    label: ACSVariables[variable]
                };
            });
        }
    }

    angular.module('imls.acs')
    .service('ACSGraphs', ACSGraphs);
})();