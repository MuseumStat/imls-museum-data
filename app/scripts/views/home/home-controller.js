
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function HomeController($log, $scope, $timeout) {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.error = false;
            ctl.mapExpanded = false;
        }
    }

    angular.module('imls.views.home')
    .controller('HomeController', HomeController);
})();
