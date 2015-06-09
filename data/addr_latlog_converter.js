var request = require('request');
var url = "https://www.googleapis.com/fusiontables/v2/query?sql=select  *  from 14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ";
var addrarray = []

    console.log("getting addresses...");
request({
    url: url,
    method: "GET",
    json: true
}, function(error, response, body) {
    if (!error && response.statusCode == 200) {
        var len = body.rows.length;
        for (var i = 0; i < len; i++) {
            var addr = body.rows[i][4] + ",Chicago, IL";
            addrarray.push(addr);
        }
    } else console.log(response.statusCode)

    console.log("now geocoding...");
    var len = addrarray.length;
    for (var i = 37000; i < 41000; i++) {
        setTimeout(function() {}, 1000);
        var gourl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addrarray[i] + "&key=AIzaSyBqK4f8zbMrK4K5cxWb8_10Zkbk7LHMrKE";
        request({
            url: gourl,
            method: "GET",
            json: true
        }, function(error, response, body) {
            if (body != undefined && body.results != undefined && body.results[0] != undefined  &&
                body.results[0].geometry != undefined) {
                var loc = body.results[0].geometry.location;
                var addr = body.results[0].formatted_address;
                if (!error) console.log(addr + ", " + loc.lat + "," + loc.lng);
                else console.log(error);
            }
        });
    }
});