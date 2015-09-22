(function() {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('help', {
            url: '/help',
            templateUrl: 'scripts/views/help/help-partial.html',
            controller: 'HelpController',
            controllerAs: 'help'
        });
    }

    angular.module('imls.views.help', [
        'ui.router',
        'imls.brand',
        'imls.views.footer'
    ])
    .config(StateConfig);
})();
