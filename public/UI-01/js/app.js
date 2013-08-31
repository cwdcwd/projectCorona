var Corona = (function() {

    // Construnctor
    function Corona(paper) {
        this.paper = paper;
        this.container = $("#world-map-container");
        this.markerSet = paper.set();
        this.stats = {};
        for(var type in markerConfig) {
            this.stats[type] = {};
            this.stats[type].count = 0;
        }

        // default time range is (1 day ago ~ now)
        this.endTime = Math.floor((new Date()).getTime()/1000);
        this.startTime = this.endTime - 60*60*24;

        // drawings
        drawWorldMap(this.paper);
        drawStatBox(this.paper, this.stats);

        initTimeRangeSlide(this);
    }

    // marker configuration depending on the activity type.
    var markerConfig = {
        "forumPost": {
            pathstr: "M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z",
            color: "#1456a5"
        },
        "userLogin": {
            pathstr: "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM20.729,7.375c0.934,0,1.688,1.483,1.688,3.312S21.661,14,20.729,14c-0.932,0-1.688-1.483-1.688-3.312S19.798,7.375,20.729,7.375zM11.104,7.375c0.932,0,1.688,1.483,1.688,3.312S12.037,14,11.104,14s-1.688-1.483-1.688-3.312S10.172,7.375,11.104,7.375zM16.021,26c-2.873,0-5.563-1.757-7.879-4.811c2.397,1.564,5.021,2.436,7.774,2.436c2.923,0,5.701-0.98,8.215-2.734C21.766,24.132,18.99,26,16.021,26z",
            color: "#F57124"
        },
        "challengeCreation": {
            pathstr: "M22.441,28.181c-0.419,0-0.835-0.132-1.189-0.392l-5.751-4.247L9.75,27.789c-0.354,0.26-0.771,0.392-1.189,0.392c-0.412,0-0.824-0.128-1.175-0.384c-0.707-0.511-1-1.422-0.723-2.25l2.26-6.783l-5.815-4.158c-0.71-0.509-1.009-1.416-0.74-2.246c0.268-0.826,1.037-1.382,1.904-1.382c0.004,0,0.01,0,0.014,0l7.15,0.056l2.157-6.816c0.262-0.831,1.035-1.397,1.906-1.397s1.645,0.566,1.906,1.397l2.155,6.816l7.15-0.056c0.004,0,0.01,0,0.015,0c0.867,0,1.636,0.556,1.903,1.382c0.271,0.831-0.028,1.737-0.739,2.246l-5.815,4.158l2.263,6.783c0.276,0.826-0.017,1.737-0.721,2.25C23.268,28.053,22.854,28.181,22.441,28.181L22.441,28.181z",
            color: "#1456a5"
        },
        "challengeRegistration": {
            pathstr: "M8.179,20.115c-0.478,0.277-0.642,0.889-0.365,1.366c0.275,0.479,0.889,0.642,1.365,0.366c0.479-0.275,0.643-0.888,0.367-1.367C9.27,20.004,8.658,19.84,8.179,20.115zM9.18,12.239c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366c0.479,0.276,1.09,0.113,1.367-0.366C9.821,13.126,9.657,12.516,9.18,12.239zM8.625,17.043c-0.001-0.552-0.448-0.999-1.001-1c-0.553,0-1,0.448-1,1c0,0.553,0.449,1,1,1C8.176,18.043,8.624,17.596,8.625,17.043zM16.312,3.957V3.031h1c0.275,0,0.5-0.225,0.5-0.5v-0.5c0-0.275-0.225-0.5-0.5-0.5h-3.625c-0.275,0-0.5,0.225-0.5,0.5v0.5c0,0.275,0.225,0.5,0.5,0.5h1v0.926C7.819,4.381,2.376,10.068,2.374,17.042C2.376,24.291,8.251,30.166,15.5,30.169c7.249-0.003,13.124-5.878,13.125-13.127C28.624,10.067,23.181,4.38,16.312,3.957zM15.5,27.166C9.909,27.157,5.385,22.633,5.375,17.042C5.385,11.451,9.909,6.927,15.5,6.917c5.59,0.01,10.115,4.535,10.124,10.125C25.615,22.633,21.091,27.157,15.5,27.166zM12.062,22.998c-0.478-0.275-1.089-0.111-1.366,0.367c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.277,1.091,0.111,1.365-0.365C12.704,23.887,12.54,23.275,12.062,22.998zM12.062,11.088c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,11.2,11.584,11.364,12.062,11.088zM22.822,13.971c0.478-0.275,0.643-0.888,0.366-1.366c-0.275-0.478-0.89-0.642-1.366-0.366c-0.479,0.278-0.642,0.89-0.366,1.367C21.732,14.083,22.344,14.247,22.822,13.971zM15.501,23.92c-0.552,0-1,0.447-1,1c0,0.552,0.448,1,1,1s1-0.448,1-1C16.501,24.367,16.053,23.92,15.501,23.92zM19.938,9.355c-0.477-0.276-1.091-0.111-1.365,0.366c-0.275,0.48-0.111,1.091,0.366,1.367s1.089,0.112,1.366-0.366C20.581,10.245,20.418,9.632,19.938,9.355zM23.378,16.042c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1c0.551,0,1-0.447,1-1C24.378,16.492,23.929,16.042,23.378,16.042zM22.823,20.115c-0.48-0.275-1.092-0.111-1.367,0.365c-0.275,0.479-0.112,1.091,0.367,1.367c0.477,0.275,1.089,0.112,1.365-0.366C23.464,21.004,23.3,20.391,22.823,20.115zM15.501,8.167c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96c-0.478,0.277-0.642,0.889-0.365,1.366c0.275,0.479,0.889,0.642,1.365,0.366l3.305-1.676c0.055,0.006,0.109,0.017,0.166,0.017c0.828,0,1.5-0.672,1.5-1.5l-0.5-7.876C16.501,8.614,16.053,8.167,15.501,8.167zM18.939,22.998c-0.479,0.276-0.643,0.888-0.366,1.367c0.275,0.477,0.888,0.642,1.366,0.365c0.478-0.276,0.642-0.889,0.366-1.365C20.028,22.886,19.417,22.723,18.939,22.998zM11.197,3.593c-0.836-1.04-2.103-1.718-3.541-1.718c-2.52,0-4.562,2.042-4.562,4.562c0,0.957,0.297,1.843,0.8,2.576C5.649,6.484,8.206,4.553,11.197,3.593zM27.106,9.014c0.503-0.733,0.8-1.619,0.8-2.576c0-2.52-2.043-4.562-4.562-4.562c-1.438,0-2.704,0.678-3.541,1.717C22.794,4.553,25.351,6.484,27.106,9.014z",
            color: "#1456a5"

        },
        "challengeSubmission": {
            pathstr: "M22.5,8.5v3.168l3.832,3.832L22.5,19.332V22.5l7-7L22.5,8.5zM8.5,22.5v-3.168L4.667,15.5L8.5,11.668V8.5l-7,7L8.5,22.5zM15.5,14.101c-0.928,0-1.68,0.751-1.68,1.68c0,0.927,0.752,1.681,1.68,1.681c0.927,0,1.68-0.754,1.68-1.681C17.18,14.852,16.427,14.101,15.5,14.101zM10.46,14.101c-0.928,0-1.68,0.751-1.68,1.68c0,0.927,0.752,1.681,1.68,1.681s1.68-0.754,1.68-1.681C12.14,14.852,11.388,14.101,10.46,14.101zM20.541,14.101c-0.928,0-1.682,0.751-1.682,1.68c0,0.927,0.754,1.681,1.682,1.681s1.68-0.754,1.68-1.681C22.221,14.852,21.469,14.101,20.541,14.101z",
            color: "#F57124"
        },
        "scorecardSubmission": {
            pathstr: "M14.615,4.928c0.487-0.986,1.284-0.986,1.771,0l2.249,4.554c0.486,0.986,1.775,1.923,2.864,2.081l5.024,0.73c1.089,0.158,1.335,0.916,0.547,1.684l-3.636,3.544c-0.788,0.769-1.28,2.283-1.095,3.368l0.859,5.004c0.186,1.085-0.459,1.553-1.433,1.041l-4.495-2.363c-0.974-0.512-2.567-0.512-3.541,0l-4.495,2.363c-0.974,0.512-1.618,0.044-1.432-1.041l0.858-5.004c0.186-1.085-0.307-2.6-1.094-3.368L3.93,13.977c-0.788-0.768-0.542-1.525,0.547-1.684l5.026-0.73c1.088-0.158,2.377-1.095,2.864-2.081L14.615,4.928z",
            color: "#F57124"
        }

    };

    // adds activity to the world map. 
    Corona.prototype.addActivity = function(activity) {
        var xy = getXY(activity.latitude, activity.longitude);
        var xyStr = "T" + xy[0] + "," + xy[1];
        var attrs = markerConfig[activity.dataType];

        // add marker
        var marker = this.paper.path(attrs.pathstr)
        marker.attr({
            fill: attrs.color, 
            stroke: "none", 
            title: activity.dataType, cursor: "pointer"
        });
        marker.transform("S0.1" + xyStr);

        // set opacity of marker if this activity happened past.
        if(activity.timestamp < this.endTime) {
            // older activity, lower opacity.
            var ratio = (activity.timestamp-this.startTime)/(this.endTime-this.startTime);
            marker.attr({opacity: ratio});
        }
        marker.animate({transform: "S0.3" + xyStr}, 1000, "elastic");

        // add message box
        var box = $("<div class='message-box'></div>");
        box.css({left: xy[0] + 25, top: xy[1] + 12}).hide();
        box.append("<div class='time'> " + strFromTimestamp(activity.timestamp) + " </div>");
        box.append("<div class='text'>" + activity.content + "</div>");
        box.append("<div><img src=\""+activity.profilePic+"\"/></div>");
        this.container.append(box);
        box.fadeIn("slow");

        // make message box disappear after 2 secs.
        setTimeout(function() {
            box.fadeOut("slow");
        }, 2000);

        // set hover event, showing message box and bigger marker.
        marker.hover(function() {
            marker.stop().animate({transform: "S1" + xyStr}, 200);
            box.show();
        }, function() {
            marker.stop().animate({transform: "S0.3" + xyStr}, 200);
            box.hide();
        });

        // updates stats
        this.stats[activity.dataType].count += 1;
        this.updateStats();

        // save activity and marker
        marker.data('activity', activity);
        this.markerSet.push(marker);
    };


    // shows activities having timestamps between start and end.
    Corona.prototype.setTimeRange = function(start, end) {
        // console.log(start, end);

        // if end is null, it means now.
        if(!end) { end = Math.floor((new Date()).getTime()/1000); }
        this.startTime = start;
        this.endTime = end;

        this.resetStats();

        var self = this;
        this.markerSet.forEach(function(marker) {
            var activity = marker.data("activity");

            // shows activities between start and end.
            if(activity.timestamp >= start && activity.timestamp <= end) {
                var ratio = (activity.timestamp-start)/(end-start);
                marker.attr({opacity: ratio});
                marker.show();

                self.stats[activity.dataType].count += 1;
            }
            else {
                marker.hide();
            }
        });

        this.updateStats();
    };

    Corona.prototype.updateStats = function() {
        for(var type in markerConfig) {
            this.stats[type].text.attr({text: type + " : " + this.stats[type].count });
        }
    };

    Corona.prototype.resetStats = function() {
        for(var type in markerConfig) {
            this.stats[type].count = 0;
        }
    };





    // private methods
    function drawWorldMap(r) {
        r.rect(0, 0, 1000, 400, 10).attr({
            stroke: "none",
            fill: "#1a273f"
        });

        for (var country in worldmap.shapes) {
            r.path(worldmap.shapes[country]).attr({
                stroke: "#555",
                fill: "#0e151e",
                "stroke-opacity": 0.25
            });
        }                
    }

    // stat box is located on left bottom of canvas.
    // It shows icon, type, and the count.
    function drawStatBox(r, stats) {
        r.rect(10, 280, 130, 110, 5).attr({
            stroke: "#eee",
            opacity: 0.25
        }); 

        offset = 0;
        for(var type in markerConfig) {
            var attrs = markerConfig[type];
            var m = r.path(attrs.pathstr).attr({fill: attrs.color, stroke: "none"});
            m.transform("S0.5T10," + (280 + offset));
            offset += 25;
            stats[type].text = r.text(45, 272+offset, type + " : " + stats[type].count)
            stats[type].text.attr({
                fill: "#eee", 
                "text-anchor": "start"
            })
            stats[type].text.transform("S1.1");
        }        
    }

    function initTimeRangeSlide(corona) {
        $('.slider-label .start').text("1 day ago");
        
        var now = corona.endTime; 
        $('#time-slider').slider({
            min: corona.startTime,
            max: now,
            value: [corona.startTime, corona.endTime],
            formater: function(val) {
                return strFromTimestamp(val);
            }
        }).on("slide", function(event) {
            if(event.value[1] == now) {
                corona.setTimeRange(event.value[0]);
            }
            else {
                corona.setTimeRange(event.value[0], event.value[1]);
            }
        });
    }

    function getXY(lat, lon) {
        return [
            parseInt(lon) * 2.6938 + 465.4 -15,
            parseInt(lat) * -2.6938 + 227.066 -15
        ];
    };


    return Corona;    

})();


