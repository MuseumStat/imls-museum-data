(function() {
    'use strict';

    /* ngInject */
    function ACSAggregate() {

        var module = {
            sum: sum,
            avg: avg
        };
        return module;

        function sum(acsResponse, variables) {
            var headers = _.without(acsResponse.headers, 'state', 'county', 'tract');
            if (variables && variables.length) {
                headers = _.intersection(headers, variables);
            }
            var data = {};
            angular.forEach(headers, function (variable, i) {
                var sum = 0;
                angular.forEach(acsResponse.data, function (values) {
                    var value = parseFloat(values[i]);
                    if (!isNaN(value)) {
                        sum += value;
                    }
                });
                data[variable] = sum;
            });
            return data;
        }

        function avg(acsResponse) {
            // TODO: Implement if necessary
            return acsResponse;
        }
    }

    angular.module('imls.acs')
    .service('ACSAggregate', ACSAggregate);
})();
