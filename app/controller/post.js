(function() {
	require("utils/json2.js")
	var model = require("model/pick.js")()

	function pick() {
		var uid = request.params["fbs_" + config.facebook_app_id]	
		if(!uid || true) {
			log.info("post.pick:" + request.content)
			return ["ok", JSON.stringify({ id: model.persist(null, uid, JSON.parse(request.content)) }), "application/json"]
		} else {
			return ["error", "not logged in"]
		}
		
	}
	
	return {
		pick: pick 
	}
})

