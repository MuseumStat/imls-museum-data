
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, $q, $scope, $timeout,
                            $geolocation, $modal, $state, Config, Geocoder, Museum) {
        var ctl = this;
        var mapDfd = $q.defer();
        var searchMarker = null;

        initialize();

        function initialize() {
            ctl.list = [];
            ctl.mapExpanded = false;
            ctl.safeList = [];
            ctl.states = {
                DISCOVER: 0,
                LIST: 1,
                LOADING: 2,
                ERROR: -1
            };

            ctl.search = search;
            ctl.onLocationClicked = onLocationClicked;
            ctl.onSearchClicked = onSearchClicked;
            ctl.onTypeaheadSelected = onTypeaheadSelected;
            ctl.getMap = getMap;
            ctl.addSearchLocationMarker = addSearchLocationMarker;
            ctl.clearSearchLocationMarker = clearSearchLocationMarker;

            $scope.$on('imls:vis:ready', function (e, vis, newMap) {
                mapDfd.resolve(newMap);
            });
        }

        function getMap() {
            return mapDfd.promise;
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
            return $q.all([Museum.suggest(text), Geocoder.search(text)]).then(function (results) {
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
                $state.go('museum', {museum: item.id});
            } else if (item.feature) {
                // TODO: Additional handling to pass extent to requestNearbyMuseums?
                requestNearbyMuseums(item.feature.geometry);
            } else {
                $log.error('No valid handlers for typeahead item:', item);
                ctl.pageState = ctl.states.ERROR;
            }
        }

        function requestNearbyMuseums(position) {
            if (position && position.x && position.y) {
                $state.go('search', {lat: position.y, lon: position.x });
            }
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
            getMap().then(function (map) {
                searchMarker.addTo(map);
            });
        }

        function clearSearchLocationMarker() {
            if (searchMarker) {
                getMap().then(function (map) {
                    map.removeLayer(searchMarker);
                    searchMarker = null;
                });
            }
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