function strFromTimestamp(val) {
    var d = new Date(val*1000);
    return  d.toLocaleString();
}

Raphael("world-map-container", 1200, 600, function() {
    var corona = new Corona(this);

    // listen to CDFActivityUpdates socket
    var socket = io.connect('http://coronabaer.herokuapp.com');
    socket.on('CDFActivityUpdates', function (data) {
        console.log('on CDFActivityUpdates');
        console.log(data);

        // convert received data (string) to json
        var jsonData = JSON.parse(data);

        var myDate = new Date(jsonData.sobject.SystemModstamp);
        var myEpoch = myDate.getTime() / 1000.0;

        // build activity renaming server field names with required local names
        var activity = {
            dataType: jsonData.sobject.Data_Type__c,
            timestamp: myEpoch,
            country: jsonData.sobject.Country__c,
            longitude: jsonData.sobject.Longitude__c,
            latitude: jsonData.sobject.Latitude__c,
            content: jsonData.sobject.Content__c,
            profilePic: jsonData.sobject.Profile_Pic__c
        }

        corona.addActivity(activity);
    });

    // uncomment the code starting from local testing begin to local testing end
    // if you want to run this html app without a web server
    // local testing begin
    /*
    var now = Math.floor((new Date()).getTime()/1000);
    var activities = [
        { dataType: "forumPost", timestamp: now-3600*20, country: "Seoul", longitude: "126.870117", latitude: "37.300275", content: "Hello World" },
        { dataType: "userLogin", timestamp: now-3600*18, country: "Sydney", longitude: "151.259766", latitude: "-34.174317", content: "I Love You, I Love You, I Love You." },
        { dataType: "participate", timestamp: now-3600*12, country: "Oslo", longitude: "10.722656", latitude: "59.526658", content: "Hello World" },
        { dataType: "submit", timestamp: now-3600*10, country: "Detroit", longitude: "-83.012695", latitude: "42.190373", content: "Hello World" },
        { dataType: "submit", timestamp: now-3600*7, country: "Santiago", longitude: "-70.576172", latitude: "-33.657495", content: "Hello World" },
        { dataType: "forumPost", timestamp: now-3600*2, country: "India", longitude: "79.16748", latitude: "20.998945", content: "Hello World" },
        { dataType: "userLogin", timestamp: now-3600*1, country: "Harare", longitude: "31.552734", latitude: "-18.111266", content: "Hello World" },
        { dataType: "forumPost", timestamp: now, country: "LA", longitude: "-117.949219", latitude: "33.857872", content: "Hello World" },
        { dataType: "userLogin", timestamp: now + 10, country: "aaa", longitude: "35.552734", latitude: "35.111266", content: "Hello World" },
        { dataType: "userLogin", timestamp: now + 20, country: "aaa", longitude: "123.552734", latitude: "70.111266", content: "Hello World" },
    ];

    var current = 0;
    function addNextActivity() {
        if(current < activities.length-1) {
            setTimeout(addNextActivity, 2000);
        }
        corona.addActivity(activities[current]);
        current += 1;
    }

    setTimeout(addNextActivity, 1000);
    */
    // local testing end
});