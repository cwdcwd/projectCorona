$(function () {
	var darkTheme = [
		{
		"featureType": "administrative.locality",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "administrative.land_parcel",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "administrative.neighborhood",
		"elementType": "geometry",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape.man_made",
		"elementType": "geometry",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape.natural.landcover",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape.natural.landcover",
		"elementType": "geometry",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape.natural.terrain",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape.natural",
		"stylers": [{
			"color": "#0e151e"
		}, {
			"visibility": "simplified"
		}]
	}, {
		"featureType": "transit",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "road",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "administrative.locality",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "administrative.province",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "landscape.man_made",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "poi",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "poi",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "water",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "administrative.country",
		"elementType": "geometry.stroke",
		"stylers": [{
			"visibility": "on"
		}, {
			"weight": 0.8
		}, {
			"color": "#22262f"
		}]
	},{
		"featureType": "administrative.country",
		"elementType": "labels",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"elementType": "labels.text",
		"stylers": [{
			"visibility": "off"
		}]
	}, {
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [{
			"visibility": "on"
		}, {
			"color": "#1a273f"
		}]
	}];
	var markerConfig = {
		forumPost: 'http://maps.google.com/mapfiles/ms/icons/green.png',
		userLogin: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
		challengeCreation: 'http://maps.google.com/mapfiles/ms/icons/pink.png',
		challengeRegistration: 'http://maps.google.com/mapfiles/ms/icons/yellow.png',
		challengeSubmission: 'http://maps.google.com/mapfiles/ms/icons/orange.png',
		scorecardSubmission: 'http://maps.google.com/mapfiles/ms/icons/red.png'
	};
	var transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	var mapOptions = {
		zoom: 2,
		center: new google.maps.LatLng(39.909736,-2.53125),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		//disableDefaultUI: true,
		styles: darkTheme
	};
	// The following object maps continents to Leaflet rectangular bounds. Since these bounds are
	// rectangular, they do NOT match the continents exactly, but are good enough for our purposes.
	// The values were determined manually/visually using the following tools/resources:
	// http://www.latlong.net/; https://en.wikipedia.org/wiki/Borders_of_the_continents
	var continentBounds = {
		northAmerica: new google.maps.LatLngBounds(
			new google.maps.LatLng(13, -169), // South-west corner latitude/longitude
			new google.maps.LatLng(72, -46)   // North-east corner latitude/longitude
		),
		southAmerica: new google.maps.LatLngBounds(
			new google.maps.LatLng(-58, -94),
			new google.maps.LatLng(13, -32)
		),
		europe: new google.maps.LatLngBounds(
			new google.maps.LatLng(34, -28),
			new google.maps.LatLng(72, 50)
		),
		africa: new google.maps.LatLngBounds(
			new google.maps.LatLng(-40, -28),
			new google.maps.LatLng(34, 50)
		),
		asia: new google.maps.LatLngBounds(
			new google.maps.LatLng(-11, 50),
			new google.maps.LatLng(72, 150)
		),
		oceania: new google.maps.LatLngBounds(
			new google.maps.LatLng(-50, 110),
			new google.maps.LatLng(-11, 179)
		)
	};
	var statTableIndex = {
		northAmerica: 2,
		southAmerica: 3,
		europe: 4,
		africa: 5,
		asia: 6,
		oceania: 7
	};
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

	var map = new google.maps.Map(document.getElementById('world-map-container'), mapOptions);

	var minZoomLevel = 2;
	var maxZoomLevel = 5;
	google.maps.event.addListener(map, 'zoom_changed', function() {
		if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
	});

	var infoWindow = new google.maps.InfoWindow({
		content: ''
	});

	var infoOpenTimeout = 0;
	var calcStatTimeout = 0;
	var setContent = function(marker, activity){
		clearTimeout(infoOpenTimeout);
		if(!marker.visible){
			return;
		}
		
		var content = '<div class="message-box">';
		content += '<div class="time"> ' + activity.time.toLocaleString() + '</div>';
		if(activity.userName){
			content += '<div class="text">' + activity.content + '</div>';
			content += '<div class="img"><a href="'+ activity.userProfile +'" target="_blank"><img src="' + activity.profilePic + '" height="70" ></a></div>';
		} else {
			content += '<div class="text">' + activity.content + '</div>';
		}
		content += '</div>';
		infoWindow.setContent(content);
		infoWindow.open(map,marker);
		infoWindow.setSize(infoWindow.getSize());

		setTimeout(function(){infoWindow.setSize(infoWindow.getSize());},100);
		setTimeout(function(){infoWindow.close();},10000);
	};

	var endTime = Math.floor((new Date()).getTime()/1000);
	var startTime = endTime - 60*60*24;

	
	var corona = {
		endTime: endTime,
		startTime: startTime,
		activities: [],
		typesShow: {
			scorecardSubmission: true,
			userLogin: true,
			challengeRegistration: true,
			forumPost: true,
			challengeSubmission: true,
			challengeCreation: true
		},
		setTimeRange: function (start, end){
			end = end || Math.floor((new Date()).getTime()/1000);
			this.startTime = start;
			this.endTime = end;
			infoWindow.close();
			this.draw();
			this.calcStat();
		},
		draw: function(){
			var
				start = corona.startTime,
				end = corona.endTime,
				typesShow = corona.typesShow, 
				arr = corona.activities, i,len;
			infoWindow.close();
			for(i= -1, len=arr.length; ++i^len;){
				var
					item = arr[i],
					timestamp = item.timestamp,
					marker = item.marker,
					isVisible = timestamp >= start && timestamp <= end && typesShow[item.dataType];
				if(isVisible != marker.visible){
					marker.setVisible(isVisible);
				}
			}
		},
		calcStat: function(){
			var stat = {},
				totalVisible = 0,
				typesShow = corona.typesShow,
				start = this.startTime,
				end = this.endTime;
				
			$.each(typesShow, function(key, val){
				stat[key] = {};
				$.each(statTableIndex, function(continent, index){
					stat[key][continent] = 0;
				});
			});
			
			var arr = corona.activities, i,len;
			for(i= -1, len=arr.length; ++i^len;){
				var
					item = arr[i],
					timestamp = item.timestamp,
					dataType = item.dataType,
					statSection = stat[dataType],
					continent = item.continent,
					val = statSection[continent] || 0;
				
				if(timestamp >= start && timestamp <= end ) {
					statSection[continent] = val + 1;
					totalVisible++;
				}

			}
			

			$.each(stat, function(dataType, val){
				var total = 0;
				$.each(stat[dataType],function(continent, val){
					total += val;
				});
				var $row = $('#' + dataType).closest('tr');

				$.each(statTableIndex, function(continent, index){
					var td ='td:nth-child('+index+')';
					$row.find(td).html(val[continent]);
				});

				$row.find('td:last').html(total);
			});

			$totalRow = $('#total').closest('tr');
			$.each(statTableIndex, function(continent, index){
				var total = 0;
				$.each(stat, function(dataType, val){
					total += stat[dataType][continent];
				});
				var td ='td:nth-child('+index+')';
				$totalRow.find(td).html(total);
			});

			$totalRow.closest('tr').find('td:last').html(totalVisible);
		},
		addItem: function(cfg){
			
			clearTimeout(infoOpenTimeout);
			infoWindow.close();
			var activity = {
				dataType: cfg.Data_Type__c,
				timestamp: Math.floor((new Date(cfg.SystemModstamp)).getTime()/1000) ,
				time: new Date(cfg.SystemModstamp),
				country: cfg.Country__c,
				longitude: cfg.Longitude__c,
				latitude: cfg.Latitude__c,
				content: cfg.Content__c || '',
				profilePic: cfg.Profile_Pic__c
			};

			if(activity.profilePic){
				var content = activity.content.split(/\s/);
				activity.userName = content[0];
				activity.userProfile = 'http://www.cloudspokes.com/members/'+ activity.userName;
				content[0] = '<a href="'+ activity.userProfile + '" target="_blank" >'+ activity.userName +'</a>';
				activity.content = content.join(' ');
				//cache image
				var img = new Image();
				img.src = activity.profilePic;
			} else {
				activity.profilePic = transparentPixel;
			}

			var markerLatLng = new google.maps.LatLng(activity.latitude,activity.longitude);
			var marker = activity.marker = new google.maps.Marker({
				position: markerLatLng,
				map: map,
				animation: google.maps.Animation.DROP,
				icon: new google.maps.MarkerImage(markerConfig[activity.dataType])
			});
			activity.continent = getEnclosingContinent( markerLatLng );
			

			google.maps.event.addListener(marker, 'click', function(e){
				setContent(marker, activity);
			});

			corona.activities.push(activity);
			this.draw();
			infoOpenTimeout = setTimeout(function(){
				setContent(marker, activity);
			}, 1000);
			clearTimeout(calcStatTimeout);
			calcStatTimeout = setTimeout(function(){
				corona.calcStat();
			},1000);
			
		}
	};
	
	var itemsCache = {};
	var socket = io.connect('http://coronabaer.herokuapp.com:80');
	socket.on('CDFActivityUpdates', function (data) {
		var jsonData = JSON.parse(data);
		var cfg = jsonData.sobject;
		if( itemsCache[cfg.Id]){
			return;
		} else{
			itemsCache[cfg.Id] = true;
		}
		corona.addItem(cfg);
	});




	$('.slider-label .start').text("1 day ago");

	$('#time-slider').slider({
		min: corona.startTime,
		max: corona.endTime,
		value: [corona.startTime, corona.endTime],
		formater: function(val) {
			return (new Date(val*1000)).toLocaleString();
		}
	}).on("slide", function(event) {
			if(event.value[1] == endTime) {
				corona.setTimeRange(event.value[0]);
			}
			else {
				corona.setTimeRange(event.value[0], event.value[1]);
			}
		});

	$.each( corona.typesShow, function( key, value ) {
		$('#'+key).click(function(){
			corona.typesShow[this.id] = this.checked;
			corona.draw();
			if(!this.checked){
				$('#total')[0].checked = false;
			}
		}).closest('td').find('img').each(function(){
				this.src = markerConfig[key];
			});

	});

	$('#total').click(function(){
		if(this.checked){
			$.each( corona.typesShow, function( key, value ) {
				corona.typesShow[key] = true;
				$('#'+key).prop('checked', true);
			});
			corona.draw();
		}
	});

});
