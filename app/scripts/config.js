(function() {
    'use strict';

    /**
     * Configuration for imls app
     * @type {Object}
     */
    var config = {
        bounds: {
            northEast: {
                lat: 49.384,
                lng: -66.8854
            },
            southWest: {
                lat: 24.3963,
                lng: -124.849
            }
        },
        cookies: {
            LAST_SEARCHED: 'imls:lastsearched'
        },
        detailZoom: 14,
        cartodb: {
            visId: '53d43566-4ff1-11e5-93fd-0e9d821ea90d',
            account: 'museumstat',
            tableName: 'mudf15q3pub',
            tractsTableName: 'tracts',
            demographicVisUrl: 'https://museumstat.cartodb.com/api/v2/viz/fef9775c-4ff7-11e5-b0ab-0e4fddd5de28/viz.json'
        },
        // :site: will be replaced with each value of socialSites
        socialColumn: ':site:_url',
        // The sites to pull factual social media urls from.
        //  these strings should be a subset of the options available here:
        //  http://developer.factual.com/places-crosswalk/#namespaces
        // The cartodb table for this app must then have a socialColumn manually added for
        //  each entry here, with the column name equal to the value used in socialColumn
        socialSites: [
            'facebook',
            'twitter',
            'google_plus',
            'wikipedia',
            'yelp',
            'pinterest',
            'foursquare'
        ],
        typeahead: {
            results: 10
        },
        // Configures various items in the app based on whether we are debugging or not
        debug: true,
        // Configuration for html5 mode
        html5Mode: {
            enabled: false,
            prefix: ''
        }
    };

    angular.module('imls.config', [])
    .constant('Config', config);

})();
