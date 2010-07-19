(function() {
	require("utils/json2.js")
	var fb = require("utils/facebook.js")()
	var model = require("model/pick.js")()
	
	return {
		find: function() {

		},
		post: function() {
			if(fb.uid) {
				log.info("post.pick:" + request.content)
				return ["ok", JSON.stringify({ id: model.persist(null, fb.uid, JSON.parse(request.content)) }), "application/json"]
			} else {
				return ["error", "not logged in"]
			}
		}
	}
})

