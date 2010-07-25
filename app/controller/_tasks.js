(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var model = require("model/comments.js")()

	return {
		addComment: function() {
			if(request.params.comment != null) {
				log.info("adding comment: " + request.params.comment)
				var comment = eval(request.params.comment)
				model.persist(comment.pick, comment.referer, comment.comment)	
			}

			return ["ok", "ok"]
		}
	}
})

