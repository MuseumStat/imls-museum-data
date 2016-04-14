(function () {
    'use strict';

    /** @ngInject */
    function Geo() {
        var module = {
            extent: extent
        };
        return module;

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
            return [[minLat, minLon], [maxLat, maxLon]];
        }
    }

    angular.module('imls.geo')
    .service('Geo', Geo);

})();