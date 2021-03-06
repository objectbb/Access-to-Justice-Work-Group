var request = require('request');
var async = require('async');
var changeCase = require('change-case');
var fs = require('fs');
var temporal = require("temporal");
var addrarray = [];

var opencagedata = {
    limit: 2500, //day
    url: "https://api.opencagedata.com/geocode/v1/google-v3-json?address={{ADDRESS}}&key={{TOKEN}}",
    token: "c5a8c626ef0cf7b9c5c5959c4d689391",
    requesturl: function(address) {
        return this.url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", this.token);
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

var geocodio = {
    limit: 2500, //day
    url: "https://api.geocod.io/v1/geocode?q={{ADDRESS}}&api_key={{TOKEN}}",
    token: "87bbb9b55565f538b9b5b859b2525b52f5f00c5",
    requesturl: function(address) {
        return this.url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", this.token);
    },
    response: function(item, body) {
        if (body.results != undefined && body.results[1] != undefined) {
            var loc = body.results[1].location;
            var addr = changeCase.upper(body.results[0].formatted_address);
            console.log(item.row + "," + item.Id + ", " + addr + "," + loc.lat + "," + loc.lng);
        }
    }
};


var google = {
    limit: 2500, //day
    url: "https://maps.googleapis.com/maps/api/geocode/json?address={{ADDRESS}}&key={{TOKEN}}",
    token: "AIzaSyBqK4f8zbMrK4K5cxWb8_10Zkbk7LHMrKE",
    requesturl: function(address) {
        return this.url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", this.token);
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
    requesturl: function(address) {
        return this.url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", this.token);
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
    requesturl: function(address) {
        return this.url.replace("{{ADDRESS}}", address).replace("{{TOKEN}}", this.token);
    },
    response: function(item, body) {
        if (body != null && body.results != null && body.results[0] != null &&
            body.results[0].position != null) {

            var loc = body.results[0].position;
            if (body.results[0].address.freeformAddress != null)
                addr = body.results[0].address.freeformAddress;
            console.log(item.row + "," + item.Id + ", " + addr + "," + loc.lat + "," + loc.lon);

            return true;
        }
        return false;
    }
};

var geocodeer = decarta;
var srcfile = "C:\\Users\\objectbb\\taxidriver\\data\\violations.json";
fs.readFile(srcfile, 'utf8', function(err, data) {
    var body = JSON.parse(data);
    var q = async.queue(function(item, done) {

            var gourl = geocodeer.requesturl(item.address);

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
                        if (!geocodeer.response(item, body))
                            var str = item.row + "," + item.Id + ", " + item.address + "\r\n";
                            fs.appendFile('./leftover.csv', str, function(err) {
                                if (err) {
                                    console.error("Could not write file: %s", err);
                                }
                            });

                    },
                    function(err) {
                        console.error("%s", err.message);
                        console.log("%j", err.res.statusCode);
                    });
            });
        },
        1);
    var start = 0;
    for (var i = start; i < geocodeer.limit + start; i++) {
        if(body[i])
            q.push({
                row: i,
                Id: body[i]._id.$oid,
                address: body[i].Address + ",Chicago,IL"
            });
    }
});