
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, $q, $geolocation, Geocoder, Museum) {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.error = false;
            ctl.mapExpanded = false;

            ctl.onLocationClicked = onLocationClicked;
            ctl.onSearchClicked = onSearchClicked;
            ctl.search = search;
            ctl.suggest = suggest;
        }

        function onLocationClicked() {
            $geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                maximumAge: 0
            }).then(requestNearbyMuseums)
            .catch(function (error) {
                $log.error(error);
                ctl.error = true;
            });
        }

        function onSearchClicked() {
            search({
                text: ctl.searchText,
                magicKey: null
            });
        }

        function suggest(item) {
            var dfd = $q.defer();
            ctl.error = false;
            Geocoder.suggest(item).then(function(results) {
                if (!results.length) {
                    ctl.error = true;
                }
                dfd.resolve(results);
            }).catch(function (error) {
                ctl.error = true;
                dfd.reject(error);
            });
            return $q.all([dfd.promise, Museum.suggest(item)]).then(function (results) {
                console.log(results);
                return _.flatten(results);
            });
        }

        function search(selection) {
            $log.debug(selection);
            if (selection.ismuseum) {
                $log.debug('selection is museum');
                return;
            }
            Geocoder.search(selection.text, selection.magicKey)
            .then(function (result) {
                if (result.length) {
                    $log.debug(result);
                } else {
                    ctl.error = true;
                }
            }).catch(function (error) {
                ctl.error = true;
                $log.error(error);
            });
        }

        function requestNearbyMuseums(position) {
            $log.info(position);
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
