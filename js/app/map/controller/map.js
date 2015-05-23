(function () {
    angular.module('taxidriver').controller('MapController', ['$scope', function ($scope) {
        var mapit = function (id) {
            new Maplace({
                map_div: '#gmap-fusion',
                type: 'fusion',
                map_options: {
                    zoom: 8,
                    set_center: [41.8369, -87.6847]
                },
                fusion_options: {
                    query: {
                        from: id,
                        select: 'location'
                    },
                    suppressInfoWindows: false
                }
            }).Load();
        }
        mapit('14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV');
        $scope.maptable = function (id) {
            $('#gmap-fusion').empty();
            mapit(id);
        }
    }]);
}());