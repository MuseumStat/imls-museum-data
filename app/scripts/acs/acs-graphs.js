
(function() {
    'use strict';

    /* ngInject */
    function ACSGraphs($filter, ACSVariables) {

        var charts = {};

        var numberFilter = $filter('number');

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

        function drawBarChart(key, series, options) {
            var total = _(series).pluck('value').reduce(_.add, 0);
            var defaults = {
                margin: {
                    top: 10,
                    left: 10,
                    bottom: 10,
                    right: 10
                },
                forceRedraw: false,
                horizontal: true
            };
            var opts = angular.extend({}, defaults, options);
            var datum = [{
                key: key,
                values: series
            }];
            if (opts.forceRedraw || !charts[key]) {
                var chart;
                if(opts.horizontal) {
                    chart = nv.models.multiBarHorizontalChart()
                        .x(function(d) { return addElipses(d.label, 30); })
                        .y(function(d) { return d.value; })
                        .tooltipContent(function(d) {
                            var percent = numberFilter(d.data.value / total * 100, 1);
                            return ['<b>', d.data.label, ': </b>', numberFilter(d.data.value),
                                    ' (', percent, '%)'].join('');
                        })
                        .color(function () { return '#bc5405'; })
                        .margin(opts.margin)
                        .showControls(false)
                        .showLegend(false);
                } else {
                    chart = nv.models.discreteBarChart()
                        .x(function(d) { return addElipses(d.label, 20); })
                        .y(function(d) { return d.value; })
                        .tooltipContent(function(d) {
                            var percent = numberFilter(d.data.value / total * 100, 1);
                            return ['<b>', d.data.label, ': </b>', numberFilter(d.data.value),
                                    ' (', percent, '%)'].join('');
                        })
                        .staggerLabels(true)
                        .color(function () { return '#bc5405'; })
                        .margin(opts.margin);
                }
                nv.utils.windowResize(chart.update);
                charts[key] = chart;
            }
            d3.select('#bar-chart-' + key + ' svg')
                .datum(datum)
                .call(charts[key]);
        }

        function drawPieChart(key, data, forceRedraw) {
            var total = _(data).pluck('value').reduce(_.add, 0);
            if (forceRedraw && charts[key]) {
                // completely remove chart if forcing redraw
                d3.select('#pie-chart-' + key + ' svg').remove();
                d3.select('#pie-chart-' + key).insert('svg');
            }
            if (forceRedraw || !charts[key]) {
                var chart = nv.models.pieChart()
                    .x(function(d) { return addElipses(d.label, 10); })
                    .y(function(d) { return d.value; })
                    .tooltipContent(function(d) {
                        var percent = $filter('number')(d.data.value / total * 100, 1);
                        return ['<b>', d.data.label, ': </b>', numberFilter(d.data.value),
                                ' (', percent, '%)'].join('');
                    })
                    .color(function () { return '#bc5405'; })
                    .margin({top: 0, left: 10, bottom: 0, right: 10})
                    .showLegend(false);
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
