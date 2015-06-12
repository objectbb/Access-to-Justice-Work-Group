var request = require('request');
var Promise = require('promise');
var changeCase = require('change-case');
/*
var url = 'https://www.googleapis.com/fusiontables/v2/query?sql=select  *  from 14EXK6TvoG0XUY9PJzxUPfLTl5FjlsSEeidkA8mNV&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ';

requestp({
    url: url,
    method: 'GET',
    json: true
}).then(function(body) {
*/
    var gourl = 'https://api.mongolab.com/api/1/databases/taxidriver/collections/violations?apiKey=mPLH9KwucKxZZSYDjpAqE1zlZicfCpxL'
   
    //console.log('inserting ' + body.rows.length + ' rows');

    console.log('JSON.stringify(body.rows)');
    
    requestp({
        url: gourl,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        json: true
    }).then(function(body) {
         console.log('return something');
        console.log(body);
    }, function(err){
        console.error('%s', err.message);
        console.log('%j', err.res.statusCode);
    });
//});

function requestp(json) {
    json = json || false;
    return new Promise(function(resolve, reject) {
        request(json, function(err, res, body) {
            if (err) {
                return reject(err);
            } else if (res.statusCode !== 200) {
                err = new Error('Unexpected status code: ' + res.statusCode);
                err.res = res;
                console.log(res);
                return reject(err);
            }
            resolve(body);
        });
    });
}