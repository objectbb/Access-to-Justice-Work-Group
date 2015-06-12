var request = require('request');
var Promise = require("promise");
var changeCase = require('change-case');
var url = "https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?&l=1000000&apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL";
var addrarray = [];
//console.log("getting addresses...");
//mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c anov -u taxidriver -p taxidriver --type csv --headerline --file "C:\\Users\\objectbb\\Downloads\\Doc & ANOV #.csv"
//mongo ds041992.mongolab.com:41992/taxidriver -u objectbb -p superF12
//mongo ds041992.mongolab.com:41992/taxidriver -u objectbb -p superF12
//https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL
/*
mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c medallions -u taxidriver -p taxidriver --type csv --headerline --file "C:\\Users\\objectbb\\Downloads\\Taxi Medallion Holders_Summary.csv"

mongoimport -h ds041992.mongolab.com:41992 -d taxidriver -c violation_arbitration -u taxidriver -p taxidriver --type csv --headerline --file "C:\\Users\\objectbb\\Downloads\\Violations_Report.csv"
*/
//https://api.mongolab.com/api/1/databases/taxidriver/collections?apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL
requestp({
    url: url,
    method: "GET",
    json: true
}).then(function(body) {
    console.log("push into array");
    console.log(body.length);
    for (var i = 0; i < 1; i++) {
        addrarray.push({
            Id: body[i]._id.$oid,
            address: body[i].Address + ",Chicago, IL"
        });
    }
    // } else console.log(response.statusCode)
    console.log(addrarray.length + " count..." + addrarray[0].Id);
    console.log("now geocoding..." + addrarray.length);
    var len = addrarray.length;

    function done(){
        for (var i = 0; i < 1; i++) {
            //setTimeout(function() {}, 1000);
            var gourl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addrarray[i].address + "&key=AIzaSyBqK4f8zbMrK4K5cxWb8_10Zkbk7LHMrKE";
            console.log()
            requestp({
                url: gourl,
                method: "GET",
                json: true
            }).then(function(body) {
                console.log("wtf");
                returnlatlog(body, addrarray[i]);
            }, function(err) {
                console.error("%s", err.message);
                console.log("%j", err.res.statusCode);
            });
        }
    }
}, function(err) {
    console.error("%s", err.message);
    console.log("%j", err.res.statusCode);
});

function returnlatlog(body, row) {
    console.log("about to update..." + body.results[0].formatted_address);
    // if (body != undefined && body.results != undefined && body.results[0] != undefined && 
    // body.results[0].geometry != undefined) {
    var loc = body.results[0].geometry.location;
    var addr = changeCase.upper(body.results[0].formatted_address);
    var cmpnts = body.results[0].address_components;
    //var rowid = addrarray.Id;
    //var shortaddr = cmpnts[0]["short_name"] + " " + changeCase.upper(cmpnts[1]["short_name"]) + "," + cmpnts[2]["short_name"];
    //  if (!error) {               
    console.log("about to update..." + row);
    /*     
    var updateurl = "https://www.googleapis.com/fusiontables/v2/query?sql=update 14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV" + 
    " set  lat=" + loc.lat + ", log=" + loc.lng + " where ROWID='" + rowid + "'&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";
    console.log(updateurl);
    requestp({
        url: updateurl,
        method: "POST",
        json: true
    }).then(function(body) {
        console.log(body);
    }, function(err) {
        console.error("%s", err.message);
        console.log("%j", err.res.statusCode);
    });
    */
    console.log(rowid + "   " + shortaddr + "," + addr + ", " + loc.lat + "," + loc.lng);
    //} else console.log(error);
    //       }
}

function requestp(json) {
    json = json || false;
    return new Promise(function(resolve, reject) {
        request(json, function(err, res, body) {
            if (err) {
                return reject(err);
            } else if (res.statusCode !== 200) {
                err = new Error("Unexpected status code: " + res.statusCode);
                err.res = res;
                console.log(res);
                return reject(err);
            }
            resolve(body);
        });
    });
}