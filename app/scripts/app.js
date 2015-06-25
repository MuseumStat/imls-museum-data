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

    /**
     * @ngdoc overview
     * @name imlsMuseumApp
     * @description
     *
     * Main module of the application.
     */
    angular.module('imls', [
        'imls.config',
        'imls.views.home'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig);
})();