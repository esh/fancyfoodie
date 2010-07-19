(function() {
	function show() {
		var fb = request.params["fbs_" + config.facebook_app_id]
		log.info("FB:" + fb)

		var fbObj = new Object()
		fb.split("&").forEach(function(e) {
			e = e.split("=")
			fbObj[e[0]] = e[1]
		})

		log.info("uid: " + fbObj["uid"] + " - access_token: " + fbObj["access_token"])
		return ["ok", hget("https://graph.facebook.com/me/friends?access_token=" + fbObj["access_token"])]
	}
	
	return {
		show: show 
	}
})

