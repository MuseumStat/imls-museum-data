
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
            setTimeout(function(){
                var $header = element;
                var navHeight = $('body').find('.navbar.action-bar').outerHeight();
                var mapHeight = $('body').find('.map-container').outerHeight();

                $(window).scroll(function() {
                    var scroll = $(window).scrollTop();

                    if (scroll >= mapHeight + navHeight) {
                        $header.addClass('fixed');
                    } else {
                        $header.removeClass('fixed');
                    }
                });
            }, 0);
        }
    }

    angular.module('imls.affix')
    .directive('actionBarAffix', ABAffix);
})(jQuery);
