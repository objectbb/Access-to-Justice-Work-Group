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
                    }).on('draw.dt', function() {
                        var body = $(this);

                        body.unhighlight();
                        body.highlight(body.DataTable().search());

                        msg = "..." + dataset.length + " rows returned";
                        $("#" + tableid + "msg").html(msg);
                    });
                }
            }
        };
    }]);
}());