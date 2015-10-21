
(function () {
    'use strict';

    function Footer () {
        var module = {
            restrict: 'E',
            scope: true,
            templateUrl: 'scripts/views/footer/footer-partial.html'
        };
        return module;
    }

    angular.module('imls.views.footer')
    .directive('imlsFooter', Footer);

})();
