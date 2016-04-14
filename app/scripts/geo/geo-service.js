(function () {
    'use strict';

    /** @ngInject */
    function Geo() {
        var module = {
            extent: extent
        };
        return module;

        /**
         * Takes array of objects with latitude and longitude properties, and generates
         * an extent of the form [[minLat, minLon], [maxLat, maxLon]];
         */
        function extent(list) {
            if (!(list && list.length)) {
                return null;
            }
            var minLat = null;
            var maxLat = null;
            var minLon = null;
            var maxLon = null;
            angular.forEach(list, function (m) {
                if (_.isNumber(m.latitude) && (m.latitude < minLat || minLat === null)) {
                    minLat = m.latitude;
                }
                if (_.isNumber(m.latitude) && (m.latitude > maxLat || maxLat === null)) {
                    maxLat = m.latitude;
                }
                if (_.isNumber(m.longitude) && (m.longitude < minLon || minLon === null)) {
                    minLon = m.longitude;
                }
                if (_.isNumber(m.longitude) && (m.longitude > maxLon || maxLon === null)) {
                    maxLon = m.longitude;
                }
            });
            if (minLat === null || maxLat === null || minLon === null || maxLon === null) {
                return null;
            }
            return [[minLat, minLon], [maxLat, maxLon]];
        }
    }

    angular.module('imls.geo')
    .service('Geo', Geo);

})();