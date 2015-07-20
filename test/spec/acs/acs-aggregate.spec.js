describe('imls.acs: ACSAggregate', function () {
    'use strict';

    beforeEach(module('imls.acs'));

    var ACSAggregate;

    var acsResponse = {
        headers: [
            'B01001_001E',
            'B01001_002E',
            'state',
            'county',
            'tract'
        ],
        data: [
            ["20", "7.5", "53", "33", "007200"],
            ["10", "2.5", "53", "33", "007200"]
        ]
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function (_ACSAggregate_) {
        ACSAggregate = _ACSAggregate_;
    }));

    describe('ACSAggregate tests', function() {

        it('should properly sum ACS variables', function () {
            var sum = ACSAggregate.sum(acsResponse);
            expect(_.keys(sum).length).toBe(2);
            expect(sum['B01001_001E']).toBe(30);
            expect(sum['B01001_002E']).toBe(10);
        });

        it('should only sum the requested variables', function () {
            var sum = ACSAggregate.sum(acsResponse, ['B01001_001E']);
            expect(_.keys(sum).length).toBe(1);
            expect(sum['B01001_001E']).toBe(30);
        });
    });

});
