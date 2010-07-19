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

	if(DigestUtils.md5Hex(payload.sort().join("") + config.facebook_app_secret) != data.sig) {
		throw "bad facebook creds"
	} else {
		log.info("verified facebook cookie")
	}
	
	return {
		getUID: function() {
			return data.uid
		},
		getFriends: function() {
			return eval("(" + hget("https://graph.facebook.com/me/friends?access_token=" + data.access_token) + ")")
		}
	}
})
