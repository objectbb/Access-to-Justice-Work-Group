(function () {
    angular.module('taxidriver').controller('MapController', ['$scope', function ($scope) {
        $scope.status = "Paid";
        $scope.minAmount = 0;
        $scope.maxAmount = 250;
        $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
        var defaultwhere = {
            from: $scope.table,
            select: 'location'
        };
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
        mapit(defaultwhere);
        $scope.maptable = function (where) {
            $scope.table = where.from;
            $('#gmap-fusion').empty();
            mapit(((where) ? where : defaultwhere));
        }
        $scope.$watch('minAmount', function () {
            $('#gmap-fusion').empty();
            mapit({
                from: $scope.table,
                select: 'location',
                where: 'Amount >= ' + $scope.minAmount + ' and Amount <=' + $scope.maxAmount + ' and Status = \'' +  $scope.status +'\''
            });
        }, true);
        $scope.$watch('maxAmount', function () {
            $('#gmap-fusion').empty();
            mapit({
                from: $scope.table,
                select: 'location',
                where: 'Amount >= ' + $scope.minAmount + ' and Amount <=' + $scope.maxAmount + ' and Status = \'' +  $scope.status +'\''
            });
        }, true);
        $scope.$watch('status', function () {
            $('#gmap-fusion').empty();
            mapit({
                from: $scope.table,
                select: 'location',
                where: 'Amount >= ' + $scope.minAmount + ' and Amount <=' + $scope.maxAmount + ' and Status = \'' +  $scope.status +'\''
            });
        }, true);
    }]);
}());