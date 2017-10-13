
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, $q, $scope, $timeout,
                            $geolocation, $state, Config, Geocoder, Museum, StateAbbrev) {
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

            ctl.loadingGeolocation = false;
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
            var loadingGeoTimeout = $timeout(function () { ctl.loadingGeolocation = true}, 150);
            $geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                maximumAge: 0
            }).then(function (position) {
                return Geocoder.reverse(position.coords.longitude, position.coords.latitude);
            }).then(function (data) {
                requestNearbyMuseums(data.feature);
            })
            .catch(function (error) {
                $log.error(error);
                ctl.pageState = ctl.states.ERROR;
            }).finally(function () {
                if (loadingGeoTimeout) {
                    $timeout.cancel(loadingGeoTimeout);
                }
                ctl.loadingGeolocation = false;
            });
        }

        function onSearchClicked() {
            search(ctl.searchText);
        }

        function search(text) {
            ctl.loadingSearch = true;
            return $q.all([Museum.suggest(text), Geocoder.search(text)]).then(function (results) {
                $log.debug(results);
                var museums = results[0];
                var features = _.filter(results[1], function (f) {
                    // Remove county results from geocoder response
                    return f.feature.attributes.Addr_type !== 'SubAdmin';
                });
                angular.forEach(features, function (f) {
                    var addressType = f.feature.attributes.Addr_type;
                    // Clean up name if this is a city feature, shorten state name
                    //  and display county in parenthesis
                    if (addressType === 'Locality') {
                        var subregion = f.feature.attributes.Subregion;
                        var city = f.feature.attributes.City;
                        var state = f.feature.attributes.Region;
                        if (state) {
                            state = StateAbbrev[state.toLowerCase()] || state;
                        }
                        f.name = city + ', ' + state;
                        if (city && subregion && subregion.toLowerCase() !== city.toLowerCase()) {
                            f.name += ' (' + subregion + ')';
                        }
                    }
                });
                return museums.concat(features);
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
            attributes = _.mapValues(attributes, function (v) {
                // Explicitly set undefined for missing attributes, as this resets the $stateParam
                return feature.attributes[v] || undefined;
            });
            $state.go('search', attributes);
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
