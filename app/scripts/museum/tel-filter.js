(function() {
    'use strict';

    /**
     * Parse a ten digit us phone number of the form:
     * 1234567890
     * to the form:
     * 123-456-7890
     */
    /* ngInject */
    function TelFilter() {
        return function (input) {
            var inputAsInt = parseInt(input, 10);
            if (isNaN(inputAsInt) || input.length !== 10) {
                return input;
            }
            return input.substr(0, 3) + '-' + input.substr(3, 3) + '-' + input.substr(6);
        }
    }

    angular.module('imls.museum')
    .filter('tel', TelFilter);

})();
