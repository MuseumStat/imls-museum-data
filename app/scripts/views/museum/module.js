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

    /* ngInject */
    function FactualConfig(FactualAPIProvider, Config) {
        FactualAPIProvider.setKey(Config.factual.apiKey);
    }

    angular.module('imls.views.museum', [
        'ui.router',
        'ui.bootstrap',
        'imls.config',
        'api.factual',
        'imls.acs',
        'imls.affix',
        'imls.brand',
        'imls.map',
        'imls.museum',
        'imls.views.footer'
    ])
    .config(StateConfig)
    .config(FactualConfig);
})();
