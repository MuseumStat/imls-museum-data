(function() {
    'use strict';

    /**
     * Use the LegendMap to return a human-readable category
     */
    /* ngInject */
    function CategoryFilter(LegendMap) {
        return function (cat) {
            return LegendMap[cat] ? LegendMap[cat] : 'Unknown';
        };
    }

    angular.module('imls.museum')
    .filter('imlsCategory', CategoryFilter);

})();
