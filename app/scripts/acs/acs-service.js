
(function () {
    'use strict';

    /* ngInject */
    function ACS ($log, $http, $q, Config, ACSPopWeightedVars, ACSVariables, Util) {

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

        /**
         * Retrieve, filter and transform ACS data into a useful, aggregated format for our purposes
         *
         * The response from this function call will take the form:
         * {
         *     'ACSVariable': {
         *         sum: number,     // Sum of all tracts in response
         *         avg: number,     // Avg of all tracts in response
         *         popAvg: number   // Population weighted avg of all tracts in response
         *     },
         *     ...
         * }
         *
         * @param  {string} where Valid sql where clause used for filtering the requested data
         * @return {promise}      Promise which resolves to an object of the format described above
         */
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
            // Transform tracts into objects, with requested variables as properties
            // Then aggregate sum, avg, and popAvg
            }).then(function (results) {
                var rawData = _.drop(results[0].data);
                var headers = _.first(results[0].data);
                var tractData = _.map(rawData, _.zipObject.bind(null, headers));

                return _.chain(_.without(headers, 'state', 'county', 'tract')).map(function (varName) {
                    var result = {};
                    var length;

                    result.sum = _.chain(tractData)
                                    .pluck(varName)
                                    .map(parseFloat)
                                    .filter(_.isFinite)
                                    .tap(function (val) { length = val.length; })
                                    .reduce(_.add, 0)
                                    .value();

                    result.avg = result.sum / length;

                    if (ACSPopWeightedVars[varName]) {
                        // multiply each value by the population for that tract
                        // then, sum and divide by the total population
                        result.popAvg = _.chain(_.pluck(tractData, varName))
                                        .zip(_.pluck(tractData, ACSPopWeightedVars[varName]))
                                        .map(function (d) { return [parseFloat(d[0]),
                                                                    parseFloat(d[1])]; })
                                        .filter(function (d) { return (_.isFinite(d[0]) &&
                                                                       _.isFinite(d[1])); })
                                        // index 0 is data * pop, index 1 is pop
                                        .map(function (d) { return [d[0] * d[1], d[1]]; })
                                        .reduce(function (res, n) {
                                            // sum values and population separately
                                            return [res[0] + n[0], res[1] + n[1]];
                                        }, [0, 0])
                                        // divide summed value by total population
                                        .thru(function (val) { return val[0] / val[1]; })
                                        .value();
                    }

                    return [varName, result];
                }).zipObject().value();

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
