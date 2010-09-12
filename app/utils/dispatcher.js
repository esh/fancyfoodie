(function(routes) {
	return function(request, response, session) {
		try {
			for(var i = 0 ; i < routes.length ; i++) {
				var match = request.url.match(routes[i].route)
				if(match) {
					var args = []
					for(var j = 1 ; j < match.length ; i++) {
						args.push(match[j])
					}

					var result = routes[i].apply(new Object(), args)
					switch(result[0]) {
					case "ok":
						var contentType = result.length >= 3 ? result[2] : "text/html; charset=UTF-8"
						response.setContentType(contentType)
						if(contentType.indexOf("image") >= 0) {
							response.getOutputStream().write(result[1], 0, result[1].length) 
						} else {
							response.setCharacterEncoding("UTF-8")
							response.setStatus(200)
							response.getWriter().append(result[1])
						}
						break
					case "unauthorized":
						response.sendError(401)
						log.warning("blocked " + request.address + " from " + request.url)
						break
					case "redirect":
						response.sendRedirect(result[1])
						break
					default:
						throw "unknown response"
					}

					return
				}
			}

			throw "no matching routes"
		} catch(e) {
			response.sendError(500)
			log.warning(request.address + " caused:")
			log.warning(e)
		}
	}
})()
