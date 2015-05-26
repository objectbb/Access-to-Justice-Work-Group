(function () {
    angular.module('taxidriver').controller('MapController', ['$scope','ReportService', function ($scope,ReportService) {
        $scope.status;
        $scope.minAmount = 0;
        $scope.maxAmount = 250;
        $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
        $scope.violations = null;
        $scope.allviolations = null;
        var loadViolations = function () {
            var query = "select Description from 14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV group by Description";
            ReportService.request(query).success(function (data, status) {
                $scope.allviolations = _.map(data.rows, function (item) {
                    return {
                        name: item[0]
                    }
                });
            }).
            error(function (data, status) {
                alert("error");
            });
        }
        loadViolations();
        var whereclause = function () {
            return {
                from: $scope.table,
                select: 'location',
                where: 'Amount >= ' + $scope.minAmount + ' and Amount <=' + $scope.maxAmount + 
                            (($scope.status) ? ' and Status = \'' + $scope.status + '\'' : "")
                                + (($scope.violations) ? " and Description IN (\'" + _.map($scope.violations, 
                                        function(item){ return item.name.replace(/'/g,'\\\'');}).join("','") + 
                                            "\')" : "")
            };
        }
        var mapit = function (where) {
            new Maplace({
                map_div: '#gmap-fusion',
                type: 'fusion',
                map_options: {
                    zoom: 9,
                    set_center: [41.8369, -87.6847]
                },
                fusion_options: {
                    query: where,
                    styles: [{
                        where: "Amount < 100",
                        markerOptions: {
                            iconName: "small_green"
                        }
                    }, {
                        where: "Amount > 100",
                        markerOptions: {
                            iconName: "small_purple"
                        }
                    }],
                    suppressInfoWindows: false
                }
            }).Load();
        }
        mapit(whereclause());
        var redraw = function (where) {
            $('#gmap-fusion').empty();
            mapit((where) ? where : whereclause());
        }
        $scope.maptable = function (where) {
            $scope.table = where.from;
            redraw(where);
        }
        $scope.$watchGroup(['minAmount', 'maxAmount', 'status','violations'], function () {
            redraw();
        }, true);
    }]);
}());