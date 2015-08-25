
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
    function AddressFilter() {
        return function (input) {
            var address = input.gaddress;
            var city = input.gcity;
            var state = input.gstate;
            var zip = input.gzip;

            return address + ', ' + city + ', ' + state + ' ' + zip;
        };
    }

    angular.module('imls.museum')
    .filter('imlsAddress', AddressFilter);

})();
