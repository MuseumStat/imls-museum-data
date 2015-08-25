(function() {
    'use strict';

    var LegendMap = {
        'ART': 'Art',
        'BOT': 'Botanical',
        'CMU': 'Children\'s',
        'GMU': 'General',
        'HSC': 'Historical Societies',
        'HST': 'History',
        'NAT': 'Natural History & Science',
        'SCI': 'Science & Technology',
        'ZAW': 'Zoos'
    };

    angular.module('imls.museum')
    .constant('LegendMap', LegendMap);

})();
