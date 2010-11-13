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
			var scrape = eval("({" + html.match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow

			return {
				title: scrape.title,
				address_lines: scrape.addressLines,
				phones: scrape.phones,
				url: scrape.hp.actual_url
			}
		} catch(e) {
			log.severe(e)
			log.severe("by " + name + " latLng: " + lat + ":" + lng)
		}
	} else {
		log.severe("geolookup failed for:" + lat + ":" + lng)
	}
}

log.info(populateAddressDetails("Jasmine thai", 35.66111479675315, 139.73684287834791).toSource())
