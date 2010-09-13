(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var links = require("model/links.js")()
	var picks = require("model/picks.js")()

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
		}
	}
})

