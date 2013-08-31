/**
 * This module creates the Leaflet map on the "map-visualization.html" page and manages the
 * addition of data points to the map. This module also updates the stats table when appropriate
 * and handles highlighting the continents when the user hovers over a continent column in the
 * stats table. For more info, please see the accompanying "README.pdf" file.
 */
var MapViz = ( function () {
    
    // The following object maps data point "dataType" strings to objects that contain marker icon
    // options. When a data point is added via MapViz.addDataPoint(), its "dataType" property is
    // read and the corresponding options object is passed to the "Leaflet.awesome-markers" plugin
    // (https://github.com/lvoogdt/Leaflet.awesome-markers#using-the-plugin), which generates the
    // marker icon that gets passed to Leaflet to be added to the map. Thus, each options object
    // should have the following properties:
    // 
    // -- "icon": a string specifying the icon that is shown INSIDE the marker; should be one of
    //            these values: http://fortawesome.github.io/Font-Awesome/icons/
    //            (see also: https://github.com/lvoogdt/Leaflet.awesome-markers#supported-icons)
    // -- "color": a string specifying the color of the marker; only these values are supported:
    //             https://github.com/lvoogdt/Leaflet.awesome-markers#supported-colors
    // -- "iconColor": an optional string specifying the color of the icon; the only supported
    //                 values are 'white' and 'black'; defaults to 'white' if not specified
    //                 (see also: https://github.com/lvoogdt/Leaflet.awesome-markers#color-of-the-icon)
    var markerIconOptions = {
        forumPost: {
            icon: 'icon-comment',
            color: 'red'
        },
        userLogin: {
            icon: 'icon-signin',
            color: 'orange'
        },
        challengeRegistration: {
            icon: 'icon-plus',
            color: 'green'
        },
        challengeSubmission: {
            icon: 'icon-upload-alt',
            color: 'blue'
        },
        challengeCreation: {
            icon: 'icon-file-text',
            color: 'green'
        },      
        scorecardSubmission: {
            icon: 'icon-trophy',
            color: 'yellow'
        }  
    };
    
    // The following object maps continents to Leaflet rectangular bounds. Since these bounds are
    // rectangular, they do NOT match the continents exactly, but are good enough for our purposes.
    // The values were determined manually/visually using the following tools/resources:
    // http://www.latlong.net/; https://en.wikipedia.org/wiki/Borders_of_the_continents
    var continentBounds = {
        northAmerica: new L.LatLngBounds(
            [13, -169], // South-west corner latitude/longitude
            [72, -46]   // North-east corner latitude/longitude
        ),
        southAmerica: new L.LatLngBounds(
            [-58, -94], [13, -32]
        ),
        europe: new L.LatLngBounds(
            [34, -28], [72, 50]
        ),
        africa: new L.LatLngBounds(
            [-40, -28], [34, 50]
        ),
        asia: new L.LatLngBounds(
            [-11, 50], [72, 150]
        ),
        oceania: new L.LatLngBounds(
            [-50, 110], [-11, 179]
        )
    };
    
    // The following array lists the stats table column names in the order that the columns are
    // displayed in the HTML table. Note that the names of the continent columns are exactly the
    // same as the keys of the continentBounds object declared above. The code below uses this
    // fact to convert between HTML table column indices and Leaflet continent bounds.
    var statsTableColumns = [
        'dataType', 'northAmerica', 'southAmerica', 'europe',
        'africa', 'asia', 'oceania', 'dataTypeTotal'
    ];
    
    // Create a Leaflet map in the "leafletMap" div, and initialize the view to the specified
    // latitude/longitude coordinates and zoom level. For more info, please see:
    // http://leafletjs.com/ (scroll down to the sample code on that page).
    var leafletMap = L.map( 'leafletMap' ).setView( [30, 0], 2 );
    
    // Add an OpenStreetMap tile layer. For more info, please see:
    // http://leafletjs.com/ (scroll down to the sample code on that page).
    L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    } ).addTo( leafletMap );
    
    // This function uses the properties of the specified data point object to add an appropriate
    // marker and popup to the Leaflet map, as well as to update the values in the stats table.
    // This function is exposed to the "outside world" at the end of this module and can
    // therefore be called via MapViz.addDataPoint().
    function addDataPoint( dataPoint ) {
        // Put the latitude and longitude values in an object to be passed to Leaflet
        var markerLatLng = new L.LatLng( dataPoint.latitude, dataPoint.longitude );
        
        // Get the marker icon options object corresponding to the "dataType" and pass it to the
        // "Leaflet.awesome-markers" plugin, which will generate the marker icon (a pin/balloon
        // with the color and inner icon specified by the options object). For more info, see:
        // https://github.com/lvoogdt/Leaflet.awesome-markers#using-the-plugin
        var markerOptions = {
            icon: L.AwesomeMarkers.icon( markerIconOptions[ dataPoint.dataType ] )
        };
        
        // Call on Leaflet to create the marker and popup, and add them to the Leaflet map
        L.marker( markerLatLng, markerOptions )
            .addTo( leafletMap )
            .bindPopup( "<div>"+dataPoint.content+"</div><div><img style=\"height: 75px\" src=\""+dataPoint.profilePic+"\"/></div><div>"+(dataPoint.systemmodstamp)+"</div>" )
            .openPopup();
        
        // Get the continent that the latitude/longitude coordinates are located in
        var continent = getEnclosingContinent( markerLatLng );
        
        // Use the jQuery $.inArray() utility method to find the continent in the statsTableColumns
        // (declared above), which will give us the zero-based index of the stats table column
        // corresponding to that continent. We add 1 because the column index will be passed to
        // the jQuery "nth-child" selector, which expects a one-based index value as an argument.
        // For more info, please see: http://api.jquery.com/nth-child-selector/
        var columnIndex = $.inArray( continent, statsTableColumns ) + 1;
        
        // Under the <tr> element with ID equal to dataPoint.dataType, get the <td> element at the
        // specified column index. This cell is located in the body of the stats table.
        var $dataCell = $( '#' + dataPoint.dataType + ' td:nth-child(' + columnIndex + ')' );
        
        // Under the <tr> element with ID equal to dataPoint.dataType, get the last <td> element.
        // This cell is located in the right-most column of the stats table, and displays the
        // total number of data points with data type equal to dataPoint.dataType.
        var $dataTypeTotalCell = $( '#' + dataPoint.dataType + ' td:last-child' );
        
        // Under the <tr> element with ID equal to "continentTotals", get the <td> element at the
        // specified column index. This cell is located in the bottom row of the stats table, and
        // displays the total number of data points in the current continent.
        var $continentTotalCell = $( '#continentTotals td:nth-child(' + columnIndex + ')' );
        
        // Under the <tr> element with ID equal to "continentTotals", get the last <td> element.
        // This cell is the bottom-right cell of the stats table, and displays the grand total
        // number of data points added to the Leaflet map.
        var $grandTotalCell = $( '#continentTotals td:last-child' );
        
        // Increment the value in each cell by one
        incrementValueInCell( $dataCell );
        incrementValueInCell( $dataTypeTotalCell );
        incrementValueInCell( $continentTotalCell );
        incrementValueInCell( $grandTotalCell );
    }
    
    // This function takes latitude/longitude coordinates in the form of a Leaflet L.LatLng object
    // and determines the continent in which the coordinates are located. This function returns a
    // string equal to one of the keys of the continentBounds object (declared above) if the
    // coordinates are located in one of the continents. This function returns null otherwise.
    function getEnclosingContinent( latlng ) {
        // For each continent in the continentBounds object, if the coordinates fall within the
        // corresponding Leaflet rectangular bounds, then the coordinates are located in that
        // continent. For more info, see: http://leafletjs.com/reference.html#latlngbounds-contains
        // (see the second contains() method listed in that table)
        for ( var continent in continentBounds ) {
            if ( continentBounds.hasOwnProperty( continent ) ) {
                if ( continentBounds[ continent ].contains( latlng ) ) {
                    return continent;
                }
            }
        }
        
        // Return null if the coordinates do not fall within any continent bounds
        return null;
    }
    
    // This function takes a table cell in the form of a jQuery collection and increments the
    // value displayed in the table cell by one.
    function incrementValueInCell( $tableCell ) {
        $tableCell.text( parseInt( $tableCell.text(), 10 ) + 1 );
    }
    
    // When the document is ready, add mouse-enter and mouse-leave handlers to stats table cells
    $( document ).ready( function () {
        // Get all table cells except for those in the first column (which show the data types)
        // and the last column (which show the data type totals). Highlight the corresponding
        // continent in the Leaflet map upon mouse-enter, and unhighlight it upon mouse-leave.
        $( '#statsTable th, #statsTable td' ).not( ':first-child, :last-child' ).mouseenter(
            function ( event ) {
                // Get the zero-based index of the cell within its parent <tr> element
                // (i.e., get the zero-based column index of the cell)
                var index = $( event.target ).index();
                
                // Highlight the corresponding continent
                highlightContinent( statsTableColumns[index] );
            }
        ).mouseleave(
            function ( event ) {
                // Unhighlight the currently highlighted continent, if any
                unhighlightContinent();
            }
        );
    } );
    
    // The Leaflet rectangle used to highlight a continent on the Leaflet map. This will be null
    // if and only if no continent is currently highlighted.
    var continentRectangle = null;
    
    // This function highlights the specified continent by drawing a Leaflet rectangle around it
    // on the Leaflet map. The specified continent should be a string matching one of the keys
    // of the continentBounds object declared above.
    function highlightContinent( continent ) {
        // Unhighlight the currently highlighted continent, if any
        unhighlightContinent();
        
        // Create the Leaflet rectangle to highlight the continent. For more info, please see:
        // http://leafletjs.com/reference.html#rectangle
        continentRectangle = L.rectangle(
            continentBounds[ continent ],
            { color: "#ff7800", weight: 1 }
        );
        
        // Add the Leaflet rectangle to the Leaflet map. For more info, please see:
        // http://leafletjs.com/reference.html#rectangle
        // http://leafletjs.com/reference.html#map-addlayer
        leafletMap.addLayer( continentRectangle );
    }
    
    // This function unhighlights the currently highlighted continent by removing the Leaflet
    // rectangle around it. If no continent is currently highlighted, this function does nothing.
    function unhighlightContinent() {
        // If no continent is currently highlighted, there's nothing to do
        if ( continentRectangle === null ) {
            return;
        }
        
        // Remove the Leaflet rectangle from the Leaflet map. For more info, please see:
        // http://leafletjs.com/reference.html#map-removelayer
        leafletMap.removeLayer( continentRectangle );
        
        // No continent is currently highlighted
        continentRectangle = null;
    }
    
    // Expose the addDataPoint() function as a module method
    return {
        addDataPoint: addDataPoint
    };
    
} () );

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
        systemmodstamp: jsonData.sobject.SystemModstamp,
        timestamp: myEpoch,
        country: jsonData.sobject.Country__c,
        longitude: jsonData.sobject.Longitude__c,
        latitude: jsonData.sobject.Latitude__c,
        content: jsonData.sobject.Content__c,
        profilePic: jsonData.sobject.Profile_Pic__c 
    }

    if(jsonData.sobject.Longitude__c && jsonData.sobject.Latitude__c) //CWD-- don't add if there isn't any long/lat
        MapViz.addDataPoint(activity);
});
