(function() {
	importPackage(javax.servlet.http)

	return {
		show: function() {
			if(request.params["access_token"] && request.params["uid"]) {
				// logged in previously
				log.info("access token in cookie: " + request.params["uid"])
				session["access_token"] = request.params["access_token"]
				session["uid"] = request.params["uid"]
			} else if(!session["access_token"] && !request.params["code"]) {
				// step 1: authenticate user with facebook
				log.info("redirecting to facebook for auth")
				var mobile = request.headers["User-Agent"] && request.headers["User-Agent"].match(/(iPhone)|(android)/) ? "&display=touch" : ""
				return ["redirect", "https://graph.facebook.com/oauth/authorize?client_id=" + config.facebook_app_id + "&redirect_uri=http://www.fancyfoodie.com/" + "&scope=email,offline_access" + mobile]			
			} else if(request.params["code"]) {
				// step 2: get the access_token
				log.info("retrieving access token")
				var resp = hget("https://graph.facebook.com/oauth/access_token?client_id=" + config.facebook_app_id + "&redirect_uri=http://www.fancyfoodie.com/&client_secret=" + config.facebook_app_secret + "&code=" + request.params["code"])
				log.info(resp)
				var auth = new Object()
				resp.split("&").forEach(function(e) {
					var kv = e.split("=")
					auth[kv[0]] = kv[1]
				})
	
				session["access_token"] = auth["access_token"]
				response.addCookie(new Cookie("access_token", auth["access_token"]))
				log.info("got access token: " + auth["access_token"])

				var uid = eval("(" + hget("https://graph.facebook.com/me?access_token=" + auth["access_token"]) + ")").id
				session["uid"] = uid
				response.addCookie(new Cookie("uid", uid))
				log.info("got uid: " + uid)
    			}

			return ["ok", render("view/map.jhtml", {})]
		}
	}
})
