(function() {
    angular.module('taxidriver').service('ReportService', ['$http', function($http) {
        var key = "key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";
        return {
            request: function(query) {
                      var url = "https://www.googleapis.com/fusiontables/v2/query?sql=";
                var urlrequest = url + query + "&" + key;
                return $http.get(urlrequest);
            },
            requestcolumns: function(id) {
              var url = "https://www.googleapis.com/fusiontables/v2/tables/";

                var urlrequest = url + id + "/columns?" + key;
                return $http.get(urlrequest);
            }
        }
    }]);
})();