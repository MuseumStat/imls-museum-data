
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
                requestNearbyMuseums(item.feature);
            } else {
                $log.error('No valid handlers for typeahead item:', item);
                ctl.pageState = ctl.states.ERROR;
            }
        }

        function requestNearbyMuseums(feature) {
            var attributes = { 'city': 'City', 'state': 'Region', 'zip': 'Postal' };
            attributes = _(attributes)
                .mapValues(function (v) { return feature.attributes[v]; })
                .pick(function (v) { return !!(v); })
                .value();
            $state.go('search', attributes);
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
