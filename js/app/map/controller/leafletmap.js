(function() {
    angular.module('taxidriver').controller('MapController', ['$scope', 'ReportService', '$q',
        function($scope, ReportService, $q) {
            $scope.status = "Outstanding";
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
            var loadViolations = function(query) {
                ReportService.request(query).success(function(data, status) {
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
          //  loadViolations("violations?q={lat:{$gt:0},lng:{$lt:0},Status:'Outstanding'}&f={_id:0,TotalAmount_Outstanding:0,Violation:0,Docket_Number:0,FirstHand_Description:0,TotalAmount_Owed:0}");
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
                    }) || $scope.violations.length == 0) && (dataprop.Status == $scope.status || $scope.status == undefined));
                })));
                return deferred.promise;
            }
            $scope.$watchGroup(['minAmount', 'maxAmount', 'violations'], function() {
                var promise = filtermarkers();
                promise.then(function(data) {
                    $scope.markers = data;
                }, function(reason) {
                    alert('Failed: ' + reason);
                });
            }, true);
            $scope.$watch('status', function(newvalue, oldvalue) {
                //$scope.markers = addressPointsToMarkers(data);
                loadViolations("violations?q={lat:{$gt:0},lng:{$lt:0},Status:'" + 
                    newvalue + "'}&f={_id:0,TotalAmount_Outstanding:0,Violation:0,Docket_Number:0,FirstHand_Description:0,TotalAmount_Owed:0}");
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