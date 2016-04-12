(function () {
    'use strict';

    /** @ngInject */
    function SearchController($log, $q, $scope, $timeout, $modal, $stateParams,
                              Config, Museum) {
        var LOADING_TIMEOUT_MS = 300;
        var SEARCH_DIST_METERS = 1609.34;  // 1 mile

        var ctl = this;
        var homeCtl = $scope.home;
        var searchMarker = null;
        initialize();

        function initialize() {
            // A bit hacky, but the easiest/fastest way to split these out for now
            //  and have them share the intialized map
            if (!homeCtl) {
                throw 'SearchController must be a child of HomeController';
            }

            ctl.rowsPerPage = 10;
            ctl.onDownloadRowClicked = onDownloadRowClicked;
            homeCtl.pageState = homeCtl.states.LOADING;

            var lat = parseFloat($stateParams.lat);
            var lon = parseFloat($stateParams.lon);

            if (!isNaN(lat) && !isNaN(lon)) {
                requestNearbyMuseums({ x: lon, y: lat });
            } else {
                homeCtl.pageState = homeCtl.states.ERROR;
            }
        }

        function onDownloadRowClicked() {
            if (!ctl.list.length) {
                return;
            }
            $modal.open({
                templateUrl: 'scripts/views/download/download-partial.html',
                controller: 'DownloadController',
                controllerAs: 'dl',
                bindToController: true,
                size: 'sm',
                resolve: {
                    datalist: function () {
                        return ctl.list;
                    }
                }
            });
        }

        // position is an object with x and y keys
        function requestNearbyMuseums(position) {
            var timeoutId = $timeout(function () {
                homeCtl.pageState = homeCtl.states.LOADING;
            }, LOADING_TIMEOUT_MS);
            Museum.list(position, SEARCH_DIST_METERS).then(function (rows) {
                if (rows.length) {
                    ctl.list = rows;
                    homeCtl.pageState = homeCtl.states.LIST;
                } else {
                    homeCtl.pageState = homeCtl.states.ERROR;
                }
            }).catch(function (error) {
                $log.error(error);
                homeCtl.pageState = homeCtl.states.ERROR;
            }).finally(function () {
                $timeout.cancel(timeoutId);

                homeCtl.getMap().then(function (map) {
                    map.setView([position.y, position.x], Config.detailZoom);
                    homeCtl.addSearchLocationMarker(position);
                });
            });
        }
    }

    angular.module('imls.views.home')
    .controller('SearchController', SearchController);

})();
