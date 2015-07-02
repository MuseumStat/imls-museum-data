
(function () {
    'use strict';

    /* ngInject */
    function Museum ($log, $q, Config) {

        var strFormatRegex = new RegExp('{(.*?)}', 'g');

        var suggestTemplate = [
            'SELECT {id} as id, {name} as name, ',
                'ST_X({geom}) as longitude, ',
                'ST_Y({geom}) as latitude, true as ismuseum ',
            'FROM {tablename} ',
            'WHERE ',
                '{name} ILIKE \'%{text}%\' or ',
                '{legalname} ILIKE \'%{text}%\' or ',
                '{altname} ILIKE \'%{text}%\'',
            'LIMIT {limit}'
        ].join('');
        var listTemplate = [
            'SELECT cartodb_id, commonname, adaddress, adcity, adstate, revenue, discipl ',
            'FROM {tablename} ',
            'WHERE ST_DWithin({geom}, ST_SetSRID(ST_MakePoint({x}, {y}), {srid}), {radius})'
        ].join('');

        var sql = new cartodb.SQL({ user: Config.cartodb.account });
        var cols = {
            id: 'cartodb_id',
            name: 'commonname',
            altname: 'altname',
            legalname: 'legalname',
            geom: 'the_geom'
        };

        var module = {
            suggest: suggest,
            list: list
        };

        return module;

        /**
         * Suggest museums with names matching text
         * @param  {string} text
         * @return {promise}      resolved with array of database results, or error
         */
        function suggest(text) {
            var query = strFormat(suggestTemplate, {
                tablename: Config.cartodb.tableName,
                id: cols.id,
                name: cols.name,
                altname: cols.altname,
                legalname: cols.legalname,
                geom: cols.geom,
                limit: Config.typeahead.results,
                text: text
            });
            return makeRequest(query);
        }

        /**
         * List all museums within a given radius of position
         * @param  {object} position object with x and y keys, in lat/lon decimal degrees
         * @param  {float} radius    radius to pull results, in decimal degrees
         * @return {promise}         resolves with array of database results, or error
         */
        function list(position, radius) {
            var query = strFormat(listTemplate, {
                tablename: Config.cartodb.tableName,
                geom: cols.geom,
                x: position.x,
                y: position.y,
                srid: 4326,
                radius: radius
            });
            return makeRequest(query);
        }

        function makeRequest(query) {
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
    }

    angular.module('imls.museum')
    .factory('Museum', Museum);

})();
