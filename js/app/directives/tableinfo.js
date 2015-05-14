(function () {
    angular.module('taxidriver').directive('tableinfo', function () {
        return {
            controller: function ($scope) {
                $scope.containsAddress = function (cols) {
                    return _.any(cols,{'name': "Address"});
                };
            },
            scope: {
                title: '=title',
                fusiontbl: '=fusiontbl',
                columns: '=columns',
                send: '=send'
            },
            templateUrl: 'js/app/directives/_tableinfo.html',
        };
    });
}());