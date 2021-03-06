(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var queue = QueueFactory.getQueue("tasks")
	var picks = require("model/picks.js")()

	return {
		post: function(request, response, session) {
			var fb = require("utils/facebook.js")(session)
			var comment = JSON.parse(request.content)
			var uid = fb.getUID()
			var author = fb.getName(uid)
			log.info("adding comment - uid: " + uid + " key: " + request.args[0] + " author:" + author + " text:" + comment)			
			var comment = {
				key: request.args[0],
				uid: uid,	
				author: author,
				comment: comment
			}
			queue.add(TaskOptions.Builder.url("/_tasks/addComment").param("comment", JSON.stringify(comment)))

			return ["ok", JSON.stringify(comment), "application/json"]
		},
		get: function(request, response, session) {
			return ["ok", JSON.stringify(picks.get(request.args[0]).comments)]
		}
	}
})
