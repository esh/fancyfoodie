(function() {
	require("utils/json2.js")
	function pick() {
		log.info("post.pick:" + request.content)
		var data = JSON.parse(request.content)
		
		return ["ok", JSON.stringify({ id: "test" }), "application/json"]
	}
	
	return {
		pick: pick 
	}
})

