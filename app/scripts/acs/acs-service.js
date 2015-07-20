
(function () {
    'use strict';

    /* ngInject */
    function ACS ($log, $http, $q, Config, ACSVariables, Util) {

        var cartodbsql = new cartodb.SQL({ user: Config.cartodb.account });
        var cols = {
            id: 'cartodb_id',
            state: 'state_fips',
            county: 'cnty_fips',
            tract: 'tract',
            geom: 'the_geom'
        };
        var acsUrl = 'http://api.census.gov/data/2013/acs5';

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

        function getACSData(where) {
            var queryTemplate = [
                'SELECT {state} as state, {county} as county, {tract} as tract ',
                'FROM {tablename} ',
                'WHERE ',
                where,
            ].join('');
            var query = Util.strFormat(queryTemplate, {
                tablename: Config.cartodb.tractsTableName,
                geom: cols.geom,
                state: cols.state,
                county: cols.county,
                tract: cols.tract,
                srid: 4326
            });

            return Util.makeRequest(cartodbsql, query)
            .then(function (result) {
                var tractGroups = _(result).groupBy(function (tract) { // group by state+county
                    return 'state:' + tract.state + '+county:' + tract.county;
                }).mapValues(function (tracts) { // tract objects to comma delimited values
                    return _.map(tracts, function (tract) { return tract.tract; }).join(',');
                }).value();

                var acsQueries = [];
                var acsQueries = _.map(tractGroups, function (value, key) {
                    return $http.get(acsUrl, {
                        cache: true,
                        params: {
                            get: _.keys(ACSVariables).join(','), 
                            for: 'tract:' + value,
                            in: key
                        }
                    });
                });
                return $q.all(acsQueries);
            // Transform data into json object with all data from multiple results aggregated 
            //  into a single array
            }).then(function (results) {
                var allData = _.reduce(results, function (total, n) {
                    return total.concat(n.data.slice(1));
                }, []);
                var data = {
                    headers: results.length ? results[0].data[0] : [],
                    data: allData
                };
                return data;
            });
        }

        function getRadius(x, y, radius) {
            return getACSData(radiusWhere(x, y, radius));
        }

        function getPolygon(points) {
            return getACSData(polygonWhere(points));
        }
    }

    angular.module('imls.acs')
    .service('ACS', ACS);

})();
