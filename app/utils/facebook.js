(function() {
	// todo: VERIFY THE GODDAMN SOURCE - http://developers.facebook.com/docs/authentication/ - md5(payload - sig) = sig
	var t = request.params["fbs_" + config.facebook_app_id]
	log.info("FB:" + t)

	var data = new Object()
	t.split("&").forEach(function(e) {
		e = e.split("=")
		data[e[0]] = e[1]
	})

	log.info(data.toSource())
	return data
})
