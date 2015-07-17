
(function () {
    'use strict';

    /* ngInject */
    function ACS ($log, $q, Config) {

        var strFormatRegex = new RegExp('{(.*?)}', 'g');

        var cartodbsql = new cartodb.SQL({ user: Config.cartodb.account });
        var cols = {
            id: 'cartodb_id',
            state: 'state_fips',
            county: 'cnty_fips',
            tract: 'tract',
            geom: 'the_geom'
        };

        var module = {
            getPolygon: getPolygon,
            getRadius: getRadius
        };

        return module;

        /**
         * Returns a where clause that selects a radius around a point.
         * Return value contains {geom} token to be replaced with geometry
         * column name.
         * @param {Number} x
         * @param {Number} y
         * @param radius
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

        function getACSData(where) {
            var queryTemplate = [
                'SELECT {state} as state, {county} as county, {tract} as tract ',
                'FROM {tablename} ',
                'WHERE ',
                where,
            ].join('');
            var query = strFormat(queryTemplate, {
                tablename: Config.cartodb.acsTableName,
                geom: cols.geom,
                state: cols.state,
                county: cols.county,
                tract: cols.tract,
                srid: 4326
            });
            return makeRequest(query).then(function (result) {
                var tractGroups = _(result).groupBy(function (tract) { // group by state+county
                    return 'state:' + tract.state + '+county:' + tract.county;
                }).mapValues(function (tracts) { // tract objects to comma delimited values
                    return _.map(tracts, function (tract) { return tract.tract; }).join(',');
                }).value();
                $log.debug(tractGroups);
                // TODO: query census api and return data
            });
        }

        function getRadius(x, y, radius) {
            return getACSData(radiusWhere(x, y, radius));
        }

        function getPolygon(points) {
            return getACSData(polygonWhere(points));
        }

        function makeRequest(query) {
            $log.info(query);
            var dfd = $q.defer();
            cartodbsql.execute(query).done(function (data) {
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
    }

    angular.module('imls.acs')
    .service('ACS', ACS);

})();
