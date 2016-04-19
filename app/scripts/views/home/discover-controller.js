(function () {
    'use strict';

    /** @ngInject */
    function DiscoverController($log, $scope, Config) {
        var ctl = this;
        var homeCtl = $scope.home;
        initialize();

        function initialize() {
            // A bit hacky, but the easiest/fastest way to split these out for now
            //  and have them share the intialized map
            if (!homeCtl) {
                throw 'SearchController must be a child of HomeController';
            }

            homeCtl.pageState = homeCtl.states.DISCOVER;
            homeCtl.getMap().then(function (map) {
                var bounds = [
                    [Config.bounds.southWest.lat, Config.bounds.southWest.lng],
                    [Config.bounds.northEast.lat, Config.bounds.northEast.lng]
                ];
                map.fitBounds(bounds);
            });
        }
    }

    angular.module('imls.views.home')
    .controller('DiscoverController', DiscoverController);

})();
