(function() {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('home', {
            url: '/',
            templateUrl: 'scripts/views/home/home-partial.html',
            controller: 'HomeController',
            controllerAs: 'home'
        });
    }

    angular.module('imls.views.home', [
        'ui.router',
        'imls.geocoder',
        'imls.brand',
        'imls.map',
        'imls.views.footer'
    ])
    .config(StateConfig);
})();
