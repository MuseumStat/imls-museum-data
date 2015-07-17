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
        cartodb: {
            visId: 'a4ed4438-ffec-11e4-8b9a-0e9d821ea90d',
            account: 'azavea-demo',
            tableName: 'mudf15q1int',
            tractsTableName: 'seattle_area_tracts'
        },
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
