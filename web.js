/**
 * Corona NodeJS App
 * Connect to Salesforce Streaming API
 *
 * Date: 2013/07/16/
 */

var config = require('./config.js');
var activities=require('./sfdc.js');
var express = require("express");
var nforce = require('nforce');
var fs = require("fs");

var app = express();
app.use(express.logger());
app.use(express.static(__dirname + '/public'));
console.log("Firing up!");

// create connection to salesforce
var org = nforce.createConnection({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    redirectUri: config.CALLBACK_URL,
    apiVersion: config.API_VERSION, // optional, defaults to v24.0
    environment: config.ENVIRONMENT // optional, sandbox or production, production default
});

// authenticate using CDF_USERNAME and CDF_PASSWORD environment variables
var oauth;
console.log('calling authenticate with username: ' + process.env.CDF_USERNAME + ' password: ' + process.env.CDF_PASSWORD);
org.authenticate({username: process.env.CDF_USERNAME, password: process.env.CDF_PASSWORD}, function(err, resp){
    if(!err) {
        console.log('Access Token: ' + resp.access_token);
        oauth = resp;

        // subscribing to push topic
        console.log('subscribing to push topic ' + config.PUSH_TOPIC);
        var str = org.stream(config.PUSH_TOPIC, oauth);

        // connect handler
        str.on('connect', function(){
            console.log('connected to pushtopic');
        });

        // error handler
        str.on('error', function(error) {
            console.log('error: ' + error);
        });

        // emit received data to connected clients
        str.on('data', function(data) {
            console.log(data);
            socket.emit(config.PUSH_TOPIC, JSON.stringify(data));
        });

    } else {
        console.log('Error: ' + err.message);
    }
});

/*
// home
app.get('/', function(request, response) {
    response.send('<h1>Launch demo</h1>'
        + '<a href="/UI-01">UI-01</a>'
        + '<br>'
        + '<a href="/UI-02/map-visualization.html">UI-02</a>');
    //response.send('CALLBACK_URL: ' + config.CALLBACK_URL);
    //response.send('CALLBACK_URL: ' + config.CALLBACK_URL);
}); */

// run app
var port = process.env.PORT || 5000;
var server = app.listen(port, function() {
    console.log("Listening on " + port);
    //console.log(config);
});

// attach socket.io and listen
var io = require('socket.io').listen(server);
// get a reference to the socket once a client connects
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 5);
io.set("log level", 3);
});

var socket = io.sockets.on('connection', function (socket) { 
    console.log('new client connected');
    var preload=function(events){
        var minDelay = parseFloat(config.DB.MIN_DELAY) / events.length;
        var maxDelta = parseFloat(config.DB.MAX_DELAY) / events.length - minDelay;
        for(i in events)
            var closure = function() {
                var data = JSON.stringify(events[i]);
                var delay = (minDelay + Math.random()*maxDelta) * (parseInt(i)+1);
                setTimeout(function() { socket.emit(config.PUSH_TOPIC, data); }, delay);
            }();
      };

      activities.fetchActivities(org,config.DB.RECORDLIMIT,oauth,preload);

});