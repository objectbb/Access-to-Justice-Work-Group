(function() {
    angular.module('taxidriver').controller('MapController', ['$scope', 'ReportService', '$q',
        function($scope, ReportService, $q) {
            $scope.status = "All";
            $scope.minAmount = 0;
            $scope.maxAmount = 250;
            $scope.fromdate = "01/01/2013";
            $scope.todate = "01/05/2013";
            $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
            $scope.filteredMaxFine = 250;
            $scope.filteredMinFine = 0;
            $scope.filteredViolations = "All";
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
            var refreshViolationsdd = function(data) {
                $scope.allviolations = _.uniq(_.map(data, function(item) {
                    return {
                        name: item.Description
                    }
                }), "name");
            }
            var loadMapData = function(query, datafileurl) {
                var deferred = $q.defer();
                ReportService.request(query, datafileurl).success(function(data, status) {
                    deferred.resolve(data);
                }).
                error(function(data, status) {
                    alert("error");
                });
                return deferred.promise;
            }
            var filtermarkers = function(rawdata) {
                var minfine = 250;
                var maxfine = 0;
                var allvio = {};
                if (rawdata.length == 0) return;
                var rs = _.filter(rawdata, function(item) {
                    var dataprop = item;
                    var is = (moment(dataprop.Date).isBetween($scope.fromdate, $scope.todate) && dataprop.Amount >= $scope.minAmount && dataprop.Amount <= $scope.maxAmount && (_.find($scope.violations, {
                        'name': dataprop.Description
                    }) || $scope.violations.length == 0) && (dataprop.Status == $scope.status || $scope.status == 'All'));
                    if (is) {
                        if (dataprop.Amount >= maxfine) maxfine = dataprop.Amount;
                        if (dataprop.Amount <= minfine) minfine = dataprop.Amount;
                        allvio[dataprop.Description] = {
                            name: dataprop.Description,
                            ticked: true
                        };
                    }
                    return is;
                });
                $scope.filteredMaxFine = maxfine;
                $scope.filteredMinFine = minfine;
                _.map($scope.allviolations,function(item){

                       item.ticked= (allvio[item.name]) ? true : false
                        
                });
                
                return rs;
            }
            var setMapData = function(rawdata) {
                return addressPointsToMarkers(filtermarkers(rawdata));
            }
            var mapIt = function() {
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
            mapIt();
            var refreshMapViolations = function(url, dataurl) {
                loadMapData(url, dataurl).
                then(function(data) {
                    if (data.length == 0) return;
                    rawdata = data;
                    refreshViolationsdd(data);
                    $scope.markers = setMapData(data);

                }, function(reason) {
                    alert('Failed: ' + reason);
                });
            }
            var refreshMapMedallions = function(url, dataurl) {
                loadMapData(url, dataurl).
                then(function(data) {
                    if (data.length == 0) return;
                    $scope.markers = addressPointsToMarkers(data);
                }, function(reason) {
                    alert('Failed: ' + reason);
                });
            }
            refreshMapViolations.apply(this, ["", "data/violations_map.json"]);
            $scope.mapViolations = function() {
                $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
                var query = "violations?q={lat:{$gt:0},lng:{$lt:0},Status:'" + $scope.status + "'}&f={_id:0,TotalAmount_Outstanding:0,Violation:0,Docket_Number:0,FirstHand_Description:0,TotalAmount_Owed:0}";
                refreshMapViolations.apply(this, [query, ""]);
            }
            $scope.mapMedallions = function() {
                $scope.table = '1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i';
                var query = "medallions?q={lat:{$gt:0},lng:{$lt:0}}&f={_id:0,Company_Name_UNEDITED:0,EDIT:0}";
                refreshMapMedallions.apply(this, [query, ""]);
            }
            $scope.$watchGroup(['minAmount', 'maxAmount', 'status'], function() {
                if (rawdata.length == 0) return;
                $scope.markers = setMapData(rawdata);
            }, true);
            $scope.onchangeRedrawmap = function() {
                if (rawdata.length == 0) return;
                $scope.markers = setMapData(rawdata);
            }
        }
    ]);
}());