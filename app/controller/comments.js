(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var fb = require("model/facebook.js")()
	var queue = QueueFactory.getQueue("tasks")
	
	return {
		post: function(uid, key) {
			var comment = JSON.parse(request.content)
			var author = fb.getName(fb.getUID())
			log.info("adding comment - uid: " + uid + " key: " + key + " author:" + author + " text:" + comment)			
			var comment = {
				pick: uid + "/" + key,
				uid: fb.getUID(),	
				author: author,
				comment: comment
			}
			queue.add(TaskOptions.Builder.url("/_tasks/addComment").param("comment", JSON.stringify(comment)))

			return ["ok", JSON.stringify(comment), "application/json"]
		}
	}
})
