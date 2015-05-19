(function () {
    var dataTable;
    angular.module('taxidriver').controller('AppCtrl', ['$scope', '$q', 'ReportService', 'da', function ($scope, $q, ReportService, da) {
        $scope.sql = null;
        $scope.sqlrs = null;
        $scope.sqlcols = [];

        var getcolumns = function (id) {
            var deferred = $q.defer();
            var rs;
            ReportService.requestcolumns(id).then(function (data, status) {
                rs = deferred.resolve(_.sortByAll(data.data.items, 'name'));
            }, function (updates) {
                deferred.update(updates);
            });
            return deferred.promise;
        }
        getcolumns('1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i').then(function (data) {
            $scope.tmhs = data;
            da.createtable("tmhs",$scope.tmhs);
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
            $scope.sendsql(table, query, msgid);
        }
        $scope.sendsql = function (table, query, msgid) {
            $(msgid).html("Processing...");
            ReportService.request(query).
            success(function (data, status) {
                loaddatagrid(data);
                loadsqltables(table, data);
                $(msgid).html("Results at the bottom..." + data.rows.length + " rows returned");
            }).
            error(function (data, status) {
                var msg = data.error.errors[0].message;
                $(msgid).html("Error:" + msg);
            });
        }
        var loadsqltables = function (table, data) {
            var jsondata = _.map(data.rows, function (n) {
                var row = {};
                var len = data.columns.length;
                for (var i = 0; i < len; i++) row[data.columns[i]] = n[i];
                return row;
            });

            da.loaddatatable(table,data);
        }

        var loaddatagrid = function (dataset) {
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