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
        'imls.views.museum'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig)
    .run(run);
})();
