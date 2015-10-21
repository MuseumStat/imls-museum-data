'use strict';

describe('imls.views.museum: MuseumController', function () {

    beforeEach(module('imls.views.museum'));

    var MuseumController;
    var rootScope;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('tests for museum controller', function () {
        beforeEach(inject(function ($controller) {
            MuseumController = $controller('MuseumController', {
                $scope: scope
            });
        }));

        it('should be a dummy test', function () {
            expect(true).toEqual(true);
        });
    });
});