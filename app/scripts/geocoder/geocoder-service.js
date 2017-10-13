
(function () {
    'use strict';

    /* ngInject */
    function Geocoder ($http, $log, $q, Config) {

        // Private variables
        var searchUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';
        var suggestUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest';
        var reverseUrl = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';
        var boundingBox = [
            Config.bounds.southWest.lng,
            Config.bounds.southWest.lat,
            Config.bounds.northEast.lng,
            Config.bounds.northEast.lat
        ].join(',');
        var maxResults = 10;
        var sourceCountry = 'USA';
        var searchCategories = [
            'Street Address',
            'Neighborhood',
            'City',
            'Subregion',
            'Primary Postal'
        ].join(',');
        var outFields = [
            'City',
            'Region',
            'Subregion',
            'Postal',
            'Addr_type'
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
            suggest: suggest,

            /**
             * Perform a geocoder reverse, by taking a lat/lon and returning a nearby street address
             * Returns a feature object of the same form as the search endpoint
             *
             * @param {number} lat latitude to search
             * @param {number} lon longitude to search
             * @param {object} options Additional options to directly pass through to the
             *                         ESRI reverse geocode request
             *
             */
            reverse: reverse
        };

        return module;

        // Hoisted function definitions

        function search(text, magicKey, options) {
            options = options || {};
            var defaults = {
                text: text,
                bbox: boundingBox,
                outFields: outFields,
                category: searchCategories,
                maxLocations: maxResults,
                sourceCountry: sourceCountry,
                f: 'pjson'
            };
            var params = angular.extend({}, defaults, options);
            if (magicKey) {
                params.magicKey = magicKey;
            }
            var dfd = $q.defer();
            $http.get(searchUrl, {
                params: params
            }).then(function (data) {
                dfd.resolve(data.locations);
            }, function (error) {
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
            }).then(function (data) {
                dfd.resolve(suggestToList(data));
            }, function (data) {
                dfd.resolve([]);
                console.error('Geocoder.suggest(): ', data);
            });

            return dfd.promise;
        }

        function reverse(lon, lat, options) {
            var defaults = {
                location: [lon, lat].join(','),
                f: 'json'
            };
            var opts = angular.extend({}, defaults, options);
            return $http.get(reverseUrl, {
                params: opts
            }).then(function (result) {
                return {
                    feature: {
                        attributes: result.data.address || {},
                        geometry: result.data.location || {}
                    }
                };
            });
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
