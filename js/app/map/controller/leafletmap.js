(function() {
        angular.module('taxidriver').
        controller('MapController', ['$scope', '$filter' , '$q', '$animate', 
            'ReportService','leafletData', 'leafletEvents',
                function($scope,$filter,$q,$animate,ReportService, leafletData, leafletEvents) {
                    $scope.status = "All";
                    $scope.minAmount = 0;
                    $scope.maxAmount = 250;
                    $scope.fromdate = new Date(2013,3,1);
                    $scope.todate = new Date(2013,3,30);
                    $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
                    $scope.filteredMaxFine = 250;
                    $scope.filteredMinFine = 0;
                    $scope.filteredViolations = "All";
                    $scope.filtertotalcount = 0;
                    $scope.filtertotalviolations = 0;
                    $scope.filtertotalamount = 0;
                    $scope.iscurrviewstats = false;
                    $scope.maploc;

                    $scope.violations = [];
                    $scope.allviolations = [];                    
                    var rawdata = [];
                    $scope.mapboundary;

                    var addressPointsToMarkers = function(points, stylef, bodyf) {

                        return points.map(function(ap) {

                            return {
                                data: ap,
                                layer: 'realworld',
                                lat: ap.loc[1],
                                lng: ap.loc[0],
                                message: _.values(ap).join("<br>"),
                                icon: {
                                    type: 'div',
                                    className: stylef(ap),
                                    iconSize: null,
                                    html: bodyf(ap)
                                },
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
                               id: item.Id, name: item.Description, label: item.Description
                            }
                        }), "name");
                    $scope.allviolations = $filter('orderBy')($scope.allviolations,"name",false);

                    }
                    var loadMapData = function(query, datafileurl) {
                        var deferred = $q.defer();
                        ReportService.request(query, datafileurl).success(function(data, status) {
                            deferred.resolve(data);
                        }).
                        error(function(data, status) {
                            changefiltertext("filterstate", 'Failed: ' + status, "animated infinite fadeIn");
                        });
                        return deferred.promise;
                    }

                    var changefiltertext = function(id, text, effect) {
                        $('#' + id).removeClass(effect).addClass(effect);
                        $scope.filterstate = text;
                    }

                    $scope.$on("leafletDirectiveMap.moveend", function(event, args) {

                        $scope.setDirty(); 
                            $scope.mapboundary = leafletData.getMap("taxidrivermap").then(function(map) {
                                    return map.getBounds();
                                });
                            });


                        var isBoundary = function(coord) {
                            if (!$scope.mapboundary) return true;

                            var currboundary = $scope.mapboundary.$$state.value;
                            return currboundary._northEast.lat >= coord.loc[1] && currboundary._northEast.lng >= coord.loc[0] &&
                                currboundary._southWest.lat <= coord.loc[1] && currboundary._southWest.lng <= coord.loc[0]
                        }
                        var filtermarkers = function(rawdata) {
                            var minfine = 250;
                            var maxfine = 0;
                            var tallyamount = 0;
                            var allvio = {};

                            if (rawdata.length == 0) return;
                            changefiltertext("filterstats", "Filtering...");
                            var rs = _.filter(rawdata, function(item) {
                                var dataprop = item;
                                var is = (dataprop.loc != null && moment(dataprop.Date).isBetween($scope.fromdate, $scope.todate) && dataprop.Amount >= $scope.minAmount && 
                                    dataprop.Amount <= $scope.maxAmount && (_.find($scope.violations, {
                                    'name': dataprop.Description
                                }) || $scope.violations.length == 0) && (dataprop.Status == $scope.status || $scope.status == 'All'));
                                
                                 var isbound = is && (($scope.iscurrviewstats) ? isBoundary(dataprop) : true);

                                if (isbound){
                                    if (dataprop.Amount >= maxfine) maxfine = dataprop.Amount;
                                    if (dataprop.Amount <= minfine) minfine = dataprop.Amount;
                                    allvio[dataprop.Description] = {
                                        name: dataprop.Description,
                                        ticked: true
                                    };

                                    tallyamount += dataprop.Amount;
                                }
                                return isbound;
                            });

                            $scope.filteredMaxFine = maxfine;
                            $scope.filteredMinFine = minfine;
                            $scope.filtertotalviolations = _.keys(allvio).length;
                            _.map($scope.allviolations, function(item) {
                                item.ticked = (allvio[item.name]) ? true : false
                            });
                            $scope.filtertotalcount = rs.length;
                            $scope.filtertotalamount = tallyamount;
                            changefiltertext("filterstate", "Finish Calculating...");
                            return rs;
                        }
                        var setMapData = function(rawdata, stylef, bodyf) {
                            return $q(function(resolve, reject) {
                                resolve(addressPointsToMarkers(filtermarkers(rawdata), stylef, bodyf));
                            });
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
                                        enable: ['moveend', 'click'],
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
                        var medalstyleconfig = function(obj) {
                            return "map-marker";
                        }
                        var medaldataconfig = function(obj) {
                            return '<div class="icon">' + obj.Company_Name + '</div><div class="arrow" />';
                        }

                        var violationstyleconfig = function(obj) {
                            return 'map-marker ' + ((obj.Status == "Paid") ? "green" :
                                (obj.Status == "Outstanding") ? "red" : "");
                        };
                        var violationdataconfig = function(obj) {
                            return '<div class="icon">$' + obj.Amount + " " + obj.Description + " " + obj.Date +
                                '</div><div class="arrow" />';
                        }

                        var centerview = function() {
                            angular.extend($scope, {
                                center: {
                                    lat: 41.8369,
                                    lng: -87.6847,
                                    zoom: 9
                                }
                            });
                        }

                        var refreshMap = function(url, dataurl, setmap) {
                            centerview();
                            changefiltertext("filterstate", "Loading Data...");
                            loadMapData(url, dataurl).
                            then(changefiltertext("filterstate", "Filtering...")).
                            then(function(data) {
                                if (data.length == 0) return;
                                rawdata = data;
                                refreshViolationsdd(data);

                                return $q(function(resolve, reject) {
                                        resolve(setmap(data));
                                    })
                                    .then(function(data) {
                                        $scope.markers = data;
                                    }, function(error) {
                                        changefiltertext("filterstate", 'Failed: ' + error, "animated infinite fadeIn");
                                    }).finally(changefiltertext("filterstats", "Mapping Finished..."));

                            }, function(reason) {
                                changefiltertext("filterstate", 'Failed: ' + reason, "animated infinite fadeIn");
                            });
                        }

                        var refreshMapViolations = function(url, dataurl) {
                            refreshMap(url, dataurl, function(data) {
                                return setMapData(data, violationstyleconfig, violationdataconfig);
                            });
                        }

                        var refreshMapMedallions = function(url, dataurl) {
                            refreshMap(url, dataurl, function(data) {
                                return addressPointsToMarkers(data, medalstyleconfig, medaldataconfig);
                            });
                        }
                        changefiltertext("filterstate", "..."); refreshMapViolations.apply(this, ["", "data/violations_map.json"]);

                        $scope.mapViolations = function() {
                            $scope.table = '14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV';
                            refreshMapViolations.apply(this, ["", "data/violations_map.json"]);
                        }
                        $scope.mapMedallions = function() {
                            $scope.table = '1ONuiVrSyTeh6DBUOyvYUfWSi5s9sAgmVYsc8MF9i';
                            var query = "medallions?q={lat:{$gt:0},lng:{$lt:0}}&f={_id:0,Company_Name_UNEDITED:0,EDIT:0}";
                            refreshMapMedallions.apply(this, [query, ""]);
                        }

                        $scope.setDirty = function() {
                            $scope.mappingform.$setDirty(true);
                        }

                        $scope.centermap = function() {

                            if (!$scope.maploc) return;

                            changefiltertext("filterstate", "Mapping..." + $scope.maploc);

                            ReportService.requestloc($scope.maploc).success(function(data, status) {

                                var loc = data.results[0].geometry.location;
                                angular.extend($scope, {
                                    center: {
                                        lat: loc.lat,
                                        lng: loc.lng,
                                        zoom: 20
                                    }
                                });
                            }).
                            error(function(data, status) {
                                changefiltertext("filterstate", 'Failed: ' + status, "animated infinite fadeIn");
                            });
                        }

                        $scope.onchangeRedrawmap = function() {
                            if (rawdata.length == 0) return;

                            setMapData(rawdata, violationstyleconfig, violationdataconfig).
                            then(function(data) {
                                $scope.markers = data;
                                changefiltertext("filterstats", "Re-mapping Finished...");
                                $scope.mappingform.$setPristine(true);
                            }, function(err) {
                                changefiltertext("filterstate", "Error..." + err, "animated infinite fadeIn");
                            });
                        }
                    }]);
        }());