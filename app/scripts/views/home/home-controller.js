
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($cookies, $log, $q, $scope, $geolocation, $state, Config, Geocoder, Museum) {
        var ctl = this;

        var map = null;
        var searchMarker = null;

        var SEARCH_DIST_METERS = 1609.34;  // 1 mile

        initialize();

        function initialize() {
            ctl.list = [];
            ctl.safeList = [];
            ctl.states = {
                DISCOVER: 0,
                LIST: 1,
                ERROR: -1
            };
            ctl.pageState = ctl.states.DISCOVER;
            ctl.rowsPerPage = 10;

            ctl.onLocationClicked = onLocationClicked;
            ctl.onSearchClicked = onSearchClicked;
            ctl.onTypeaheadSelected = onTypeaheadSelected;
            ctl.search = search;
            $scope.$on('imls:vis:ready', function (e, vis, newMap) {
                map = newMap;

                var lastSearched = $cookies.getObject(Config.cookies.LAST_SEARCHED);
                if (lastSearched) {
                    ctl.pageState = ctl.states.LIST;
                    ctl.searchText = lastSearched.text;
                    requestNearbyMuseums(lastSearched.position);
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
            return $q.all([Geocoder.search(text), Museum.suggest(text)]).then(function (results) {
                $log.info(results);
                return _.flatten(results);
            }).catch(function (error) {
                ctl.pageState = ctl.states.ERROR;
                $log.error(error);
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
            map.setView([position.y, position.x], Config.detailZoom);
            addSearchLocationMarker(position);

            Museum.list(position, SEARCH_DIST_METERS).then(function (rows) {
                if (rows.length) {
                    ctl.list = rows;
                    ctl.pageState = ctl.states.LIST;
                    setLastPositionCookie(position);
                } else {
                    ctl.pageState = ctl.states.ERROR;
                }
            }).catch(function (error) {
                $log.error(error);
                ctl.pageState = ctl.states.ERROR;
            });
        }

        function setLastPositionCookie(position) {
            $cookies.putObject(Config.cookies.LAST_SEARCHED, {
                text: ctl.searchText || '',
                position: position
            }, {
                // Set expiry to 12hrs from set time
                expires: new Date(new Date().getTime() + 12 * 3600 * 1000)
            });
        }

        function addSearchLocationMarker(position) {
            clearSearchLocationMarker();
            searchMarker = L.marker([position.y, position.x], {
                clickable: false,
                keyboard: false
            });
            searchMarker.addTo(map);
        }

        function clearSearchLocationMarker() {
            if (searchMarker) {
                map.removeLayer(searchMarker);
                searchMarker = null;
            }
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
