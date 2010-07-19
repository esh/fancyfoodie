(function() {
	function show() {
		var fb = require("utils/facebook.js")()
		return ["ok", hget("https://graph.facebook.com/me/friends?access_token=" + fb.access_token)]
	}
	
	return {
		show: show 
	}
})

