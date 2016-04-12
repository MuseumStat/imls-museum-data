
(function () {
    'use strict';

    /* ngInject */
    function Museum ($log, $q, Config, LegendMap, StateAbbrev, Util) {

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
        var socialTemplate = _.map(Config.socialSites, function (site) {
            return site + '_url';
        }).join(', ');
        var listSelectColumns =
            'mid, commonname, legalname, altname, akadba, ' +
            'adstreet, adcity, adstate, adzip, adzip5, ' +
            'phstreet, phcity, phstate, phzip, phzip5, ' +
            'phone, weburl, discipl, ein, nteec, taxper, incomecd, income, revenue, ipeds, ' +
            'instname, naics, longitude, latitude, aamreg, beareg, locale4, fipsst, fipsco, ' +
            'centract, cenblock, congdist, fullfips, ' +
            'gstreet, gcity, gstate, gzip, gzip5, bmf15_f, description, ' +
            socialTemplate + ' ';


        var listTemplate = [
            // Include all relevant rows, we don't want to download and columns added by cartodb
            //  e.g. cartodb_id, the_geom, the_geom_webmercator, created_at, modified_at, etc.
            'SELECT ',
            listSelectColumns,
            'FROM {tablename} ',
            'WHERE ST_DWithin({geom}::geography, ST_SetSRID(ST_MakePoint({x}, {y}), {srid})::geography, {radius}) ',
            'ORDER BY ',
            '  ST_Distance({geom}::geography, ST_SetSRID(ST_MakePoint({x}, {y}), {srid})::geography)'
        ].join('');
        var listByCityTemplate = [
            'SELECT ',
            listSelectColumns,
            'FROM {tablename} ',
            'WHERE {where}'
        ].join('');
        var detailTemplate = 'SELECT * from {tablename} WHERE mid = {mid}';

        var sql = new cartodb.SQL({ user: Config.cartodb.account });
        var cols = {
            id: 'mid',
            name: 'commonname',
            altname: 'altname',
            legalname: 'legalname',
            geom: 'the_geom'
        };

        var module = {
            suggest: suggest,
            list: list,
            listByCity: listByCity,
            detail: detail,
            byTypeInRadius: byTypeInRadius,
            byTypeInPolygon: byTypeInPolygon,
            byTypeInState: byTypeInState
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
                text: text.replace('\'', '\'\'')
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

        function listByCity(params) {
            var attributes = { 'gcity': 'city', 'gstate': 'state', 'gzip': 'zip' };
            var whereArray = _(attributes)
                .mapValues(function (v) { return params[v]; })
                .pick(function (v) { return !!(v); })
                .map(function (v, k) {
                    if (k === 'gstate' && v.length !== 2) {
                        v = getStateAbbrev(v);
                    }
                    return Util.strFormat('{k} ILIKE \'%{v}%\'', {k: k, v: v.replace('\'', '\'\'')});
                })
                .value();
            if (whereArray.length < 1) {
                whereArray = ['0 == 1'];
            }
            var where = whereArray.join(' AND ');

            var query = Util.strFormat(listByCityTemplate, {
                tablename: Config.cartodb.tableName,
                where: where
            });
            return Util.makeRequest(sql, query);
        }

        function detail(museumId) {
            var query = Util.strFormat(detailTemplate, {
                tablename: Config.cartodb.tableName,
                mid: museumId.replace('\'', '\'\'')
            });
            return Util.makeRequest(sql, query);
        }

        function transformLabels(rows) {
            return _.map(rows, function(row) {
                return {
                    label: LegendMap[row.label],
                    value: row.value
                };
            });
        }

        function byTypeInRadius(x, y, r) {
            var query = Util.strFormat(relatedTemplate(Util.radiusWhere(x, y, r)), {
                tablename: Config.cartodb.tableName,
                geom: 'the_geom',
                srid: 4326
            });
            return Util.makeRequest(sql, query).then(transformLabels);
        }

        function byTypeInPolygon(points) {
            var query = Util.strFormat(relatedTemplate(Util.polygonWhere(points)), {
                tablename: Config.cartodb.tableName,
                geom: 'the_geom',
                srid: 4326
            });
            return Util.makeRequest(sql, query).then(transformLabels);
        }

        function byTypeInState(state) {
            var query = Util.strFormat(relatedTemplate('gstate = \'{state}\''), {
                tablename: Config.cartodb.tableName,
                state: state.replace('\'', '\'\'')
            });
            return Util.makeRequest(sql, query).then(transformLabels);
        }

        function relatedTemplate(where) {
            return 'SELECT discipl as label, COUNT(discipl) as value FROM {tablename} ' +
                   'WHERE ' + where + ' GROUP BY discipl';
        }

        function getStateAbbrev(stateName) {
            if (!stateName) { return null; }
            return StateAbbrev[stateName.toLowerCase()] || null;
        }
    }

    angular.module('imls.museum')
    .factory('Museum', Museum);

})();
