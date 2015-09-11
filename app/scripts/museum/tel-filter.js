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
            var inputAsStr = input.toString();
            // we're lucky no phone number in the US begins with a 0
            if (inputAsStr.length !== 10) {
                return input;
            }
            return inputAsStr.substr(0, 3) + '-' + inputAsStr.substr(3, 3) + '-' + inputAsStr.substr(6);
        };
    }

    angular.module('imls.museum')
    .filter('tel', TelFilter);

})();
