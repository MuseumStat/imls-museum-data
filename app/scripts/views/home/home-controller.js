
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($cookies, $log, $q, $scope, $timeout,
                            $geolocation, $modal, $state,
                            Config, Geocoder, Museum) {
        var ctl = this;

        var map = null;
        var searchMarker = null;
        var LOADING_TIMEOUT_MS = 300;

        var SEARCH_DIST_METERS = 1609.34;  // 1 mile

        initialize();

        function initialize() {
            ctl.list = [];
            ctl.safeList = [];
            ctl.states = {
                DISCOVER: 0,
                LIST: 1,
                LOADING: 2,
                ERROR: -1
            };
            ctl.pageState = ctl.states.DISCOVER;
            ctl.rowsPerPage = 10;

            ctl.onLocationClicked = onLocationClicked;
            ctl.onSearchClicked = onSearchClicked;
            ctl.onTypeaheadSelected = onTypeaheadSelected;
            ctl.onDownloadRowClicked = onDownloadRowClicked;
            ctl.search = search;
            $scope.$on('imls:vis:ready', function (e, vis, newMap) {
                map = newMap;

                var lastSearched = $cookies.getObject(Config.cookies.LAST_SEARCHED);
                if (lastSearched) {
                    ctl.pageState = ctl.states.LIST;
                    ctl.searchText = lastSearched.text;
                    requestNearbyMuseums(lastSearched.position);
                    $cookies.remove(Config.cookies.LAST_SEARCHED);
                }
            });
        }

        function onLocationClicked() {
            $geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                maximumAge: 0
            }).then(function (position) {
                requestNearbyMuseums({
                    x: position.coords.longitude,
                    y: position.coords.latitude
                });
            })
            .catch(function (error) {
                $log.error(error);
                ctl.pageState = ctl.states.ERROR;
            });
        }

        function onSearchClicked() {
            search(ctl.searchText);
        }

        function search(text) {
            ctl.loadingSearch = true;
            return $q.all([Geocoder.search(text), Museum.suggest(text)]).then(function (results) {
                $log.info(results);
                return _.flatten(results);
            }).catch(function (error) {
                ctl.pageState = ctl.states.ERROR;
                $log.error(error);
            }).finally(function () {
                ctl.loadingSearch = false;
            });
        }

        function onTypeaheadSelected(item) {
            if (item.ismuseum) {
                requestNearbyMuseums({
                    x: item.longitude,
                    y: item.latitude
                });
            } else if (item.feature) {
                // TODO: Additional handling to pass extent to requestNearbyMuseums?
                requestNearbyMuseums(item.feature.geometry);
            } else {
                $log.error('No valid handlers for typeahead item:', item);
                ctl.pageState = ctl.states.ERROR;
            }
        }

        // position is an object with x and y keys
        function requestNearbyMuseums(position) {
            var timeoutId = $timeout(function () {
                ctl.pageState = ctl.states.LOADING;
            }, LOADING_TIMEOUT_MS);
            Museum.list(position, SEARCH_DIST_METERS).then(function (rows) {
                if (rows.length) {
                    ctl.list = rows;
                    ctl.pageState = ctl.states.LIST;
                } else {
                    ctl.pageState = ctl.states.ERROR;
                }
            }).catch(function (error) {
                $log.error(error);
                ctl.pageState = ctl.states.ERROR;
            }).finally(function () {
                $timeout.cancel(timeoutId);

                map.setView([position.y, position.x], Config.detailZoom);
                addSearchLocationMarker(position);
            });
        }

        function addSearchLocationMarker(position) {
            clearSearchLocationMarker();
            var icon = L.icon({
                iconUrl: 'images/map-marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            });
            searchMarker = L.marker([position.y, position.x], {
                clickable: false,
                keyboard: false,
                icon: icon
            });
            searchMarker.addTo(map);
        }

        function clearSearchLocationMarker() {
            if (searchMarker) {
                map.removeLayer(searchMarker);
                searchMarker = null;
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
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
