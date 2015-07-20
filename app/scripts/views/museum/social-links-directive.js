(function () {
    'use strict';

    /* ngInject */
    function SocialLinksController($attrs, $log, FactualAPI) {

        var ctl = this;

        initialize();

        function initialize() {
            ctl.urls = {
                facebook: null,
                gplus: null,
                instagram: null,
                twitter: null,
                yelp: null,
                foursquare: null,
                pinterest: null
            };

            ctl.iconForKey = iconForKey;

            $log.info('Factual ID:', ctl.factualId);
            if (ctl.factualId) {
                FactualAPI.crosswalk(ctl.factualId).then(setSocialUrls);
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

        function setSocialUrls(data) {
            var response = data.response.data;
            angular.forEach(response, function (obj) {
                var namespace = obj.namespace;
                if (_.has(ctl.urls, namespace) && obj.url) {
                    ctl.urls[namespace] = obj.url;
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
                factualId: '='
            },
            bindToController: true
        };
        return module;
    }

    angular.module('imls.views.museum')
    .controller('SocialLinksController', SocialLinksController)
    .directive('imlsSocialLinks', socialLinks);

})();
