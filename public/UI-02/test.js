$( document ).ready( function () {
    
    // The following array contains eight hard-coded data-point objects to be added to the map
    // to demo the functionality of the map visualization
    var dataPoints = [
        {
            dataType: "forumPost",
            timestamp: 1372172777,
            country: "Iceland",
            latitude: "64.1419",
            longitude: "-21.9275",
            content: "Posting from Iceland: I <3 #cloudspokes"
        },
        {
            dataType: "userLogin",
            timestamp: 1372172777,
            country: "United States", // Coordinates for New York City
            latitude: "40.67",
            longitude: "-73.94",
            content: "Logging in from the US!"
        },
        {
            dataType: "challengeRegistration",
            timestamp: 1372172777,
            country: "Australia", // Coordinates for Sydney
            latitude: "-33.859972",
            longitude: "151.211111",
            content: "Registering from Australia!"
        },
        {
            dataType: "challengeSubmission",
            timestamp: 1372172777,
            country: "Brazil", // Coordinates for Sao Paulo
            latitude: "-23.55",
            longitude: "-46.633333",
            content: "Submitting from Brazil!"
        },
        {
            dataType: "forumPost",
            timestamp: 1372172777,
            country: "India", // Coordinates for New Delhi
            latitude: "28.613889",
            longitude: "77.208889",
            content: "Posting from India!"
        },
        {
            dataType: "userLogin",
            timestamp: 1372172777,
            country: "South Africa", // Coordinates for Johannesburg
            latitude: "-26.204444",
            longitude: "28.045556",
            content: "Logging in from South Africa!"
        },
        {
            dataType: "challengeRegistration",
            timestamp: 1372172777,
            country: "Russia", // Coordinates for Moscow
            latitude: "55.75",
            longitude: "37.616667",
            content: "Registering from Russia!"
        },
        {
            dataType: "challengeSubmission",
            timestamp: 1372172777,
            country: "Japan", // Coordinates for Tokyo
            latitude: "35.689506",
            longitude: "139.6917",
            content: "Submitting from Japan!"
        }
    ];
    
    // Start a timer to add the data-point objects one-by-one to the map every 5 seconds,
    // stopping the timer when the end of the dataPoints array has been reached
    var index = 0;
    var intervalId = window.setInterval( addMarkerToMap, 5000 );
    function addMarkerToMap() {
        MapViz.addDataPoint( dataPoints[ index ] );
        index++;
        if ( index === dataPoints.length ) {
            window.clearInterval( intervalId );
        }
    }
    
} );
