(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, Config) {

        $locationProvider.html5Mode(Config.html5Mode.enabled);
        $locationProvider.hashPrefix(Config.html5Mode.prefix);

        $urlRouterProvider.otherwise('/');
    }

    /* ngInject */
    function LogConfig($logProvider, Config) {
        $logProvider.debugEnabled(Config.debug);
    }

    /* ngInject */
    function run($rootScope, $window) {
        // Always reset scroll to top on state change
        $rootScope.$on('$stateChangeSuccess', function () {
            $window.scrollTo(0,0);
        });


        // monkeypatch leaflet draw
        L.GeometryUtil.readableArea = function (area) {
            // bypass all metric/yds/acres/miles logic and just return
            // square miles
            area /= 0.836127; // Square yards in 1 meter
            return (area / 3097600).toFixed(2) + ' mi&sup2;';
        };
        L.GeometryUtil.readableDistance = function (distance) {
            // just return miles
            distance *= 1.09361; // to yards
            return (distance / 1760).toFixed(2) + ' miles';
        };
    }

    /**
     * @ngdoc overview
     * @name imlsMuseumApp
     * @description
     *
     * Main module of the application.
     */
    angular.module('imls', [
        'imls.config',
        'imls.views.home',
        'imls.views.about',
        'imls.views.contact',
        'imls.views.help',
        'imls.views.museum'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig)
    .run(run);
})();
