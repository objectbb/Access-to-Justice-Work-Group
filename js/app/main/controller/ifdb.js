(function () {
    var dataTables = {};
    var dataTable;
    angular.module('taxidriver').controller('IfdbCtrl', ['$scope', '$q', 'ReportService', 'da',
        function ($scope, $q, ReportService, da) {
            $scope.sql = null;
            $scope.sqlrs = null;
            $scope.sqlcols = [];
            var fusionmap = {};
            
            fusionmap["1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i"] = {name: "tmhs", cols: "Address,Company_Name,Zip"};
            /*
            fusionmap["1T1uO4iCjVUps7Ihzc2_avzW2ZGCZR6ciF7IG3lHt"] = {name: "anovs", cols: "*"};
            fusionmap["1An33ZqdkTpqMM1UjNy1cW0QDfAUhR0Hdtad0vkpJ"] = {name: "vr", cols: "Disposition_Description, Imposed_Fine_Detailed,  ViolationDescription"};
            fusionmap["1UCyBNGAL7544gB8Se2QaPwRWRmsSZ0c5aeD2m6hJ"] = {name : "tmht", cols: "*"};
            fusionmap["14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV"] = {name : "dfin", cols: "Address,Amount,Description,Date"};
            */
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
                    var name = fusionmap[key].name;
                    var cols = fusionmap[key].cols;
                    getcolumns(key).then(function (data) {
                        $scope[name] = data;
                        da.createtable(name, data);
                        $scope.sendadvsql("select " + cols + " from " + key, name)
                    });
                })(key);
            }
            $scope.sendadvsql = function (sql, tableid) {
                var msg;
                var msgid = "#" + tableid + "msg";
                $(msgid).html("Processing...");
                sendsql(sql, tableid).then(function (data, status) {

                    if (!data.error) {
 
                       da.loadtable(tableid, convertcolstojson(data));
+                       da.execute();
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
   
                    } else msg = data.error.errors[0].message;
                    $(msgid).html(msg);
                });

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
            var convertcolstojson = function (data) {
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