(function () {
    'use strict';

    /* ngInject */
    function PeopleTabController($log, ACSAggregate, ACSVariables) {
        var ctl = this;

        initialize();

        function initialize() {
            ctl.acsVariables = ACSVariables;
            ctl.sumData = ACSAggregate.sum(ctl.data);
        }
    }

    /* ngInject */
    function imlsTabPeople() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/tab-people-partial.html',
            scope: {
                data: '='
            },
            controller: 'PeopleTabController',
            controllerAs: 'people',
            bindToController: true
        };
        return module;
    }

    angular.module('imls.views.museum')
    .controller('PeopleTabController', PeopleTabController)
    .directive('imlsTabPeople', imlsTabPeople);

})();
