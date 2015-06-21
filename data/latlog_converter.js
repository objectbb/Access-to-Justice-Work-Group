var request = require('request');
var async = require('async');
var changeCase = require('change-case');
var fs = require('fs');
var temporal = require("temporal");
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
            console.log(item.row + "," + item.Id + ", " + loc.name + "," + loc.feature.geometry.x + "," + loc.feature.geometry.y);
        }
    }
};


var google = {
    limit: 2500, //day
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
            console.log(item.row + "," + item.Id + ", " + shortaddr + "," + loc.lat + "," + loc.lng);
        }
    }
};


var bing = {
    limit: 10000, //month
    url: "http://dev.virtualearth.net/REST/v1/Locations?q={{ADDRESS}}&key={{TOKEN}}",
    token: "AhNZRmjwaLBGX2UneEJzZbvxBnzRwND1tJvCrz6g3wn-NEn3qvHX7ioBldWZb5VO",
    requesturl: function(url, address, token) {
        return url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", token);
    },
    response: function(item, body) {
        if (body.resourceSets != null && body.resourceSets[0].resources[0] != null &&
            body.resourceSets[0].resources[0].point != null &&
            body.resourceSets[0].resources[0].point.coordinates != null) {

            var loc = body.resourceSets[0].resources[0].point.coordinates;
            var addr = changeCase.upper(body.resourceSets[0].resources[0].name);
            console.log(item.row + "," + item.Id + ", " + addr + "," + loc[0] + "," + loc[1]);
        }
    }
};


var decarta = {
    limit: 5000, //day
    url: "http://api.decarta.com/v1/{{TOKEN}}/geocode/{{ADDRESS}}.json",
    token: "6e1b0a90f877ec44a7fd2e422c9f3af8",
    requesturl: function(url, address, token) {
        return url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", token);
    },
    response: function(item, body) {
        if (body != null && body.results != null && body.results[0] != null &&
            body.results[0].position != null) {

            var loc = body.results[0].position;
            if(body.results[0].address.freeformAddress != null)
                 addr = body.results[0].address.freeformAddress;
            console.log(item.row + "," + item.Id + ", " + addr + "," + loc.lat + "," + loc.lon);
        }
    }
};

var geocodeer = google;
var srcfile = "C:\\Users\\objectbb\\taxidriver\\data\\violations.json";
fs.readFile(srcfile, 'utf8', function(err, data) {
    var body = JSON.parse(data);
    var q = async.queue(function(item, done) {

         
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

    var start = 3985;
    for (var i = start; i < geocodeer.limit + start; i++) {
        q.push({
            row: i,
            Id: body[i]._id.$oid,
            address: body[i].Address + ",Chicago,IL"
        });
    }
});