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
var Url = require("url");

var app = express();
app.use(express.logger());
app.use(express.static(__dirname + '/public'));
console.log("[SERVER]: Firing up!");

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
console.log('[SERVER]: calling authenticate with username: ' + process.env.CDF_USERNAME + ' password: ' + process.env.CDF_PASSWORD);
org.authenticate({username: process.env.CDF_USERNAME, password: process.env.CDF_PASSWORD}, function(err, resp){
    if(!err) {
        console.log('[SFDC]: Access Token: ' + resp.access_token);
        oauth = resp;

        // subscribing to push topic
        console.log('[SFDC]: subscribing to push topic ' + config.PUSH_TOPIC);
        var str = org.stream(config.PUSH_TOPIC, oauth);

        // connect handler
        str.on('connect', function(){
            console.log('[STREAMING]: connected to pushtopic');
        });

        // error handler
        str.on('error', function(error) {
            console.log('[STREAMING] error: ' + error);
        });

        // emit received data to connected clients
        str.on('data', function(data) {
            if(config.PRINTDATA) 
                console.log(data);
            else
                console.log('*');

            //console.log(socket.manager.handshaken);
			
			if(!data || !data.sobject) return;
			
            var location = data.sobject[config.SFNS+'Country__c'];
			var community = data.sobject[config.SFNS+'Challenge__r.'+config.SFNS+'Community__r.'+config.SFNS+'Community_Id__c'];
			var challenge = data.sobject[config.SFNS+'Challenge__r.'+config.SFNS+'Challenge_Id__c'];
			var eventType = data.sobject[config.SFNS+'Data_Type__c'];
			if(location) location = location.toLowerCase();
			if(community) community = community.toLowerCase();
			if(eventType) eventType = eventType.toLowerCase();
			if(location) location = location.toLowerCase();
			
			
            for (var name in socket.manager.handshaken) {
				if (socket.manager.handshaken.hasOwnProperty(name)== false) continue;
				var options = getFilterFromUrl(socket.manager.handshaken[name].url);
				console.log('Filters');
				console.log(options);
				if(options && options.filter){
						
					if(options.filter.location && location != options.filter.location.toLowerCase())
						continue;
					if(options.filter.community && community != options.filter.community.toLowerCase())
						continue;
					if(options.filter.challenge && challenge != options.filter.challenge.toLowerCase())
						continue;
					if(options.filter.eventType && eventType != options.filter.eventType.toLowerCase())
						continue;
				}
				//socket.emit(config.PUSH_TOPIC, JSON.stringify(data));
                console.log('.');
				io.sockets.socket(name).emit(config.PUSH_TOPIC, JSON.stringify(data));
			}
            
        });

         str.on('disconnect', function() {
            console.log('[STREAMING][FATAL]: Disconnected from the CS org\'s streaming API topic.');
        });       

    } else {
        console.log('[STREAMING] error: ' + err.message);
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
    console.log("[SERVER]: Listening on " + port);
    //console.log(config);
});

// attach socket.io and listen
var io = require('socket.io').listen(server);
// get a reference to the socket once a client connects

io.configure(function () {

    if(config.LONGPOLLINGON===true)
    {
        console.log("[SOCKET]: Long polling turned on.");
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 5);
    }
    else
        console.log("[SOCKET]: Long polling turned off.");

  io.set("log level", 0);
});

var socket = io.sockets.on('connection', function (socket) {
    console.log('[SOCKET]: new client connected');
    console.log(socket.handshake.url);
    socket.on('disconnect', function () { console.log('[SOCKET]: socket disconnected'); });
    //>>2879
    var options = getFilterFromUrl(socket.handshake.url);
    console.log('Options:');
    console.log(options);
    //<<2879

    var preload=function(events){
        var minDelay = parseFloat(config.DB.MIN_DELAY) / events.length;
        var maxDelta = parseFloat(config.DB.MAX_DELAY) / events.length - minDelay;

        console.log('[SFDC]: sending preload data');
        for(i in events)
            var closure = function() {
                var data = JSON.stringify(events[i]);
                var delay = (minDelay + Math.random()*maxDelta) * (parseInt(i)+1);
                setTimeout(function() { socket.emit(config.PUSH_TOPIC, data); }, delay);
            }();
      };

      activities.fetchActivities(org,config.DB.RECORDLIMIT,oauth,preload,options);

	});
;

//>>2879
function getFilterFromUrl(urlString){
	var u = Url.parse(urlString,true);
	var options = {filter:{}};
    options.filter.location = u.query.location;
    options.filter.community = u.query.community;
    options.filter.challenge = u.query.challenge;
    options.filter.eventType = u.query.eventType;
    return options;
}
//<<2879
