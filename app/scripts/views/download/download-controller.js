
(function () {
    'use strict';

    /* ngInject */
    function DownloadController($timeout, $window, $uibModalInstance, datalist) {

        var ctl = this;
        initialize();

        function initialize() {
            ctl.onDownloadJSON = onDownloadJSON;
            ctl.onDownloadCSV = onDownloadCSV;
        }

        function onDownloadCSV() {
            download('csv', 'text/csv', csvTransform);
            $uibModalInstance.close();
        }

        function onDownloadJSON() {
            download('json', 'application/json', jsonTransform);
            $uibModalInstance.close();
        }

        function download(ext, mimeType, transformFunction) {
            // SOURCE: http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
            var filename = 'museum-results-' + new Date().getTime() + '.' + ext;
            var dataString = transformFunction(datalist);
            var blob = new Blob([dataString], { type: mimeType + ';charset=UTF-8' });
            if ($window.navigator.msSaveBlob) {
                $window.navigator.msSaveBlob(blob, filename);
            } else {
                var link = $window.document.createElement('a');
                if (link.download !== undefined) {
                    var url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    $window.document.body.appendChild(link);
                    $timeout(function () {
                        // Triggers a digest cycle somehow, so just wrap in $timeout so we don't
                        // try to trigger a digest cycle while in one
                        link.click();
                        $window.document.body.removeChild(link);
                    });
                } else {
                    $window.open('data:' + mimeType + ';charset=UTF-8,' + encodeURIComponent(dataString));
                }
            }
        }

        function jsonTransform(data) {
            return angular.toJson({ results: data });
        }

        function csvTransform(data) {
            var headers = _.keys(_.omit(data[0], '$$hashKey'));

            var quoteReplaceRe = /"/g;

            var csvString = headers.join(',') + '\n';
            angular.forEach(data, function (row) {
                csvString += _(row).omit('$$hashkey').values().map(function (value) {
                    if (_.isString(value)) {
                        // Need to quote strings, and convert double quotes to a pair of
                        // double quotes:
                        //  http://www.csvreader.com/csv_format.php
                        return '"' + value.replace(quoteReplaceRe, '""') + '"';
                    } else {
                        return value;
                    }
                }).value().join(',') + '\n';
            });
            return csvString;
        }
    }

    angular.module('imls.views.download')
    .controller('DownloadController', DownloadController);

})();
