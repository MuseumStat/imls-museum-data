
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
                '{name} ILIKE \'%{text}%\'',
            'LIMIT {limit}'
        ].join('');
        var socialTemplate = _.map(Config.socialSites, function (site) {
            return site + '_url';
        }).join(', ');
        var listSelectColumns = [
            'ein_new',
            'organization_new',
            'ntee_org_type_new',
            'org_address1_new',
            'org_address2_new',
            'org_city_new',
            'org_state_new',
            'org_zip_new',
            'org_size_label_new',
            'org_website_new',
            'org_website_new',
            'latitude',
            'longitude'
        ].join(', ') + socialTemplate + ' ';

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
        var detailTemplate = 'SELECT * from {tablename} WHERE ein_new = {mid}';

        var sql = new cartodb.SQL({ user: Config.cartodb.account });
        var cols = {
            id: 'ein_new',
            name: 'organization_new',
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
            var attributes = {
                'org_zip_new': 'zip'
            };
            var whereArray = _(attributes)
                .mapValues(function (v) { return params[v]; })
                .pick(function (v) { return !!(v); })
                .map(function (v, k) {
                    if (k === 'org_state_new' && v.length !== 2) {
                        v = getStateAbbrev(v);
                    }
                    var comparator = '{v}';
                    var value = Util.strFormat(comparator, {v: v.replace('\'', '\'\'')});
                    var formatStr = '{k} ILIKE \'{value}\'';
                    if (k === 'org_zip_new') {
                        formatStr = '{k} = {value}';
                    }
                    return Util.strFormat(formatStr, {k: k, value: value});
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
            var query = Util.strFormat(relatedTemplate('org_state_new = \'{state}\''), {
                tablename: Config.cartodb.tableName,
                state: state.replace('\'', '\'\'')
            });
            return Util.makeRequest(sql, query).then(transformLabels);
        }

        function relatedTemplate(where) {
            return 'SELECT ' +
                    'ntee_org_type_new as label, ' +
                    'COUNT(ntee_org_type_new) as value ' +
                'FROM {tablename} ' +
                'WHERE ' + where + ' ' +
                'GROUP BY ntee_org_type_new';
        }

        function getStateAbbrev(stateName) {
            if (!stateName) { return null; }
            return StateAbbrev[stateName.toLowerCase()] || null;
        }
    }

    angular.module('imls.museum')
    .factory('Museum', Museum);

})();
