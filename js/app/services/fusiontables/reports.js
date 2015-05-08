(function(){

  angular.module('taxidriver').service('ReportService', ['$http',  function($http) {
    var url = "https://www.googleapis.com/fusiontables/v2/query?sql=";
    var key = "key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";

    return{  
      request : function(query) {
        var urlrequest = url + query + "&" + key;

       return $http.get(urlrequest);
      }
    }

  }]);


})();