
(function () {
    'use strict';

    var SocialSites = [
        'facebook',
        'twitter',
        'google_plus',
        'wikipedia',
        'yelp',
        'pinterest',
        'foursquare'
    ];

    /* ngInject */
    function Museum ($log, $q, Config, LegendMap, Util) {

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
        var socialTemplate = _.map(SocialSites, function (site) {
            return site + '_url';
        }).join(', ');
        var listTemplate = [
            // Include all relevant rows, we don't want to download and columns added by cartodb
            //  e.g. cartodb_id, the_geom, the_geom_webmercator, created_at, modified_at, etc.
            'SELECT mid, _from, aams_id, adaddress, adcity, adstate, adzip, adzip4, adzip5, ',
                'akadba, altname, block, cap_id, category_i, category_l, cbsacode, cmid, cntrycd, ',
                'commonname, confidence, delete_f, discipl, duns, duplicate_, ein, factual_id, ',
                'fct3p_f, fipsco, fipsmin, fipsplac, fipsst, found_id, gaddress, gal, galmat, ',
                'gcity, gstate, gzip, imlsad_f, income, incomecd, initials, irs990_f, ',
                'latitude, legalname, locale4, longitude, metrodiv, microf, mudf_id, npsid, nteec, ',
                'opstatus_f, pfnd_f, phaddress, phcity, phone, phstate, phzip, postmat, revenue, ',
                'review_f, rnotes, scope_f, sortid, src_cnt, syear, taxper, tmid, tract, unotes, ',
                'user_f, weburl, ',
                socialTemplate,
                ' ',
            'FROM {tablename} ',
            'WHERE ST_DWithin({geom}::geography, ST_SetSRID(ST_MakePoint({x}, {y}), {srid})::geography, {radius}) ',
            'ORDER BY ',
            '  ST_Distance({geom}::geography, ST_SetSRID(ST_MakePoint({x}, {y}), {srid})::geography)'
        ].join('');
        var detailTemplate = 'SELECT * from {tablename} WHERE mid = {mid}';

        function relatedTemplate(where) {
            return 'SELECT discipl as label, COUNT(discipl) as value FROM {tablename} ' +
                   'WHERE ' + where + ' GROUP BY discipl';
        }

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

        function detail(museumId) {
            var query = Util.strFormat(detailTemplate, {
                tablename: Config.cartodb.tableName,
                mid: museumId
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
                state: state
            });
            return Util.makeRequest(sql, query).then(transformLabels);
        }
    }

    angular.module('imls.museum')
    .factory('Museum', Museum);

    angular.module('imls.museum')
    .constant('SocialSites', SocialSites);

})();
