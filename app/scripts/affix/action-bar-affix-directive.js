
(function ($) {
    'use strict';

    function ABAffix() {

        var module = {
            restrict: 'A',
            scope: false,
            link: link
        };
        return module;

        function link(scope, element) {

            //caches a jQuery object containing the header element
            var $header = element;
            var mapHeight = $header.parent().find('.map-container').height();
            $(window).scroll(function() {
                var scroll = $(window).scrollTop();

                if (scroll >= mapHeight) {
                    $header.addClass('fixed');
                } else {
                    $header.removeClass('fixed');
                }
            });
        }
    }

    angular.module('imls.affix')
    .directive('actionBarAffix', ABAffix);
})(jQuery);
