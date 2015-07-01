
(function () {
    'use strict';

    /* ngInject */
    function Museum ($http, Config) {
        var sqlApi = ['https://', Config.cartodb.account,
                      '.cartodb.com/api/v2/sql'].join('');
        var cols = {
            id: 'cartodb_id',
            name: 'commonname',
            altname: 'altname',
            legalname: 'legalname',
            geom: 'the_geom'
        };

        var module = {
            sqlQuery: sqlQuery,
            suggest: suggest
        };

        return module;

        // Hoisted function definitions

        function sqlQuery(query) {
            return $http.get(sqlApi, {
                params: {
                    q: query
                }
            });
        }

        function escapeString(value, type) {
            if (!type) {
                type = 'text';
            }
            return "convert_from(decode('" + window.btoa(value) +
                   "','base64'), getdatabaseencoding())::"+type;
        }

        function suggest(text) {
            var query = ['select ',
                            cols.id, ' as id, ',
                            cols.name, ' as text, ',
                            'ST_AsGeoJSON(', cols.geom, ') as geojson, ',
                            'true as ismuseum ',
                         'from ', Config.cartodb.tableName, ' ',
                         'where ', cols.name, ' ilike ',
                            escapeString('%' + text + '%'), ' ',
                            'or ', cols.altname, ' ilike ',
                            escapeString('%' + text + '%'), ' ',
                            'or ', cols.legalname, ' ilike ',
                            escapeString('%' + text + '%'), ' ',
                         'limit ', Config.typeahead.results].join('');
            return sqlQuery(query).then(function (response) {
                return response.data.rows;
            });
        }

    }

    angular.module('imls.museum')
    .factory('Museum', Museum);

})();
