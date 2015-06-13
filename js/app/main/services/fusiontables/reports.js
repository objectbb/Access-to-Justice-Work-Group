(function() {
    angular.module('taxidriver').service('ReportService', ['$http', function($http) {
        var key = "AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";
        return {
            request: function(query) {
                var url = "https://www.googleapis.com/fusiontables/v2/query";
                var urlrequest = url + query + "&" + key;
                var req = {
                    method: 'POST',
                    url: url,
                    data: {
                        key: key,
                        sql: query
                    }
                }
                return $http(req);
            },
            requestcolumns: function(id) {
                var url = "https://www.googleapis.com/fusiontables/v2/tables/";
                var urlrequest = url + id + "/columns?key=" + key;
                return $http.get(urlrequest);
            }
        }
    }]);
})();