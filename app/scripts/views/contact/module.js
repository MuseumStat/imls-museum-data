(function() {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('contact', {
            url: '/contact',
            templateUrl: 'scripts/views/contact/contact-partial.html',
            controller: 'ContactController',
            controllerAs: 'contact'
        });
    }

    angular.module('imls.views.contact', [
        'ui.router',
        'imls.brand',
        'imls.views.footer'
    ])
    .config(StateConfig);
})();