(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var model = require("model/comments.js")()

	return {
		addComment: function() {
			if(request.params.comment != null) {
				log.info("adding comment: " + request.params.comment)
				var comment = JSON.parse(request.params.comment)
				model.persist(comment.pick, comment.uid, comment.author, comment.comment)	
			}

			return ["ok", "ok"]
		}
	}
})

