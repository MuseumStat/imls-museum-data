
(function() {
    'use strict';

    /**
     * Controller for the imls app home view
     */
    /* ngInject */
    function AboutController() {

        var ctl = this;

        initialize();

        function initialize() {
        }
    }

    angular.module('imls.views.about')
    .controller('AboutController', AboutController);

})();