
(function () {
    'use strict';

    /* ngInject */
    function Geocoder ($http, $log, $q, Config) {

        // Private variables
        var searchUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';
        var suggestUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest';
        var boundingBox = [
            Config.bounds.southWest.lng,
            Config.bounds.southWest.lat,
            Config.bounds.northEast.lng,
            Config.bounds.northEast.lat
        ].join(',');
        var maxResults = 10;
        var searchCategories = [
            'Street Address',
            'Neighborhood',
            'City',
            'Subregion',
            'Primary Postal'
        ].join(',');

        // Public Interface
        // TODO: Expose the bbox, outFields and categories vars as config options
        var module = {
            /**
             * Perform a geocoder search using some text
             * @param {string} The text string to search
             * @return {array} An array of results
             */
            search: search,

            /**
             * Perform a geocoder suggest, this is faster than search and should be used e.g. to
             *  to fill an autocomplete search box
             *
             * @param {string} The text string to search
             * @return {array} An array of matching strings that relate to the searched text
             */
            suggest: suggest
        };

        return module;

        // Hoisted function definitions

        function search(text, magicKey, options) {
            options = options || {};
            var defaults = {
                text: text,
                bbox: boundingBox,
                category: searchCategories,
                maxLocations: maxResults,
                f: 'pjson'
            };
            var params = angular.extend({}, defaults, options);
            if (magicKey) {
                options.magicKey = magicKey;
            }
            var dfd = $q.defer();
            $http.get(searchUrl, {
                params: params
            }).success(function (data) {
                dfd.resolve(data.locations);
            }).error(function (error) {
                dfd.reject('Error attempting to geocode address.');
                console.error('Geocoder.search(): ', error);
            });
            return dfd.promise;
        }

        function suggest(text) {
            var dfd = $q.defer();
            $http.get(suggestUrl, {
                params: {
                    category: searchCategories,
                    f: 'pjson',
                    searchExtent: boundingBox,
                    text: text
                }
            }).success(function (data) {
                dfd.resolve(suggestToList(data));
            }).error(function (data) {
                dfd.resolve([]);
                console.error('Geocoder.suggest(): ', data);
            });

            return dfd.promise;
        }

        // Helper function transforms response to array of suggested string locations
        function suggestToList(response) {
            var suggestions = _(response.suggestions)
                .filter(function (suggestion) {
                    return suggestion.isCollection === false;
                })
                .map(function (suggestion) {
                    return _.pick(suggestion, ['text', 'magicKey']);
                }).value();
            return suggestions;
        }
    }

    angular.module('imls.geocoder')
    .factory('Geocoder', Geocoder);

})();
