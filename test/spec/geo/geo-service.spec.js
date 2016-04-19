'use strict';

describe('imls.geo: Geo', function () {

    beforeEach(module('imls.geo'));

    var Geo;

    var testList1 = [{
        latitude: 10,
        longitude: 10
    }, {
        latitude: 5,
        longitude: 20
    }, {
        latitude: 30,
        longitude: 30
    }];
    var extent1 = [[5, 10], [30, 30]];

    var testList2 = [{
        latitude: null,
        longitude: null
    }, {
        latitude: 5,
        longitude: 20
    }, {
        latitude: 30,
        longitude: 30
    }];
    var extent2 = [[5, 20], [30, 30]];

    var testList3 = [{
        latitude: null,
        longitude: null
    }, {
        longitude: 20
    }, {
        latitude: 30
    }];
    var extent3 = [[30, 20], [30, 20]];

    var testList4 = [{
        latitude: null,
        longitude: null
    }, {
        longitude: 20
    }, {
        longitude: 10
    }];
    var extent4 = null;

    beforeEach(inject(function (_Geo_) {
        Geo = _Geo_;
    }));

    describe('Geo.extent() should return the proper extents', function () {

        it('should return null if anything other than a list with at least one value is passed', function () {
            expect(Geo.extent()).toBeNull();
            expect(Geo.extent(null)).toBeNull();
            expect(Geo.extent([])).toBeNull();
            expect(Geo.extent({})).toBeNull();
        });

        it('should return the proper extent', function () {
            expect(Geo.extent(testList1)).toEqual(extent1);
        });

        it('should return the proper extent when some properties are null', function () {
            expect(Geo.extent(testList2)).toEqual(extent2);
        });

        it('should return the proper extent when some properties are missing or null', function () {
            expect(Geo.extent(testList3)).toEqual(extent3);
        });

        it('should return null if we never find a valid latitude', function () {
            expect(Geo.extent(testList4)).toEqual(extent4);
        });
    });
});