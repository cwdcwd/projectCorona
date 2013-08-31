var cfg = require('./config.js').DB;
var MongoClient = require('mongodb').MongoClient;

var URI = 'mongodb://'+process.env.MDB_USERNAME+':'+process.env.MDB_PASSWORD+'@'+ cfg.HOST + ':' + cfg.PORT + '/' + cfg.NAME

var db = null;

 // internally used timestamp label for faster sorting
var stampLabel = 'timestamp_q234568796234598'
console.log('Connecting to mongodb: '+URI);
MongoClient.connect(URI, function(err, pDb) {
    console.log(err);
    if(err) throw err;
    
    db = pDb.collection('events');
});

// ensures db connection is established before executing the callback
var waitForDB = function(callback) {
    if(db)
        callback();
    else
        setTimeout(function() {
            waitForDB(callback);
        }, 100);
};

// used to save a single event to database
exports.storeEvent = function(data) {
    waitForDB(function() {
        console.log("storing data...");
        console.log(data);
        console.log(cfg.TIMESTAMP_GETTER(data));
        data[stampLabel] = Date.parse(cfg.TIMESTAMP_GETTER(data));
        db.insert(data, function(err) {
            console.log(err);
            if(err) throw err;
        
            console.log('event written to database');
        });
    });
};

// fetches all relevant events from the database
// see config.js for filtering events
exports.retrieveEvents = function(callback) {
    waitForDB(function() {
        findOptions = {};
        findOptions[stampLabel] = { $gte: cfg.MAX_TIMESPAN == 0 ? 0 : (new Date()).getTime() - cfg.MAX_TIMESPAN };
        sortOptions = {}
        sortOptions[stampLabel] = -1;
        
        db.find(findOptions).sort(sortOptions).limit(cfg.MAX_EVENTS).toArray(function(err, docs) {
            console.log(err);
            if(err) throw err;
            
            console.log('events fetched from database');
            callback(docs);
        });
    });
}