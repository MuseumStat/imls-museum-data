(function() {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('museum', {
            url: '/museum/:museum/',
            templateUrl: 'scripts/views/museum/museum-partial.html',
            controller: 'MuseumController',
            controllerAs: 'museum'
        });
    }

    angular.module('imls.views.museum', [
        'ui.router',
        'ui.bootstrap',
        'imls.brand',
        'imls.views.footer'
    ])
    .config(StateConfig);
})();