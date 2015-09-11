
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
            /*var $header = element;
            var navHeight = $header.parent().find('.navbar.action-bar').innerHeight();
            var mapHeight = $header.parent().find('.map-container').innerHeight();*/
            setTimeout(function(){
                var $header = element;
                var navHeight = $header.parent().find('.navbar.action-bar').outerHeight();
                var mapHeight = $header.parent().find('.map-container').outerHeight();

                $(window).scroll(function() {
                    var scroll = $(window).scrollTop();

                    if (scroll >= mapHeight + navHeight) {
                        $header.addClass('fixed');
                    } else {
                        $header.removeClass('fixed');
                    }
                });
            }, 10);
        }
    }

    angular.module('imls.affix')
    .directive('actionBarAffix', ABAffix);
})(jQuery);
