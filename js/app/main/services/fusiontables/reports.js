(function() {
    angular.module('taxidriver').service('ReportService', ['$http', function($http) {
        var key = "mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
        return {
            request: function(query) {
                var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/";
                var urlrequest = url + query + "&l=1000000&apiKey=" + key;
                return $http.get(urlrequest).success(function(data){
                    return data;
                });
            },
            requestcolumns: function(id) {
                var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/" + id + "?fo=true&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
                return $http.get(url).success(function(data){
                    return data;
                });
            }
        }
    }]);
})();