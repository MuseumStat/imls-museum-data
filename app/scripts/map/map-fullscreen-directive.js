/**
 */
(function () {
    'use strict';

    var MAP_SLIDE_TRANSITION_MS = 400;

    /* ngInject */
    function fullScreen($timeout) {

        var module = {
            restrict: 'A',
            scope: {
                fullscreen: '=',
                fullscreenMap: '=',
                fullscreenOnMapExpanded: '&'
            },
            link: link
        };
        return module;

        function link(scope, element, attrs) {

            var $fullscreen = $('<div class="cartodb-fullscreen"><a></a></div>');
            element.append($fullscreen);
            var fullscreenClass = attrs.fullscreenClass || 'map-expanded';

            $fullscreen.click(function () {
                scope.fullscreen = !scope.fullscreen;
                scope.$apply();
            });

            scope.$watch('fullscreen', function (newValue) {
                var isOpen = !!(newValue);
                // Toggle class on body:
                //  Putting the 'overflow: hidden' on the body automatically hides scrollbars
                $('body').toggleClass(fullscreenClass, isOpen);
                $timeout(function () {
                    scope.fullscreenMap.invalidateSize();
                    if (scope.fullscreenOnMapExpanded()) {
                        scope.fullscreenOnMapExpanded()(isOpen);
                    }
                }, MAP_SLIDE_TRANSITION_MS * 1.5);
            });
        }
    }

    angular.module('imls.map')
    .directive('fullscreen', fullScreen);

})();