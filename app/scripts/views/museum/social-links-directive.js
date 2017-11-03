(function () {
    'use strict';

    /* ngInject */
    function SocialLinksController(Config) {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.urls = {};

            ctl.iconForKey = iconForKey;

            ctl.$onChanges = $onChanges;
        }

        function $onChanges(changes) {
            if (changes.museum) {
                setSocialUrls();
            }
        }

        function iconForKey(key) {
            var prefix = 'md-icon-';
            var iconKey = key;
            if (key === 'google_plus') {
                iconKey = 'gplus';
            }
            return prefix + iconKey;
        }

        function setSocialUrls() {
            angular.forEach(Config.socialSites, function (site) {
                var column = Config.socialColumn.replace(':site:', site);
                if (ctl.museum[column]) {
                    ctl.urls[site] = ctl.museum[column];
                }
            });
        }
    }

    /* ngInject */
    function socialLinks() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/museum/social-links-partial.html',
            controller: 'SocialLinksController',
            controllerAs: 'links',
            scope: {
                museum: '<'
            },
            bindToController: true
        };
        return module;
    }

    angular.module('imls.views.museum')
    .controller('SocialLinksController', SocialLinksController)
    .directive('imlsSocialLinks', socialLinks);

})();
