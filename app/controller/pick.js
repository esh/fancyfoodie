(function() {
	require("utils/json2.js")
	var fb = require("model/facebook.js")()
	var model = require("model/pick.js")()
	
	return {
		fetch: function() {
			
		},
		post: function() {
			log.info("post.pick:" + request.content)
			return ["ok", JSON.stringify({ id: model.persist(null, fb.getUID(), JSON.parse(request.content)) }), "application/json"]
		}
	}
})

