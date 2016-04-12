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
    function run($rootScope) {
        // Sometimes the museum data isn't ready in the cartodb popup, which allows a transition
        //  to the museum page before we have the museum id. This just prevents that change while
        //  we don't have a museum id
        $rootScope.$on('$stateChangeStart', function (event, to, toParams) {
            if (to.name === 'museum' && !toParams.museum) {
                event.preventDefault();
            }
        });
    }

    angular.module('imls.views.museum', [
        'ngCookies',
        'rt.resize',
        'ui.router',
        'imls.acs',
        'imls.affix',
        'imls.brand',
        'imls.map',
        'imls.museum',
        'imls.views.footer'
    ])
    .config(StateConfig)
    .run(run);
})();
