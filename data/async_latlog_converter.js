var request = require('request');
var async = require('async');
var changeCase = require('change-case');
var fs = require('fs');
var srcfile = "C:\\Users\\objectbb\\taxidriver\\data\\violations.json";
var addrarray = [];
//var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?&l=1000000&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
/*
request({
    url: url,
    method: "GET",
    gzip: true,
    json: true
}, function(err, res, body) {
*/
fs.readFile(srcfile, 'utf8', function(err, data) {
    var body = JSON.parse(data);
    console.log(body.length);
    //console.log("push into array " + addrarray.length);
    var q = async.queue(function(item, done) {
        var gourl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + item.address + "&key=AIzaSyBqK4f8zbMrK4K5cxWb8_10Zkbk7LHMrKE";
        //var gourl = "http://geocoder.maplarge.com/geocoder/json?address=" + item.address + "&city=Chicago&state=IL&key=YOUR_API_KEY"
        //console.log(gourl);
        request(gourl, function(err, res, body) {
            if (err) return done(err);
            if (res.statusCode != 200) return done(res.statusCode);
            done();
            request({
                url: gourl,
                method: "GET",
                gzip: true,
                json: true
            }, function(err, res, body) {
                if (body.results != undefined && body.results[0] != undefined && body.results[0].geometry != undefined && body.results[0].geometry.location != undefined) {
                    var loc = body.results[0].geometry.location;
                    var addr = changeCase.upper(body.results[0].formatted_address);
                    var cmpnts = body.results[0].address_components;
                    var shortaddr = cmpnts[0]["short_name"] + " " + changeCase.upper(cmpnts[1]["short_name"]) + "," + cmpnts[2]["short_name"];
                    console.log(item.Id + ", " + shortaddr + "," + loc.lat + "," + loc.lng);
                    /*
                    var query = "https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL&q={\"_id\":'" + item.Id + "'}";
                    request({
                        url: query,
                        method: "PUT",
                        json: {
                            "$set": {
                                "Lat": loc.lat,
                                "Lon": loc.lng
                            }
                        }
                    }, function(err, res, body) {
                        // console.log( body.message)
                    }, function(err) { 
                        //console.error("%s", err.message);
                        //console.log("%j", err.res.statusCode);
                    });*/
                } else console.log(item.Id + ", " + item.address + "   " + JSON.stringify(body, null, 4));
            }, function(err) {
                //console.error("%s", err.message);
                //console.log("%j", err.res.statusCode);
            });
        });
    }, 5, function(err) {
        console.error("%s", err.message);
        console.log("%j", err.res.statusCode);
    });
    for (var i = 0; i < 10; i++) {
        //console.log("okay queuing up...");
        setTimeout(function(i) {
            q.push({
                Id: body[i]._id.$oid,
                address: body[i].Address + ",Chicago, IL"
            });
        }, 1000);
    }
});