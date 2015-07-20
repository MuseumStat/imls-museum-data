(function() {
    'use strict';

    /**
     * @ngInject
     */
    function FactualAPI() {

        var hostname = 'http://api.v3.factual.com';
        var key = null;

        this.setKey = function (newKey) {
            key = newKey;
        };

        this.$get = FactualAPIFactory;

        /* ngInject */
        function FactualAPIFactory($http, $log) {

            var module = {
                crosswalk: crosswalk
            };

            return module;

            /**
             * Make a request to the crosswalk endpoint with the form:
             *        /t/crosswalk/:factualId?params
             *
             * @param {string} factualId    (optional) If provided, is used in the request URL
             * @param {object} params GET params to append to the request.
             *                          API Key is automatically appended to this object
             * @return {[type]}        [description]
             */
            function crosswalk(factualId, params) {
                var url = hostname + '/t/crosswalk';
                if (factualId) {
                    url += '/' + factualId;
                }
                return $http.get(url, {
                    cache: true,
                    params: angular.extend({}, {
                        KEY: key
                    }, params)
                }).then(function(response) {
                    $log.info(response.data);
                    return response.data;
                });
            }
        }
    }

    angular.module('api.factual')
        .provider('FactualAPI', FactualAPI);

})();
