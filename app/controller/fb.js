(function() {
	function show() {
		var fb = require("model/facebook.js")()
		return ["ok", fb.getFriends().toSource()]
	}
	
	return {
		show: show 
	}
})

