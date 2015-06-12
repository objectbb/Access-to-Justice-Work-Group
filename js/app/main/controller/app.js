(function() {
    var dataTables = {};
    var dataTable;
    angular.module('taxidriver').controller('AppCtrl', ['$scope', '$q', 'ReportService', 'da',
        function($scope, $q, ReportService, da, $animate) {
            $scope.sql = null;
            $scope.sqlrs = null;
            // $scope.sqlcols = [];
            $scope.fusionmap = {};
            $scope.fusionmap["1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i"] = {
                Id: "1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i",
                name: "tmhs",
                collection: "medallions",
                title: "Taxi Medallion Holders Summary",
                cols: "*"
            };
            $scope.fusionmap["1T1uO4iCjVUps7Ihzc2_avzW2ZGCZR6ciF7IG3lHt"] = {
                Id: "1T1uO4iCjVUps7Ihzc2_avzW2ZGCZR6ciF7IG3lHt",
                name: "anovs",
                collection: "anov",
                title: "Doc & ANOV ers Summary",
                cols: "*"
            };
            $scope.fusionmap["1An33ZqdkTpqMM1UjNy1cW0QDfAUhR0Hdtad0vkpJ"] = {
                Id: "1An33ZqdkTpqMM1UjNy1cW0QDfAUhR0Hdtad0vkpJ",
                name: "vr",
                title: "Violations Report",
                collection: "violation_arbitration",
                cols: "Disposition_Description,Docket_Number",
                navigationProperties: {
                    category: {
                        entityTypeName: "anovs",
                        associationName: "vr_anovs",
                        foreignKeyNames: ["Docket_Number"]
                    }
                }
            };
            $scope.fusionmap["14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV"] = {
                Id: "14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV",
                name: "dfin",
                cols: "*",
                title: "deptFin_foia",
                collection: "violations",
                navigationProperties: {
                    category: {
                        entityTypeName: "anovs",
                        associationName: "dfin_anovs",
                        foreignKeyNames: ["Docket_Number"]
                    }
                }
            };
            var getcolumns = function(id) {
                var deferred = $q.defer();
                var rs;
                ReportService.requestcolumns(id).success(function(data, status) {
                    rs = deferred.resolve(_.map(_.keys(data).sort(), function(item) {
                        return {
                            name: item
                        }
                    }));
                }, function(updates) {
                    deferred.update(updates);
                });
                return deferred.promise;
            }
            var initload = function() {
                da.clearalltables();
                var ft = $scope.fusionmap;
                for (var key in ft) {
                    (function(key) {
                        var name = ft[key].name;
                        var cols = ft[key].cols;
                        var collection = ft[key].collection;
                        getcolumns(collection).then(function(data) {
                            //$scope[name] = data;
                            ft[key].columns = data;
                            //da.createtable(fusionmap[key], data);
                            //$scope.loadcachetables("select " + cols + " from " + key, name)
                        });
                        ft[key].hashcode = function() {
                            var tree = _.map(ft[key].columns, function(item) {
                                return item.name.toLowerCase().split(/[_# -]/g);
                            });
                            tree = tree.concat(ft[key].title.toLowerCase().split(/[_# -]/g));
                            return _.flatten(tree);
                        };
                    })(key);
                }
            }
            initload();
            $scope.loadcachetables = function(sql, tableid) {
                sendsql(sql, tableid).then(function(data, status) {
                    if (!data.error) {
                        da.loadtable(tableid, convertcolstojson(data));
                        da.execute(new breeze.EntityQuery().from(tableid));
                        msg = "Results at the bottom..." + data.rows.length + " rows returned";
                    } else msg = data.error.errors[0].message;
                    console.log(msg);
                });
            }
            $scope.sendadvsql = function(sql, tableid) {
                // da.execute(eval("new breeze.EntityQuery().from('dfin').expand('dfin_anovs')"));
                //  da.execute(eval(sql));
                var msg;
                var msgid = "#" + tableid + "msg";
                $(msgid).html("Processing...");
                sendsql(sql, tableid).then(function(data, status) {
                    if (!data.error) {
                        loaddatagrid(tableid, data);
                        msg = "Results at the bottom..." + data.rows.length + " rows returned";
                    } else msg = data.error.errors[0].message;
                    $(msgid).html(msg);
                });
            }
            var sendsql = function(query, tableid) {
                var deferred = $q.defer();
                ReportService.request(query).success(function(data, status) {
                    return deferred.resolve(data);
                }).
                error(function(data, status) {
                    return deferred.resolve(data);
                });
                return deferred.promise;
            }
            var convertcolstojson = function(data) {
                var jsondata = _.map(data.rows, function(n) {
                    var row = {};
                    var len = data.columns.length;
                    for (var i = 0; i < len; i++) row[data.columns[i]] = n[i];
                    return row;
                });
                return jsondata;
            }
            var loaddatagrid = function(tableid, dataset) {
                if (dataTables[tableid]) dataTables[tableid].fnDestroy();
                var cols = _.map(dataset.columns, function(n) {
                    return {
                        'title': n
                    };
                });
                $('#tablecontainer').addClass("fadeIn animate_control");
                dataTables[tableid] = $('#' + tableid + "rstable").empty().dataTable({
                    destroy: true,
                    "data": dataset.rows,
                    "scrollY": "500px",
                    "scrollCollapse": true,
                    "columns": cols,
                    "deferRender": true
                });
            }
        }
    ]);
}());