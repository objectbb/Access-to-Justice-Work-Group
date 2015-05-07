(function(){

  angular.module('taxidriver').service('ReportService', ['$http',  function($http) {
    var url = "https://www.googleapis.com/fusiontables/v2/query?sql=";
    var key = "key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";

    return{  
      request : function(query) {
        var urlrequest = url + query + "&" + key;

        $http.get(urlrequest).
        success(function(data, status) {
          return data.rows;
        }).
        error(function(data, status) {
          alert("Error" + status);
        });
      }
    }

  }]);


})();