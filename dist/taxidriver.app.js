(function() {
    angular.module('taxidriver', ['ui.bootstrap', 'isteven-multi-select', 'ui-rangeSlider','ngAnimate','leaflet-directive']).
    config(['$httpProvider', function($httpProvider) {
        // Intercept POST requests, convert to standard form encoding
        $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $httpProvider.defaults.transformRequest.unshift(function(data, headersGetter) {
            var key, result = [];
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                }
            }
            return result.join("&");
        })
    }]);
}());
(function() {
    angular.module('taxidriver').filter('defaultFilter', function() {
        return function(items, filter) {
            if (!filter) {
                return items;
            }
            var result = {};
           
            var filterVal = filter.toLowerCase();
            angular.forEach(items, function(item, key) {
                var fieldVal = item.hashcode();
                var splitinput = filterVal.split(' ');

                if (fieldVal && 
                    _.intersection(fieldVal, splitinput).length == splitinput.length) 
                        result[key] = item;
            });
            return result;
        };
    })
}());
(function() {
    angular.module('taxidriver').service('ReportService', ['$http', function($http) {
        var key = "mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
        return {
            request: function(query, datafileurl) {
                var urlrequest = (query) ? "https://api.mongolab.com/api/1/databases/taxidriver/collections/" +
                                    query + "&l=1000000&apiKey=" + key : datafileurl;
                return $http.get(urlrequest).success(function(data){
                    return data;
                }).error(function(err){
                    alert(JSON.stringify(err));
                });
            },
            requestcolumns: function(id) {
                var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/" + id + "?fo=true&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
                return $http.get(url).success(function(data){
                    return data;
                }).error(function(err){
                     alert(JSON.stringify(err));
                });
            }
        }
    }]);
})();
(function() {
    angular.module('taxidriver').directive('tableinfo', ['$q', 'ReportService', function($q, ReportService, $animate) {
        var dataTables = {};
        var dataTable;
        return {
            restrict: 'E',
            templateUrl: 'js/app/directives/_tableinfo.html',
            link: function(scope, element, attrs) {
                scope.fusiontbl = JSON.parse(attrs.fusiontbl);
                scope.title = scope.fusiontbl.title;
                scope.Id = scope.fusiontbl.Id;
                scope.columns = scope.fusiontbl.columns;
                scope.collection = scope.fusiontbl.collection;
            },
            controller: function($scope) {
                $scope.sqlcols = [];
                $scope.isprocessing = false;
                $scope.send = function(tableid, columns) {
                    var msg;
                    var msgid = "#" + tableid + "msg";
                    $(msgid).html("Processing...");
                    $(msgid).addClass("flash animated");
                    $scope.isprocessing = true;
                    var query = buildquery(tableid);
                    sendsql(query).then(function(data, status) {
                        if (!data.error) {
                            loaddatagrid(tableid, data, columns);
                            //msg = "..." + data.rows.length + " rows returned";
                        } else msg = data.error.errors[0].message;
                        $(msgid).html(msg);
                        $(msgid).removeClass("flash animated");
                    });
                    $scope.isprocessing = false;
                    return false;
                }
                var buildquery = function(tableid) {

                    var formcols = $scope.sqlcols.sqlcols;
                    var cols = _.map(formcols, function(item) {
                        return item.name + ":1";
                    });

                    return tableid + "?f={" + cols.join(",") + "}";
                }
                var sendsql = function(query) {
                    var deferred = $q.defer();
                    ReportService.request(query).success(function(data, status) {
                        return deferred.resolve(data);
                    }).
                    error(function(data, status) {
                        return deferred.resolve(data);
                    });
                    return deferred.promise;
                }
                var loaddatagrid = function(tableid, dataset, columns) {
                    if (dataTables[tableid]) dataTables[tableid].fnDestroy();
                    var cols = _.map(columns, function(item) {
                        return {
                            'data': item.name,
                            'title': item.name
                        };
                    });
                    $('#' + tableid + "tablecontainer").addClass("fadeIn animated animate_control");
                    dataTables[tableid] = $('#' + tableid + "rstable").dataTable({
                        destroy: true,
                        "data": dataset,
                        "scrollY": "500px",
                        "scrollCollapse": true,
                        "columns": cols,
                        "deferRender": true,
                         "searchHighlight": true
                    }).on( 'draw.dt', function () {
                        var body = $(this);
                 
                        body.unhighlight();
                        body.highlight( body.DataTable().search() );  

                        msg = "..." + dataset.length + " rows returned";
                        $("#" + tableid + "msg").html(msg);
                    } );
                }
            }
        };
    }]);
}());
(function() {
    var dataTables = {};
    var dataTable;
    angular.module('taxidriver').controller('AppCtrl', ['$scope', '$q', 'ReportService', 
        function($scope, $q, ReportService, $animate) {
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

                //da.clearalltables();
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
                        //da.loadtable(tableid, convertcolstojson(data));
                        //da.execute(new breeze.EntityQuery().from(tableid));
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
                ReportService.request(query).
                success(function(data, status) {
                    return deferred.resolve(data);
                }, function(updates) {
                    deferred.update(updates);
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
                }).on('draw.dt', function() {
                    var body = $(this);
                    body.unhighlight();
                    body.highlight(body.DataTable().search());
                });
            }
        }
    ]);
}());
(function() {
    angular.module('taxidriver').controller('MapController', ['$scope', 'ReportService', '$q',
        function($scope, ReportService, $q) {
            $scope.status = "All";
            $scope.minAmount = 0;
            $scope.maxAmount = 250;
            $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
            $scope.violations = [];
            $scope.allviolations = null;
            var rawdata = [];
            var addressPointsToMarkers = function(points) {
                return points.map(function(ap) {
                    return {
                        data: ap,
                        layer: 'realworld',
                        lat: ap.lat,
                        lng: ap.lng,
                        message: _.values(ap).join("<br>"),
                        label: {
                            message: _.values(ap).join("<br>"),
                            options: {
                                noHide: true
                            }
                        },
                    };
                });
            };
            var loadViolations = function(query,datafileurl) {
                ReportService.request(query,datafileurl).success(function(data, status) {
                    rawdata = data;
                    $scope.markers = addressPointsToMarkers(rawdata);
                    $scope.allviolations = _.uniq(_.map(data, function(item) {
                        return {
                            name: item.Description
                        }
                    }), "name");
                }).
                error(function(data, status) {
                    alert("error");
                });
            }
            var mapit = function() {
                angular.extend($scope, {
                    center: {
                        lat: 41.8369,
                        lng: -87.6847,
                        zoom: 9
                    },
                    events: {
                        map: {
                            enable: ['moveend', 'popupopen'],
                            logic: 'emit'
                        },
                        marker: {
                            enable: [],
                            logic: 'emit'
                        }
                    },
                    layers: {
                        baselayers: {
                            osm: {
                                name: 'OpenStreetMap',
                                type: 'xyz',
                                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            }
                        },
                        overlays: {
                            realworld: {
                                name: "Real world data",
                                type: "markercluster",
                                visible: true
                            }
                        }
                    }
                });
            }
            loadViolations("","data/violations_map.js");
            mapit();
            $scope.mapviolations = function() {
                $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
                loadViolations("violations?q={lat:{$gt:0},lng:{$lt:0},Status:'" + 
                    $scope.status + "'}&f={_id:0,TotalAmount_Outstanding:0,Violation:0,Docket_Number:0,FirstHand_Description:0,TotalAmount_Owed:0}");
            }
            $scope.mapmedallions = function() {
                $scope.table = '1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i';
                loadViolations("medallions?q={lat:{$gt:0},lng:{$lt:0}}&f={_id:0,Company_Name_UNEDITED:0,EDIT:0}");
            }
            var filtermarkers = function() {
                var deferred = $q.defer();
                deferred.resolve(addressPointsToMarkers(_.filter(rawdata, function(item) {
                    deferred.notify("Loading data...please be patient.");
                    var dataprop = item;
                    return (dataprop.Amount >= $scope.minAmount && dataprop.Amount <= $scope.maxAmount && (_.find($scope.violations, {
                        'name': dataprop.Description
                    }) || $scope.violations.length == 0) && (dataprop.Status == $scope.status || $scope.status == 'All'));
                })));
                return deferred.promise;
            }
            $scope.$watchGroup(['minAmount', 'maxAmount', 'violations','status'], function() {
                var promise = filtermarkers();
                promise.then(function(data) {
                    $scope.markers = data;
                }, function(reason) {
                    alert('Failed: ' + reason);
                });
            }, true);
        }
    ]);
}());