  (function() {

    angular.module('taxidriver').controller('AppCtrl', ['$scope','ReportService', function($scope,ReportService) {

      $scope.sql = null;
      $scope.sqlrs = null;

      $scope.send = function(query)
      {
        $scope.msg =  "Processing...";

        ReportService.request(query).
        success(function(data, status) {
          loaddatatatable(data);
          $scope.msg =  "";
        }).
        error(function(data, status) {
          var msg = data.error.errors[0].message;

          $scope.msg ="Error:" + msg;
        });

      }       


      var loaddatatatable = function (dataset){

        
       var cols =  _.map(dataset.columns, function(n){return {'title' : n};} );

        $('#rstable').dataTable( {
         destroy: true,
         "data": dataset.rows,
         "scrollY": "500px",
         "scrollCollapse": true,
         "columns": cols
       } );
      }

    }]);
  }());