
(function () {
    'use strict';

    /* ngInject */
    function Util ($log, $q) {

        var strFormatRegex = new RegExp('{(.*?)}', 'g');

        var module = {
            strFormat: strFormat,
            makeRequest: makeRequest,
            radiusWhere: radiusWhere,
            polygonWhere: polygonWhere
        };

        return module;

        function makeRequest(sql, query) {
            $log.info(query);
            var dfd = $q.defer();
            sql.execute(query).done(function (data) {
                dfd.resolve(data.rows);
            }).error(function (error) {
                dfd.reject(error);
            });
            return dfd.promise;
        }

        function strFormat(str, params) {
            if (!params) {
                return;
            }
            return str.replace(strFormatRegex, function (m, n) {
                var val = params[n];
                return (typeof val === 'function') ? val() : val;
            });
        }

        /**
         * Returns a where clause that selects a radius around a point.
         * Return value contains {geom} token to be replaced with geometry
         * column name.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} radius radius in meters
         * @return {string} SQL containing a {geom} token to replaced with
         *     geometry column name
         */
        function radiusWhere(x, y, radius) {
            return [
                'ST_DWithin(ST_SetSRID(ST_Point(', x, ',', y, '), {srid})::geography, {geom}, ', radius, ')'
            ].join('');
        }

        /**
         * Return a where clause that selects a polygon of given points.
         * @param {Array} Array of lat lng arrays
         * @return {string} SQL containing a {geom} token to be replaced with
         *     geometry column name
         */
        function polygonWhere(points) {
            return [
                '{geom} && ',
                'ST_Polygon(ST_GeomFromText(\'LINESTRING(',
                    _.map(points, function (point) { return point.join(' '); })
                        .join(', '),
                ')\'), {srid})'
            ].join('');
        }
    }

    angular.module('imls.util')
    .service('Util', Util);

})();
