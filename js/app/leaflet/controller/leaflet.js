(function () {
    angular.module('taxidriver').controller("LeafletController", ['$scope', function ($scope) {
        angular.extend($scope, {
            center: {
                lat: 41.8369,
                lng: -87.6847,
                zoom: 10
            },
            markers: {
                m1: {
                    lat: 41.8369,
                    lng: -87.6847
                }
            }
        });
    }]);
}());