(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController($window) {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.onPrintClicked = onPrintClicked;
        }

        function onPrintClicked() {
            $window.print();
        }
    }

    angular.module('imls.views.museum')
    .controller('MuseumController', MuseumController);

})();