(function() {
    angular.module('taxidriver').controller('AppCtrl', ['$scope', '$q', 'ReportService', function($scope, $q, ReportService) {
        $scope.sql = null;
        $scope.sqlrs = null;
        var columnsjoin = function(id) {
            var deferred = $q.defer();
            var rs;
            ReportService.requestcolumns(id).then(function(data, status) {
                rs = deferred.resolve((_.map(data.data.items, function(n) {
                    return n.name;
                })).join(', '));
            }, function(updates) {
                deferred.update(updates);
            });
            return deferred.promise;
        }
        columnsjoin('1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i').then(function(data) {
            $scope.tmhs = data;
        });
        columnsjoin('1T1uO4iCjVUps7Ihzc2_avzW2ZGCZR6ciF7IG3lHt').then(function(data) {
            $scope.anovs = data;
        });
        columnsjoin('1An33ZqdkTpqMM1UjNy1cW0QDfAUhR0Hdtad0vkpJ').then(function(data) {
            $scope.vr= data;
        });
         columnsjoin('1UCyBNGAL7544gB8Se2QaPwRWRmsSZ0c5aeD2m6hJ').then(function(data) {
            $scope.tmht= data;
        });
        $scope.send = function(query) {
            $scope.msg = "Processing...";
            ReportService.request(query).
            success(function(data, status) {
                loaddatatatable(data);
                $scope.msg = "";
            }).
            error(function(data, status) {
                var msg = data.error.errors[0].message;
                $scope.msg = "Error:" + msg;
            });
        }
        var loaddatatatable = function(dataset) {
            var cols = _.map(dataset.columns, function(n) {
                return {
                    'title': n
                };
            });
            $('#rstable').dataTable({
                destroy: true,
                "data": dataset.rows,
                "scrollY": "500px",
                "scrollCollapse": true,
                "columns": cols
            });
        }
    }]);
}());