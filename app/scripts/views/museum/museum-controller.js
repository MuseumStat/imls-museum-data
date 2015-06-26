(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function MuseumController() {

        var ctl = this;

        initialize();

        function initialize() {
        }
    }

    angular.module('imls.views.museum')
    .controller('MuseumController', MuseumController);

})();