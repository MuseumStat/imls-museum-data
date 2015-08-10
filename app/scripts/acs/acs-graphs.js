
(function() {
    'use strict';

    /* ngInject */
    function ACSGraphs(ACSVariables) {

        var charts = {};

        var module = {
            drawBarChart: drawBarChart,
            drawPieChart: drawPieChart,
            generateSeries: generateSeries,
            updateCharts: updateCharts
        };
        return module;

        function addElipses(text, max) {
            if (text.length > max) {
                return text.substr(0, max-1) + '...';
            }
            return text;
        }

        function updateCharts() {
            _.forIn(charts, function (chart) {
                chart.update();
            });
        }

        function drawBarChart(key, series, forceRedraw) {
            var datum = [{
                key: key,
                values: series
            }];
            if (forceRedraw || !charts[key]) {
                var chart = nv.models.discreteBarChart()
                    .x(function(d) { return addElipses(d.label, 9); })
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

        function drawPieChart(key, data, forceRedraw) {
            if (forceRedraw || !charts[key]) {
                var chart = nv.models.pieChart()
                    .x(function(d) { return addElipses(d.label, 8); })
                    .y(function(d) { return d.value; })
                    .tooltipContent(function(d) {
                        return '<b>' + d.data.label + ': </b>' + d.data.value;
                    })
                    .color(function () { return '#7779b1'; })
                    .margin({right: 10})
                    .showLegend(false);
                nv.utils.windowResize(chart.update);
                charts[key] = chart;
            }
            d3.select('#pie-chart-' + key + ' svg')
                .datum(data)
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
