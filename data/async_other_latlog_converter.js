var request = require('request');
var async = require('async');
var changeCase = require('change-case');
var fs = require('fs');
var addrarray = [];
//mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c latlog -u taxidriver -p taxidriver --file latlog.csv
//var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?&l=1000000&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
//mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c latlog -u taxidriver -p taxidriver --file latlog.csv --type csv --headerline


var aegisprof = {
    url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text={{ADDRESS}}&forStorage=true&token={{TOKEN}}&f=pjson",
    token: "EaHlhKf3lWoWjEBLlibsDJX2-BAUkrh_vZreMc3e2d82gf2gD71xThBYnL0vulTLEiqWPG-DfQqvjjDyjA-h66jeN7XhHHVxfP5LNhSCSqOM7b2j8lxXIRpzYDDX3FFfmRtcq8rY3D9TcTcZnG0LGg..",
    requesturl: function(url, address, token) {
        return url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", token);
    },
    response: function(item, body) {
        if (body != null && body.locations != null) {
            var loc = body.locations[0];
            console.log(item.Id + ", " + loc.name + "," + loc.feature.geometry.x + "," + loc.feature.geometry.y);
        }
    }
};


var google = {
        url: "https://maps.googleapis.com/maps/api/geocode/json?address={{ADDRESS}}&key={{TOKEN}}",
        token: "AIzaSyBqK4f8zbMrK4K5cxWb8_10Zkbk7LHMrKE",
        requesturl: function(url, address, token) {
            return url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", token);
        },
        response: function(item, body) {
            if (body.results != undefined && body.results[0] != undefined && body.results[0].geometry != undefined && body.results[0].geometry.location != undefined) {
                var loc = body.results[0].geometry.location;
                var addr = changeCase.upper(body.results[0].formatted_address);
                var cmpnts = body.results[0].address_components;
                var shortaddr = cmpnts[0]["short_name"] + " " + changeCase.upper(cmpnts[1]["short_name"]) + "," + cmpnts[2]["short_name"];
                console.log(item.Id + ", " + shortaddr + "," + loc.lat + "," + loc.lng);
            }
        }
    };

            var srcfile = "C:\\Users\\objectbb\\taxidriver\\data\\violations.json";
        fs.readFile(srcfile, 'utf8', function(err, data) {
            var body = JSON.parse(data);
            var q = async.queue(function(item, done) {

                    var geocodeer = google;
                    var gourl = geocodeer.requesturl(geocodeer.url, item.address, geocodeer.token);

                    request(gourl, function(err, res, body) {
                        if (err) {
                            JSON.stringify(err);
                            return done(err);
                        }
                        if (res.statusCode != 200) return done(res.statusCode);
                        done();
                        request({
                                url: gourl,
                                method: "GET",
                                json: true,
                                gzip: true
                            }, function(err, res, body) {
                                geocodeer.response(item, body);
                            },
                            function(err) {
                                console.error("%s", err.message);
                                console.log("%j", err.res.statusCode);
                            });
                    });
                },
                1);

            for (var i = 0; i < 2; i++) {
                q.push({
                    Id: body[i]._id.$oid,
                    address: body[i].Address + ",Chicago,IL"
                });
            }
        });