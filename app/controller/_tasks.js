(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var links = require("model/links.js")()
	var comments = require("model/comments.js")()
	var picks = require("model/picks.js")()

	return {
		addLink: function() {
			if(request.params.link != null) {
				log.info("adding link: " + request.params.link)
				var link = JSON.parse(request.params.link)
				links.add(link.uid, link.pick)
			}

			return ["ok", "ok"]
		},
		removeLink: function() {
			if(request.params.link != null) {
				log.info("removing link: " + request.params.link)
				var link = JSON.parse(request.params.link)
				links.remove(link.uid, link.pick)
			}

			return ["ok", "ok"]

		},
		addComment: function() {
			if(request.params.comment != null) {
				log.info("adding comment: " + request.params.comment)
				var comment = JSON.parse(request.params.comment)
				comments.persist(comment.pick, comment.uid, comment.author, comment.comment)	
			}

			return ["ok", "ok"]
		},
		addComment2: function() {
			if(request.params.comment != null) {
				log.info("adding comment: " + request.params.comment)
				var comment = JSON.parse(request.params.comment)
				picks.addComment(
					comment.pick, {
						comment: comment.comment,
						author: comment.author,
						uid: comment.uid,
						timestamp: new Date() 
					})	
			}

			return ["ok", "ok"]
		}
	}
})

