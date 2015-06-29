
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, Geocoder) {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.error = false;
            ctl.mapExpanded = false;

            ctl.search = search; 
            ctl.suggest = Geocoder.suggest;
        }

        function search(selection) {
            $log.debug(selection);
            Geocoder.search(selection.text, selection.magicKey)
            .then(function (result) {
                $log.debug(result);
            }).catch(function (error) {
                $log.error(error);
            });
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
