(function () {
    angular.module('taxidriver').directive('tableinfo', function () {
        return {
           
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