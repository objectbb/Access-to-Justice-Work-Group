(function() {
    angular.module('taxidriver').directive('tableinfo', ['$q', 'ReportService', function($q, ReportService,$animate) {
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
                //scope.sqlcols = [];
                //scope.send = attrs.send;
            },
            controller: function($scope) {
                $scope.sqlcols = [];
                $scope.send = function(tableid) {
                    var msg;
                    var msgid = "#" + tableid + "msg";
                    $(msgid).html("Processing...");
                    var query = buildquery(tableid);
                    sendsql(query, tableid).then(function(data, status) {
                        if (!data.error) {
                            loaddatagrid(tableid, data);
                            msg = "..." + data.rows.length + " rows returned";
                        } else msg = data.error.errors[0].message;
                        $(msgid).html(msg);
                    });

                    return false;
                }
                var buildquery = function(tableid) {
                    var formcols = $scope.sqlcols.sqlcols;
                    var cols = (_.map(formcols, function(item) {
                        return "'" + item.name + "'";
                    })).join(',');
                    var colsquery = (formcols === null || formcols.length > 0) ? cols + ",count()" : " * ";
                    var groupbyquery = (formcols === null || formcols.length > 0) ? " group by " + cols : "";
                    return "select " + colsquery + " from " + tableid + groupbyquery;
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
                var loaddatagrid = function(tableid, dataset) {
                    if (dataTables[tableid]) dataTables[tableid].fnDestroy();
                    var cols = _.map(dataset.columns, function(n) {
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
        };
    }]);
}());