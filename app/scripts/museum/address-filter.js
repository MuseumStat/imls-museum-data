
(function() {
    'use strict';

    /**
     * Generate a human-readable address string from a single museum object
     *
     * Can get fancy here and prioritize one of the three address types provided:
     * source address, geocoded address, physical address
     *
     * For now, default to geocoded address since that's what seems to always be populated
     */
    /* ngInject */
    function AddressFilter(Config) {
        return function (input) {
            var addressConfig = Config.fields.address;
            var address = input[addressConfig.line1];
            if (input[addressConfig.line2]) {
                address += ' ' + input[addressConfig.line2];
            }
            var city = input[addressConfig.city];
            var state = input[addressConfig.state];
            var zip = input[addressConfig.zip];

            return address + ', ' + city + ', ' + state + ' ' + zip;
        };
    }

    angular.module('imls.museum')
    .filter('imlsAddress', AddressFilter);

})();
