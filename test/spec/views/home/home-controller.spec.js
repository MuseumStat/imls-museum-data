'use strict';

describe('imls.views.home: HomeController', function () {

    beforeEach(module('imls.views.home'));

    var HomeController;
    var rootScope;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('tests for home controller', function () {
        beforeEach(inject(function ($controller) {
            HomeController = $controller('HomeController', {
                $scope: scope
            });
        }));

        it('should be a dummy test', function () {
            expect(true).toEqual(true);
        });
    });
});