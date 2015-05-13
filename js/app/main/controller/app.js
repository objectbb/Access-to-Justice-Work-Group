(function () {
    var dataTable;
    angular.module('taxidriver').controller('AppCtrl', ['$scope', '$q', 'ReportService', function ($scope, $q, ReportService) {
        $scope.sql = null;
        $scope.sqlrs = null;
        $scope.sqlcols = [];
        var getcolumns = function (id) {
            var deferred = $q.defer();
            var rs;
            ReportService.requestcolumns(id).then(function (data, status) {
                rs = deferred.resolve(data.data.items);
            }, function (updates) {
                deferred.update(updates);
            });
            return deferred.promise;
        }
        getcolumns('1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i').then(function (data) {
            $scope.tmhs = data;
        });
        getcolumns('1T1uO4iCjVUps7Ihzc2_avzW2ZGCZR6ciF7IG3lHt').then(function (data) {
            $scope.anovs = data;
        });
        getcolumns('1An33ZqdkTpqMM1UjNy1cW0QDfAUhR0Hdtad0vkpJ').then(function (data) {
            $scope.vr = data;
        });
        getcolumns('1UCyBNGAL7544gB8Se2QaPwRWRmsSZ0c5aeD2m6hJ').then(function (data) {
            $scope.tmht = data;
        });
        getcolumns('14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV').then(function (data) {
            $scope.dfin = data;
        });
        $scope.send = function (table, inputcols) {
            var msgid = "#" + table + "msg";
            var formcols = inputcols;
            var cols = (_.map(formcols, function (item) {
                return "'" + item.name + "'";
            })).join(',');
            var colsquery = (formcols === null || formcols.length > 0) ? cols + ",count()" : " * ";
            var groupbyquery = (formcols === null || formcols.length > 0) ? " group by " + cols : "";
            var query = "select " + colsquery + " from " + table + groupbyquery;
            $scope.sendsql(query, msgid);
        }
        $scope.sendsql = function (query, msgid) {
            $(msgid).html("Processing...");
            ReportService.request(query).
            success(function (data, status) {
                loaddatatatable(data);
                $(msgid).html("Results at the bottom..." + data.rows.length + " rows returned");
            }).
            error(function (data, status) {
                var msg = data.error.errors[0].message;
                $(msgid).html("Error:" + msg);
            });
        }
        var loaddatatatable = function (dataset) {
            if (dataTable) {
                dataTable.fnDestroy();
            }
            var cols = _.map(dataset.columns, function (n) {
                return {
                    'title': n
                };
            });
            dataTable = $('#rstable').empty().dataTable({
                destroy: true,
                "data": dataset.rows,
                "scrollY": "500px",
                "scrollCollapse": true,
                "columns": cols
            });
        }
    }]);
}());