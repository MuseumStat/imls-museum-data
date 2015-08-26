
(function () {
    'use strict';

    function Brand() {

        var template = '' +
            '<div class="brand">' +
                '<a class="logo" ui-sref="{{ ::brandLink }}" ui-sref-opts="{reload: true}">' +
                    '<img srcset="/images/2x/museum-stat-logo@2x.png 2x" src="/images/museum-stat-logo.png" >' +
                '</a>' +
            '</div>';
        var module = {
            restrict: 'E',
            scope: {
                brandLink: '@'
            },
            template: template,
            link: {
                // Pre link so we can set the default before DOM compiles
                // If we don't do this, the ui-sref will initially receive 'undefined'
                // and throw an error
                pre: preLink
            }
        };
        return module;

        function preLink(scope) {
            scope.brandLink = scope.brandLink || 'home';
        }
    }

    angular.module('imls.brand')
    .directive('imlsBrand', Brand);
})();
