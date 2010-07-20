(function() {
	require("utils/json2.js")
	var fb = require("model/facebook.js")()
	var model = require("model/pick.js")()
	
	return {
		fetch: function() {
			var ids = fb.getFriends().map(function(e) { return e.id })
			ids.push(fb.getUID())
			return ["ok", JSON.stringify(model.fetch(ids)), "application/json"]
		},
		post: function() {
			log.info("post.pick:" + request.content)
			return ["ok", JSON.stringify({ id: model.persist(fb.getUID(), JSON.parse(request.content)) }), "application/json"]
		}
	}
})

