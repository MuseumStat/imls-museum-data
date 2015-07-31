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
        'ngCookies',
        'ngGeolocation',
        'smart-table',
        'ui.router',
        'ui.bootstrap',
        'imls.geocoder',
        'imls.museum',
        'imls.brand',
        'imls.map',
        'imls.views.footer',
        'imls.views.download'
    ])
    .config(StateConfig);
})();
