(function() {
	require("utils/json2.js")

	var picks = require("model/picks.js")()

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

	return {
		locationLookup: function(request, response, session) {
			var pick = picks.get(request.args[0])

			return ["ok", populateAddressDetails(pick.data.name, pick.data.lat, pick.data.lng).toSource()]
		}
	}
})
