(function() {
	importPackage(org.apache.commons.codec.digest, java.net)

	var t = URLDecoder.decode(request.params["fbs_" + config.facebook_app_id], "UTF-8")
	log.info("FB:" + t)

	var data = new Object()
	var payload = []
	t.split("&").forEach(function(e) {
		e = e.split("=")
		data[e[0]] = e[1]
		if(e[0] != "sig") {	
			payload.push(e[0] + "=" + e[1])
		}
	})

	if(DigestUtils.md5Hex(payload.sort().join("") + config.facebook_app_secret) == data.sig) {
		log.info(data.toSource())
		return data
	} else {
		throw "bad facebook creds"
	}
})
