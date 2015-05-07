  (function() {

    angular.module('taxidriver').controller('AppCtrl', ['$scope','ReportService', function($scope,ReportService) {

      $scope.sql = null;
      $scope.sqlrs = null;

      $scope.send = function(query)
      {
        ReportService.request(query).
        success(function(data, status) {
          $scope.sqlrs = data.rows.join(',');
        }).
        error(function(data, status) {
          alert("Error:" + status + "\n" + data);
        });

      }       


  }]);
  }());