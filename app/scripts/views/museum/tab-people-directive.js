(function () {
    'use strict';

    /* ngInject */
    function PeopleTabController($log, $scope, ACSAggregate, ACSVariables) {
        var ctl = this;

        initialize();

        function initialize() {
            ctl.acsVariables = ACSVariables;
            onSumDataChanged(ctl.data);

            $scope.$watch(function () { return ctl.data; }, onSumDataChanged);
        }

        function onSumDataChanged(newData) {
            $log.info('PeopleTabController.onSumDataChanged', newData);
            if (newData && newData.headers && newData.data) {
                ctl.data = newData;
                ctl.sumData = ACSAggregate.sum(ctl.data);
            }
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
