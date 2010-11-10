(function() {
	importPackage(javax.servlet.http)
	var links = require("model/links.js")()
	var picks = require("model/picks.js")()

	return {
		show: function(request, response, session) {
			if(request.params["access_token"] && request.params["uid"]) {
				// logged in previously
				log.info("access token in cookie: " + request.params["uid"])
				session["access_token"] = request.params["access_token"]
				session["uid"] = request.params["uid"]
			}

			if(session["access_token"] && session["uid"]) {
				// logged in, show main
				var fb = require("utils/facebook.js")(session)
				var ids = fb.getFriends().map(function(e) { return e.id })
				ids.push(fb.getUID())
						
				return ["ok", render("view/main.jhtml", {
						uid: session["uid"],
						picks: picks.find(links.find(ids)).map(function(p) {
							p.editable = ids.some(function(e) { return p.data.referer_uid == e })
							return p
						})})]
			} else {
				// show landing page
				return ["ok", render("view/landing.jhtml", {}) ]
			}
		},
		yours: function(request, response, session) {
			return ["ok", render("view/main.jhtml", { picks: picks.find(links.find([request.args[0]])) })]
		},
		auth: function(request, response, session) {
			if(!session["access_token"] && !request.params["code"]) {
				// step 1: authenticate user with facebook
				log.info("redirecting to facebook for auth")
				var mobile = request.headers["User-Agent"] && request.headers["User-Agent"].match(/(iPhone)|(Android)|(BlackBerry)/) ? "&display=touch" : ""
				return ["redirect", "https://graph.facebook.com/oauth/authorize?client_id=" + config.facebook_app_id + "&redirect_uri=http://www.fancyfoodie.com/_auth" + "&scope=email,offline_access" + mobile]			
			} else if(request.params["code"]) {
				// step 2: get the access_token
				log.info("retrieving access token")
				var resp = hget("https://graph.facebook.com/oauth/access_token?client_id=" + config.facebook_app_id + "&redirect_uri=http://www.fancyfoodie.com/_auth&client_secret=" + config.facebook_app_secret + "&code=" + request.params["code"])
				log.info(resp)
				var auth = new Object()
				resp.split("&").forEach(function(e) {
					var kv = e.split("=")
					auth[kv[0]] = kv[1]
				})
	
				session["access_token"] = auth["access_token"]
				var cookie = new Cookie("access_token", auth["access_token"])
				cookie.setMaxAge(60*60*24*365)
				response.addCookie(cookie)
				log.info("got access token: " + auth["access_token"])

				var uid = eval("(" + hget("https://graph.facebook.com/me?access_token=" + auth["access_token"]) + ")").id
				session["uid"] = uid
				cookie = new Cookie("uid", uid)
				cookie.setMaxAge(60*60*24*365)
				response.addCookie(cookie)
				log.info("got uid: " + uid)
    			}

			return ["redirect", "/"]
		}
	}
})
