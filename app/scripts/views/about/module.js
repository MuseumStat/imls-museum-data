(function() {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('about', {
            url: '/about',
            templateUrl: 'scripts/views/about/about-partial.html',
            controller: 'AboutController',
            controllerAs: 'about'
        });
    }

    angular.module('imls.views.about', [
        'ui.router',
        'imls.views.footer'
    ])
    .config(StateConfig);
})();