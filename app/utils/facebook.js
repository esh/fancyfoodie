(function(session) {
	importPackage(com.google.appengine.api.memcache)
	var cache = MemcacheServiceFactory.getMemcacheService()
	
	if(!session["access_token"] || !session["uid"]) {
		throw "not logged in"
	}

	return {
		getUID: function() {
			return session["uid"] 
		},
		getName: function(uid) {
			var name = cache.get(uid)
			if(name == null) {
				log.info("cache miss (name): " + uid)
				name = eval("(" + hget("https://graph.facebook.com/" + session["uid"] + "?access_token=" + session["access_token"]) + ")").name
				cache.put(uid, name)
			}

			return name
		},
		getFriends: function() {
			return eval("(" + hget("https://graph.facebook.com/me/friends?access_token=" + session["access_token"]) + ")").data
		}
	}
})
