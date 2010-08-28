(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var queue = QueueFactory.getQueue("tasks")
	var picks = require("model/picks.js")()
	var links = require("model/links.js")()

	return {
		show: function(key) {
			return ["ok", render("view/pick.jhtml", { pick: picks.get(key) })]
		},
		post: function() {
			var fb = require("model/facebook.js")()
			var p = JSON.parse(request.content)

			var uid = fb.getUID()
			var referer = fb.getName(uid)
			var tags = p.replace(/[^\w]/,",").split(",").map(function(s) { return s.replace(/^\s*/, "").replace(/\s*$/, "") }).filter(function(e) { return e != "" })
			var pick = picks.persist({ 
				data: {
					name: p.name, 
					lat: p.lat,
					lng: p.lng,
					tags: tags,
					referer_uid: uid,
					referer_name: referer }})
	
			queue.add(TaskOptions.Builder.url("/_tasks/addLink").param("link", JSON.stringify({ uid: uid, pick: pick.key })))
	
			if(p.comment != null && p.comment != "") {
				var comment = {
					key: pick.key,
					uid: uid,	
					author: referer,
					comment: p.comment
				}
				queue.add(TaskOptions.Builder.url("/_tasks/addComment").param("comment", JSON.stringify(comment)))
			}

			return ["ok", JSON.stringify(pick), "application/json"]
		},
		edit: function() {
			var fb = require("model/facebook.js")()

			var p = JSON.parse(request.content)
			var pick = picks.get(p.key)
			if(pick.data.referer_uid == fb.getUID()) {
				picks.persist({
					key: p.key,
					data: p.data,
					comments: pick.comments,
					referees: pick.referees
				})


				return ["ok", "ok"]
			} else {
				return ["error", "error"]
			}
		},
		remove: function(key) {
			var fb = require("model/facebook.js")()
			var uid = fb.getUID()
			links.remove(uid, key)
			queue.add(TaskOptions.Builder.url("/_tasks/remove").param("remove", JSON.stringify({ uid: uid, pick: key })))

			return ["ok", "ok"]
		},
		recommend: function(key) {
			var fb = require("model/facebook.js")()
			queue.add(TaskOptions.Builder.url("/_tasks/addLink").param("link", JSON.stringify({ uid: fb.getUID(), pick: key })))

			return ["ok", "ok"]
		}
	}
})
