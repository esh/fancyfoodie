(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var fb = require("model/facebook.js")()
	var queue = QueueFactory.getQueue("tasks")
	var picks = require("model/picks.js")()

	return {
		post: function(key) {
			var comment = JSON.parse(request.content)
			var uid = fb.getUID()
			var author = fb.getName(uid)
			log.info("adding comment - uid: " + uid + " key: " + key + " author:" + author + " text:" + comment)			
			var comment = {
				key: key,
				uid: uid,	
				author: author,
				comment: comment
			}
			queue.add(TaskOptions.Builder.url("/_tasks/addComment").param("comment", JSON.stringify(comment)))

			return ["ok", JSON.stringify(comment), "application/json"]
		},
		get: function(key) {
			return ["ok", JSON.stringify(picks.get(key).comments)]
		}
	}
})
