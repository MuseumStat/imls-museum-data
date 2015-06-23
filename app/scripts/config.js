(function() {
    'use strict';

    /**
     * Configuration for imls app
     * @type {Object}
     */
    var config = {
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