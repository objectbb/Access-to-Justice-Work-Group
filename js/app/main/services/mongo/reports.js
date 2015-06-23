(function() {
    angular.module('taxidriver').service('ReportService', ['$http', function($http) {
        var key = "mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
        return {
            request: function(query, datafileurl) {
                var urlrequest = (query) ? "https://api.mongolab.com/api/1/databases/taxidriver/collections/" +
                                    query + "&l=1000000&apiKey=" + key : datafileurl;
                return $http.get(urlrequest).success(function(data){
                    return data;
                }).error(function(err){
                    alert(JSON.stringify(err));
                });
            },
            requestcolumns: function(id) {
                var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/" + id + "?fo=true&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
                return $http.get(url).success(function(data){
                    return data;
                }).error(function(err){
                     alert(JSON.stringify(err));
                });
            },
            requestloc:function(address){
                var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address;
                return $http.get(url).success(function(data){
                    return data;
                }).error(function(err){
                     alert(JSON.stringify(err));
                });
            }
        }
    }]);
})();