
(function () {
    'use strict';

    /* ngInject */
    function Util ($log, $q, Config) {

        var strFormatRegex = new RegExp('{(.*?)}', 'g');

        var module = {
            strFormat: strFormat,
            makeRequest: makeRequest
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
    }

    angular.module('imls.util')
    .service('Util', Util);

})();
