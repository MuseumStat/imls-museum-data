(function() {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('home', {
            abstract: true,
            templateUrl: 'scripts/views/home/home-partial.html',
            controller: 'HomeController',
            controllerAs: 'home'
        });
        $stateProvider.state('discover', {
            parent: 'home',
            url: '/',
            templateUrl: 'scripts/views/home/discover-partial.html',
            controller: 'DiscoverController',
            controllerAs: 'discover'
        });
        $stateProvider.state('search', {
            parent: 'home',
            url: '/search?city&state&zip',
            templateUrl: 'scripts/views/home/search-partial.html',
            controller: 'SearchController',
            controllerAs: 'search'
        });

    }

    angular.module('imls.views.home', [
        'ngGeolocation',
        'smart-table',
        'ui.router',
        'ui.bootstrap',
        'imls.geo',
        'imls.geocoder',
        'imls.museum',
        'imls.brand',
        'imls.map',
        'imls.views.footer',
        'imls.views.download'
    ])
    .config(StateConfig);
})();
