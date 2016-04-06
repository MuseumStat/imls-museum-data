(function () {
    'use strict';

    /**
     * Helper functions to calculate areas, taken from:
     * https://github.com/mapbox/geojson-area/blob/v0.2.1/index.js
     */

    /** @ngInject */
    function Area() {

        var wgs84 = {
            RADIUS: 6378137     // radius of earth in WGS85, meters
        };

        var module = {
            circle: circle,
            polygon: polygon,
            ring: ring
        };

        return module;

        function circle(radius) {
            return Math.PI * radius * radius;
        }

        function polygon(coords) {
            var area = 0;
            if (coords && coords.length > 0) {
                area += Math.abs(ring(coords[0]));
                for (var i = 1; i < coords.length; i++) {
                    area -= Math.abs(ring(coords[i]));
                }
            }
            return area;
        }

        /**
         * Calculate the approximate area of the polygon were it projected onto
         *     the earth.  Note that this area will be positive if ring is oriented
         *     clockwise, otherwise it will be negative.
         *
         * Reference:
         * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
         *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
         *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
         *
         * Returns:
         * {float} The approximate signed geodesic area of the polygon in square
         *     meters.
         */
        function ring(coords) {
            var p1, p2, p3, lowerIndex, middleIndex, upperIndex,
            area = 0,
            coordsLength = coords.length;

            if (coordsLength > 2) {
                for (var i = 0; i < coordsLength; i++) {
                    if (i === coordsLength - 2) {// i = N-2
                        lowerIndex = coordsLength - 2;
                        middleIndex = coordsLength -1;
                        upperIndex = 0;
                    } else if (i === coordsLength - 1) {// i = N-1
                        lowerIndex = coordsLength - 1;
                        middleIndex = 0;
                        upperIndex = 1;
                    } else { // i = 0 to N-3
                        lowerIndex = i;
                        middleIndex = i+1;
                        upperIndex = i+2;
                    }
                    p1 = coords[lowerIndex];
                    p2 = coords[middleIndex];
                    p3 = coords[upperIndex];
                    area += ( rad(p3[0]) - rad(p1[0]) ) * Math.sin( rad(p2[1]));
                }

                area = area * wgs84.RADIUS * wgs84.RADIUS / 2;
            }

            return area;
        }

        function rad(r) {
            return r * Math.PI / 180;
        }
    }

    angular.module('imls.util')
    .service('Area', Area);

})();
