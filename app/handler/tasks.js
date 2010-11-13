(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var links = require("model/links.js")()
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
			var html = lookup(name, geo.results[0].formatted_address)
			var scrape = eval("({" + html.match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow

			return {
				title: scrape.title,
				address_lines: scrape.addressLines,
				phones: scrape.phones,
				url: scrape.hp.actual_url
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
				pick.data.title = res.title
				pick.data.address_lines = res.address_lines
				pick.data.phones = res.phones
				pick.data.url = res.url
						
				picks.persist(pick)
			} catch(e) {
				log.severe(e)
				log.severe("by pick:" + request.args[0])
			}	
			return ["ok", "ok"]
		},
		refreshLocations: function(request, response, session) {
			var queue = QueueFactory.getQueue("lookup")
			return ["ok", "ok"]
		}

	}
})

