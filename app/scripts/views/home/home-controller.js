
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, $q, $geolocation, Geocoder, Museum) {
        var ctl = this;

        var SEARCH_DIST_DECIMAL_DEGREES = 0.1;

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
            Museum.list(position, SEARCH_DIST_DECIMAL_DEGREES).then(function (rows) {
                if (rows.length) {
                    ctl.list = rows;
                    ctl.pageState = ctl.states.LIST;
                } else {
                    ctl.pageState = ctl.states.ERROR;
                }
            }).catch(function (error) {
                $log.error(error);
                ctl.pageState = ctl.states.ERROR;
            });

        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
