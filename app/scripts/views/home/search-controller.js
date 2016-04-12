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

            var city = $stateParams.city || '';
            var state = $stateParams.state || '';
            var zip = $stateParams.zip || '';
            ctl.nearText = zip || city || state;

            if (city || state || zip) {
                requestNearbyMuseums(Museum.listByCity, {
                    city: city,
                    state: state,
                    zip: zip
                });
            } else {
                setErrorState();
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

        function requestNearbyMuseums(func, params) {
            var timeoutId = $timeout(function () {
                homeCtl.pageState = homeCtl.states.LOADING;
            }, LOADING_TIMEOUT_MS);
            func(params).then(function (rows) {
                if (rows.length) {
                    ctl.list = rows;
                    var extent = extentForList(ctl.list);
                    homeCtl.getMap().then(function (map) {
                        map.fitBounds(extent);
                    });
                    homeCtl.pageState = homeCtl.states.LIST;
                } else {
                    setErrorState();
                }
            }).catch(function (error) {
                setErrorState(error);
            }).finally(function () {
                $timeout.cancel(timeoutId);
            });
        }

        function setErrorState(error) {
            homeCtl.pageState = homeCtl.states.ERROR;
            if (error) {
                $log.error(error);
            }
            homeCtl.getMap().then(function (map) {
                var bounds = [
                    [Config.bounds.southWest.lat, Config.bounds.southWest.lng],
                    [Config.bounds.northEast.lat, Config.bounds.northEast.lng]
                ];
                map.fitBounds(bounds);
            });
        }

        function extentForList(museumList) {
            if (!(museumList && museumList.length)) {
                return null;
            }
            var minLat = museumList[0].latitude;
            var maxLat = museumList[0].latitude;
            var minLon = museumList[0].longitude;
            var maxLon = museumList[0].longitude;
            angular.forEach(museumList, function (m) {
                if (m.latitude < minLat) {
                    minLat = m.latitude;
                }
                if (m.latitude > maxLat) {
                    maxLat = m.latitude;
                }
                if (m.longitude < minLon) {
                    minLon = m.longitude;
                }
                if (m.longitude > maxLon) {
                    maxLon = m.longitude;
                }
            });
            return [[minLat, minLon], [maxLat, maxLon]];
        }
    }

    angular.module('imls.views.home')
    .controller('SearchController', SearchController);

})();
