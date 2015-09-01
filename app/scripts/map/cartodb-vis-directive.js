/**
 * Directive for displaying IMLS cartodb visualizations
 * To show demographic data on the map, add the attribute `demographics="true"`
 */
(function () {
    'use strict';

    /* ngInject */
    function VisController($attrs, $log, $q, $scope, Config) {

        var defaultOptions = {
            shareable: false,
            search: false,
            fullscreen: false,
            scrollwheel: false
        };
        var ctl = this;
        var url;
        var map;

        initialize();

        function initialize() {
            ctl.demographics = !!($scope.$eval($attrs.demographics));
            ctl.sublayers = [];
            ctl.radio = '0';
            ctl.layersVisible = false;
            ctl.visId = ctl.visId || Config.cartodb.visId;
            ctl.visOptions = ctl.visOptions || defaultOptions;
            ctl.visOptions.tooltip = !ctl.demographics;
            ctl.visAccount = ctl.visAccount || Config.cartodb.account;
            url = 'https://' + ctl.visAccount + '.cartodb.com/api/v2/viz/' + ctl.visId + '/viz.json';
            cartodb.createVis('map', url, ctl.visOptions).done(onVisReady);

            ctl.onSublayerChange = onSublayerChange;
        }

        function onSublayerChange(sublayer) {
            angular.forEach(ctl.sublayers, function (s) {
                s.hide();
                s.legend.set('visible', false);
            });
            if (sublayer) {
                sublayer.show();
                sublayer.legend.set('visible', true);
            } else {
                // Hide the sticky tooltip by clearing block styling...weee this is messy
                $('div.cartodb-tooltip').css('display', '');
            }
        }

        function onVisReady(vis) {
            map = vis.getNativeMap();

            if (ctl.demographics) {
                cartodb.createLayer(map, Config.cartodb.demographicVisUrl, {
                    tooltip: true
                }).addTo(map).done(function (layer) {
                    ctl.sublayers = layer.getSubLayers();
                    ctl.onSublayerChange(ctl.sublayers[0]);
                    $scope.$apply();
                });
            }

            // Force museum points back to the top
            // Always layer one of the main visualization (basemap is layer zero)
            var visLayers = vis.getLayers();
            if (visLayers && visLayers.length > 1) {
                visLayers[1].setZIndex(9999);
            }

            $scope.$emit('imls:vis:ready', vis, map);
        }
    }

    /* ngInject */
    function CartoDBVis() {

        var module = {
            restrict: 'E',
            scope: {
                visId: '@',
                visAccount: '@',
                visOptions: '='
            },
            templateUrl: 'scripts/map/cartodb-vis-partial.html',
            controller: 'VisController',
            controllerAs: 'vis',
            bindToController: true
        };
        return module;
    }

    angular.module('imls.map')
    .controller('VisController', VisController)
    .directive('cartodbVis', CartoDBVis);

})();
