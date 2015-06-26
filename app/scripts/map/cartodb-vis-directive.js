

(function () {
    'use strict';

    /* ngInject */
    function VisController($log, $scope, Config) {

        var defaultOptions = {
            shareable: false,
            search: false,
            fullscreen: false
        };
        var ctl = this;
        var url;
        var map;

        initialize();

        function initialize() {
            ctl.visId = ctl.visId || Config.cartodb.visId;
            ctl.visOptions = ctl.visOptions || defaultOptions;
            ctl.visAccount = ctl.visAccount || Config.cartodb.account;
            url = 'https://' + ctl.visAccount + '.cartodb.com/api/v2/viz/' + ctl.visId + '/viz.json';
            cartodb.createVis('map', url, ctl.visOptions).done(onVisReady);
        }

        function onVisReady(vis) {
            map = vis.getNativeMap();
            $scope.$emit('imls:vis:ready', vis, map);
        }
    }

    /* ngInject */
    function CartoDBVis() {

        var template = '' +
            '<div class="map-container">' +
                '<div id="map"></div>' +
            '</div> <!-- /.map-container -->';

        var module = {
            restrict: 'E',
            scope: {
                visId: '@',
                visAccount: '@',
                visOptions: '='
            },
            template: template,
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
