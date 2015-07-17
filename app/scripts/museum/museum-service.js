
(function () {
    'use strict';

    /* ngInject */
    function Museum ($log, $q, Config, Util) {

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
            'WHERE ST_DWithin({geom}::geography, ST_SetSRID(ST_MakePoint({x}, {y}), {srid})::geography, {radius}) ',
            'ORDER BY ',
            '  ST_Distance({geom}::geography, ST_SetSRID(ST_MakePoint({x}, {y}), {srid})::geography)'
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
            var query = Util.strFormat(suggestTemplate, {
                tablename: Config.cartodb.tableName,
                id: cols.id,
                name: cols.name,
                altname: cols.altname,
                legalname: cols.legalname,
                geom: cols.geom,
                limit: Config.typeahead.results,
                text: text
            });
            return Util.makeRequest(sql, query);
        }

        /**
         * List all museums within a given radius of position
         * @param  {object} position object with x and y keys, in lat/lon decimal degrees
         * @param  {float} radius    radius to pull results, in meters
         * @return {promise}         resolves with array of database results, or error
         */
        function list(position, radius) {
            var query = Util.strFormat(listTemplate, {
                tablename: Config.cartodb.tableName,
                geom: cols.geom,
                x: position.x,
                y: position.y,
                srid: 4326,
                radius: radius
            });
            return Util.makeRequest(sql, query);
        }
    }

    angular.module('imls.museum')
    .factory('Museum', Museum);

})();
