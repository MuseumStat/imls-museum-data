/**
 * Directive for displaying IMLS cartodb visualizations
 * To show demographic data on the map, add the attribute `demographics="true"`
 * See directive definition for other scope vars/attrs
 */
(function () {
    'use strict';

    /* ngInject */
    function VisController($attrs, $log, $q, $scope, $timeout, Config) {

        var MAP_SLIDE_TRANSITION_MS = 400;

        var defaultOptions = {
            /* jshint camelcase:false */
            cartodb_logo: false,
            /* jshint camelcase:true */
            fullscreen: false,
            https: true,
            legends: false,
            scrollwheel: false,
            search: false,
            shareable: false,
            tooltip: true
        };
        var ctl = this;
        var url;
        var map;
        var mapDomId = 'map';
        var demographicsVisible = false;

        initialize();

        function initialize() {
            ctl.demographics = !!($scope.$eval($attrs.demographics));
            ctl.drawControl = !!($scope.$eval($attrs.drawControl));
            ctl.visFullscreenClass = $attrs.visFullscreenClass || 'map-expanded';
            ctl.sublayers = [];
            ctl.radio = '-1';
            ctl.layersVisible = false;
            ctl.visId = ctl.visId || Config.cartodb.visId;
            ctl.visOptions = ctl.visOptions || defaultOptions;
            ctl.visAccount = ctl.visAccount || Config.cartodb.account;
            url = 'https://' + ctl.visAccount + '.carto.com/api/v2/viz/' + ctl.visId + '/viz.json';
            cartodb.createVis(mapDomId, url, ctl.visOptions).done(onVisReady);

            ctl.onFullscreenClicked = onFullscreenClicked;
            ctl.onSublayerChange = onSublayerChange;

            $scope.$watch(function () { return ctl.visFullscreen; }, onVisFullscreenChanged);
        }

        function onSublayerChange(sublayer) {
            angular.forEach(ctl.sublayers, function (s) {
                s.hide();
                //s.legend.set('visible', false);
            });
            demographicsVisible = !!(sublayer);
            if (sublayer) {
                sublayer.show();
                // sublayer.legend.set('visible', true);
            } else {
                // Hide the sticky tooltip by clearing block styling...weee this is messy
                $('div.cartodb-tooltip .tooltip-tracts').parent().css('display', 'none');
            }
        }

        function onVisReady(vis) {
            map = vis.getNativeMap();
            var layers = vis.getLayers();

            if (Config.cartodb.legend) {
                var legend = new cdb.geo.ui.Legend.Category(Config.cartodb.legend);
                  $('#' + mapDomId + ' .leaflet-container').append(legend.render().el);
            }
            // Pretty hacky, but simpler than other options:
            //  If one of the demographics layers are visible, then we want to find the
            //  tooltip-points tooltip and re-hide it as cartodbjs attempts to display it on
            //  feature over
            // Also have a check here to ensure we're listening to the points layer
            if (layers.length >= 2 && layers[1].getSubLayers) {
                layers[1].on('featureOver', onPointsLayerFeatureOver);
            } else {
                $log.error('vis.getLayers()[1] is not the points layer!');
            }
            if (ctl.demographics) {
                var demographicsOptions = angular.extend({}, defaultOptions, {});
                cartodb.createLayer(map, Config.cartodb.demographicVisUrl, demographicsOptions)
                .addTo(map).done(function (layer) {
                    $('div.cartodb-legend').filter(':first').css('bottom', '150px');
                    ctl.sublayers = layer.getSubLayers();
                    angular.forEach(ctl.sublayers, function (sublayer) {
                        sublayer.setInteraction(true);
                        sublayer.setInteractivity(Config.cartodb.demographicVisColumns || '');
                    });
                    ctl.onSublayerChange(ctl.sublayers[-1]);
                    $scope.$apply();

                    layer.on('featureOver', onDemographicsLayerFeatureOver);
                    // Need to slide demographics control up if both draw/demographics are active
                    if (ctl.drawControl) {
                        $('div.vis-layer-selector').css('bottom', '140px');
                    }
                });
            }

            // Force museum points back to the top
            // Always layer one of the main visualization (basemap is layer zero)
            var visLayers = vis.getLayers();
            if (visLayers && visLayers.length > 1) {
                visLayers[1].setZIndex(9999);
            }

            $scope.$emit('imls:vis:ready', vis, map);
            $scope.$broadcast('imls:vis:ready', vis, map);
        }

        function onFullscreenClicked() {
            ctl.visFullscreen = !ctl.visFullscreen;
        }

        function onVisFullscreenChanged(newValue) {
            var isOpen = !!(newValue);
            // Toggle class on body:
            //  Putting the 'overflow: hidden' on the body automatically hides scrollbars
            // Yes this is ugly but it keeps everything in the controller
            $('body').toggleClass(ctl.visFullscreenClass, isOpen);
            $timeout(function () {
                if (map) {
                    map.invalidateSize();
                }
                if (ctl.visFullscreenOnToggle()) {
                    ctl.visFullscreenOnToggle()(isOpen);
                }
            }, MAP_SLIDE_TRANSITION_MS * 1.2);
        }

        function onPointsLayerFeatureOver() {
            if (demographicsVisible) {
                $('div.cartodb-tooltip .tooltip-points').parent().css('display', 'none');
            }
        }

        function onDemographicsLayerFeatureOver() {
            if (demographicsVisible) {
                $('div.cartodb-tooltip .tooltip-tracts').parent().css('display', 'block');
            }
        }
    }

    /* ngInject */
    function CartoDBVis() {

        var module = {
            restrict: 'E',
            scope: {
                visId: '@',
                visAccount: '@',
                visOptions: '=',
                visFullscreen: '=',
                visFullscreenOnToggle: '&'
                // attrs
                // visFullscreenClass: 'string', class to use for the fullscreen map class
                //                     default: 'map-expanded'
                // demographics: bool, should the demographics layers be shown on the map
                //                     default: false
                // drawControl: bool, should the area analysis draw control be shown on the map
                //                     default: false
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
