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
            visId: 'a4ed4438-ffec-11e4-8b9a-0e9d821ea90d',
            account: 'azavea-demo',
            tableName: 'mudf15q1int',
            tractsTableName: 'seattle_area_tracts'
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
