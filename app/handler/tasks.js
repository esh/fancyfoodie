(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	var links = require("model/links.js")()
	var picks = require("model/picks.js")()
	
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
		return parseInt(R * c * 100) / 100
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
			var html = lookup(name, geo.results[0].formatted_address)
			var latLng = eval("({" + html.match(/latlng:{lat:\d+\.\d+,lng:\d+\.\d+}/)[0] + "})").latlng
			var scrape = eval("({" + html.match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow
			
			return {
				title: scrape.title,
				address_lines: scrape.addressLines,
				phones: scrape.phones,
				url: scrape.hp.actual_url ? scrape.hp.actual_url : null,
				lat: latLng.lat,
				lng: latLng.lng
			}
		} else {
			throw "geolookup failed for:" + lat + ":" + lng
		}
	}
	
	return {
		remove: function(request, response, session) {
			log.info("removing: " + request.params.remove)
			var remove = JSON.parse(request.params.remove)
			var pick = picks.get(remove.pick)
			pick.referees = pick.referees.filter(function(e) {
				return e != remove.uid
			})
			
			if(pick.referees.length == 0) {
				picks.remove(remove.pick)
			} else {
				picks.persist(pick)
			}

			return ["ok", "ok"]
		},
		addLink: function(request, response, session) {
			log.info("adding link: " + request.params.link)
			var link = JSON.parse(request.params.link)
			links.add(link.uid, link.pick)

			var pick = picks.get(link.pick)
			pick.referees.push(parseInt(link.uid))
			picks.persist(pick)

			return ["ok", "ok"]
		},
		addComment: function(request, response, session) {
			log.info("adding comment: " + request.params.comment)
			var comment = JSON.parse(request.params.comment)
			picks.addComment(
				comment.key, {
					comment: comment.comment,
					author: comment.author,
					uid: comment.uid,
					timestamp: new Date() 
				})	

			return ["ok", "ok"]
		},
		locationLookup: function(request, response, session) {
			var pick = picks.get(request.args[0])

			try {
				var res = populateAddressDetails(pick.data.name, pick.data.lat, pick.data.lng)
				log.info("got scrape: " + res.toSource())
				if(calcDist(pick.data.lat, pick.data.lng, res.lat, res.lng) <= 0.025) {
					log.info("scrape is within 15m of pick")
					pick.data.title = res.title
					pick.data.address_lines = res.address_lines
					pick.data.phones = res.phones
					pick.data.url = res.url
				} else {
					log.info("scrape outside of 15m of pick")
					delete pick.data.title 
					delete pick.data.address_lines
					delete pick.data.phones
					delete pick.data.url
				}
	
				picks.persist(pick)
			} catch(e) {
				log.severe(e)
				log.severe("by pick:" + request.args[0])
			}	
			return ["ok", "ok"]
		},
		refreshLocations: function(request, response, session) {
			var queue = QueueFactory.getQueue("lookup")
			var keys = picks.keys()
			keys.forEach(function(key) {
				queue.add(TaskOptions.Builder.url("/_tasks/locationLookup/" + key))
			})

			return ["ok", "ok"]
		}
	}
})

