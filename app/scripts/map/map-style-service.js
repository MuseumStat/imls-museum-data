
(function () {
    'use strict';

    var circle = {
        color: '#f6ba46',
        weight: 5,
        fill: true,
        fillColor: '#000000',
        fillOpacity: 0.1,
        clickable: false
    };

    function MapStyle () {
        var module = {
            circle: circle
        };
        return module;
    }

    angular.module('imls.map')
    .service('MapStyle', MapStyle);

})();
