  (function() {

    angular.module('taxidriver').controller('AppCtrl', ['$scope','ReportService', function($scope,ReportService) {


      $scope.send = function(query)
      {
        ReportService.request(query).
        success(function(data, status) {
          alert( data.rows);
        }).
        error(function(data, status) {
          alert("Error" + status);
        });

      }       


  }]);
  }());