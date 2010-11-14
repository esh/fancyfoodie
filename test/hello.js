function calcDist(lat1, lon1, lat2, lon2) {
	lat1 = lat1 * Math.PI / 180
	lat2 = lat2 * Math.PI / 180
	lon1 = lon1 * Math.PI / 180
	lon2 = lon2 * Math.PI / 180

	var R = 6371 // km
	var dLat = lat2-lat1
	var dLon = lon2-lon1 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2) 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	return R * c * 100 / 100
}

function rgeocode(lat, lng) {
	return hget("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=false")
}

function lookup(name, address) {
	var uri = new java.net.URI("http", "a.com", "/" + name + " near " + address, null)
	uri = "http://maps.google.com/maps?view=text&q=" + uri.toASCIIString().slice("http://a.com/".length)
	return hget(uri)
}

function populateAddressDetails(name, lat, lng) {
	var geo = eval("(" + rgeocode(lat, lng) + ")")
	if(geo.status == "OK") {
		try {
			var html = lookup(name, geo.results[0].formatted_address)
			var latLng = eval("({" + html.match(/latlng:{lat:\d+\.\d+,lng:\d+\.\d+}/)[0] + "})").latlng
			var scrape = eval("({" + html.match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow
			
			return {
				title: scrape.title,
				address_lines: scrape.addressLines,
				phones: scrape.phones,
				url: scrape.hp.actual_url,
				lat: latLng.lat,
				lng: latLng.lng
			}
		} catch(e) {
			log.severe(e)
			log.severe("by " + name + " latLng: " + lat + ":" + lng)
		}
	} else {
		log.severe("geolookup failed for:" + lat + ":" + lng)
	}
}

function test(name, lat, lng) {
	var scrape = populateAddressDetails(name, lat, lng)
	log.info("in: " + name + " " + lat + " " + lng)
	log.info(scrape.toSource())
	log.info("dist:" + calcDist(lat, lng, scrape.lat, scrape.lng))
}

test("Tap Room", 35.643551078793934, 139.6990793465672)
