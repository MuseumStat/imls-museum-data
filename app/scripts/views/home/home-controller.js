
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController() {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.error = false;
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);

})();