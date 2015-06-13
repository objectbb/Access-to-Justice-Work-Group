var request = require('request');
var async = require('async');
var changeCase = require('change-case');
var fs = require('fs');
var addrarray = [];
//mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c latlog -u taxidriver -p taxidriver --file latlog.csv
//var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?&l=1000000&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
//mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c latlog -u taxidriver -p taxidriver --file latlog.csv --type csv --headerline

var srcfile = "C:\\Users\\objectbb\\taxidriver\\data\\medallions.json";
fs.readFile(srcfile, 'utf8', function(err, data) {
    var body = JSON.parse(data);
    var q = async.queue(function(item, done) {
        var gourl = "http://geocoder.maplarge.com/geocoder/json?address=" + item.address + "&city=Chicago&state=IL&key=YOUR_API_KEY"
            //console.log(gourl);
        request(gourl, function(err, res, body) {
            if (err) return done(err);
            if (res.statusCode != 200) return done(res.statusCode);
            done();
            request({
                url: gourl,
                method: "GET",
                json: true,
                gzip: true
            }, function(err, res, body) {
                if (body != null) {
                    body.Id = item.Id;
                    body.address = item.address;


                    var wtf = "";
                    for (var x in body){
                        wtf +=  body[x] + ",";
                    }

                    console.log(wtf.slice(0,-1));
                }
            }, function(err) {
                //console.error("%s", err.message);
                //console.log("%j", err.res.statusCode);
            });
        });
    }, 5);
 
    for (var i = 0; i < body.length; i++) {
        q.push({
            Id: body[i]._id.$oid,
            address: body[i].Address+ ",Chicago,IL"
        });
    }
});