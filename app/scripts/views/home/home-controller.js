
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
            ctl.helloWorld = 'Hello World';
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);

})();