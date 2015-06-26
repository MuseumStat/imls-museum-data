(function() {
    'use strict';

    /**
     * Configuration for imls app
     * @type {Object}
     */
    var config = {
        cartodb: {
            visId: 'a4ed4438-ffec-11e4-8b9a-0e9d821ea90d',
            account: 'azavea-demo'
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