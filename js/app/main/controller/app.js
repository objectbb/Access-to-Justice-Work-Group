(function () {
    var dataTables = {};
    var dataTable;
    angular.module('taxidriver').controller('AppCtrl', ['$scope', '$q', 'ReportService', 'da',
        function ($scope, $q, ReportService, da) {
            $scope.sql = null;
            $scope.sqlrs = null;
            $scope.sqlcols = [];
            var fusionmap = {};
            fusionmap["1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i"] = "tmhs";
            fusionmap["1T1uO4iCjVUps7Ihzc2_avzW2ZGCZR6ciF7IG3lHt"] = "anovs";
            fusionmap["1An33ZqdkTpqMM1UjNy1cW0QDfAUhR0Hdtad0vkpJ"] = "vr";
            fusionmap["1UCyBNGAL7544gB8Se2QaPwRWRmsSZ0c5aeD2m6hJ"] = "tmht";
            fusionmap["14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV"] = "dfin";
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
            for (var key in fusionmap) {
                (function (key) {
                    var name = fusionmap[key];
                    getcolumns(key).then(function (data) {
                        $scope[name] = data;
                        da.createtable(name, data);
                    });
                })(key);
            }
            $scope.sendadvsql = function (sql, tableid) {
                var msg;
                var msgid = "#" + tableid + "msg";
                $(msgid).html("Processing...");
                sendsql(sql, tableid).then(function (data, status) {
                    if (!data.error) {
                        loaddatagrid(tableid, data);
                        msg = "Results at the bottom..." + data.rows.length + " rows returned";
                    } else msg = data.error.errors[0].message;
                    $(msgid).html(msg);
                });
            }
            $scope.send = function (tableid, inputcols) {
                var msg;
                var msgid = "#" + tableid + "msg";
                $(msgid).html("Processing...");
                var query = buildquery(tableid, inputcols);
                sendsql(query, tableid).then(function (data, status) {
                    if (!data.error) {
                        loaddatagrid(tableid, data);
                        msg = "..." + data.rows.length + " rows returned";
                        // $(msgid).html(msg);
                    } else msg = data.error.errors[0].message;
                    $(msgid).html(msg);
                });
                //da.loadtable(tableid, convertcolstojson(table, data));
                //da.execute();
            }
            var buildquery = function (tableid, inputcols) {
                var formcols = inputcols;
                var cols = (_.map(formcols, function (item) {
                    return "'" + item.name + "'";
                })).join(',');
                var colsquery = (formcols === null || formcols.length > 0) ? cols + ",count()" : " * ";
                var groupbyquery = (formcols === null || formcols.length > 0) ? " group by " + cols : "";
                return "select " + colsquery + " from " + tableid + groupbyquery;
            }
            var sendsql = function (query, tableid) {
                var deferred = $q.defer();
                ReportService.request(query).success(function (data, status) {
                    return deferred.resolve(data);
                }).
                error(function (data, status) {
                    return deferred.resolve(data);
                });
                return deferred.promise;
            }
            var convertcolstojson = function (tableid, data) {
                var jsondata = _.map(data.rows, function (n) {
                    var row = {};
                    var len = data.columns.length;
                    for (var i = 0; i < len; i++) row[data.columns[i]] = n[i];
                    return row;
                });
                return jsondata;
            }
            var loaddatagrid = function (tableid, dataset) {
                if (dataTables[tableid]) dataTables[tableid].fnDestroy();
                var cols = _.map(dataset.columns, function (n) {
                    return {
                        'title': n
                    };
                });
                dataTables[tableid] = $('#' + tableid + "rstable").empty().dataTable({
                    destroy: true,
                    "data": dataset.rows,
                    "scrollY": "500px",
                    "scrollCollapse": true,
                    "columns": cols
                });
            }
        }
    ]);
}());