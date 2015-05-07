  (function() {

    angular.module('taxidriver').controller('AppCtrl', ['$scope','ReportService', function($scope,ReportService) {

      $scope.sql = null;
      $scope.sqlrs = null;

      $scope.send = function(query)
      {
        $scope.sqlrs =  "Processing...";

        ReportService.request(query).
        success(function(data, status) {
          $scope.sqlrs = data.rows.join(',');
        }).
        error(function(data, status) {
          var msg = data.error.errors[0].message;

          $scope.sqlrs ="Error:" + msg;
        });

      }       


  }]);
  }());