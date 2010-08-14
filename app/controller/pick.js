(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var queue = QueueFactory.getQueue("tasks")
	var model = require("model/pick.js")()
	var picks = require("model/picks.js")()
	var comments = require("model/comments.js")()
	
	return {
		show: function(uid, key) {
			return ["ok", render("view/pick.jhtml", { pick: model.get(uid, key), comments: comments.get(uid + "/" + key) })]
		},
		test: function(key) {
			return ["ok", render("view/pick2.jhtml", { pick: picks.get(key) })]
		},
		post: function() {
			var fb = require("model/facebook.js")()
			var p = JSON.parse(request.content)

			var uid = fb.getUID()
			var referer = fb.getName(uid)
			var pick = model.persist(uid, p.key, referer, { name: p.name, lat: p.lat, lng: p.lng })
			
			if(p.comment != null && p.comment != "") {
				var comment = {
					pick: pick.id.uid + "/" + pick.id.key,
					uid: pick.id.uid,	
					author: referer,
					comment: p.comment
				}
				queue.add(TaskOptions.Builder.url("/_tasks/addComment").param("comment", JSON.stringify(comment)))
			}

			return ["ok", JSON.stringify(pick), "application/json"]
		},
		post2: function() {
			var fb = require("model/facebook.js")()
			var p = JSON.parse(request.content)

			var uid = fb.getUID()
			var referer = fb.getName(uid)
			var pick = picks.persist(
				null, {
				name: p.name, 
				lat: p.lat,
				lng: p.lng,
				referer_uid: uid,
				referer_name: referer })
	
			queue.add(TaskOptions.Builder.url("/_tasks/addLink").param("link", JSON.stringify({ uid: uid, pick: pick.key })))
	
			if(p.comment != null && p.comment != "") {
				var comment = {
					key: pick.key,
					uid: uid,	
					author: referer,
					comment: p.comment
				}
				queue.add(TaskOptions.Builder.url("/_tasks/addComment2").param("comment", JSON.stringify(comment)))
			}

			return ["ok", JSON.stringify(pick), "application/json"]
		},
		remove: function(key) {
			var fb = require("model/facebook.js")()
			var uid = fb.getUID()
			model.remove(uid, key)
			comments.remove(uid + "/" + key)
			return ["ok", "ok"]
		},
		remove2: function(key) {
			var fb = require("model/facebook.js")()
			picks.remove(key)
			queue.add(TaskOptions.Builder.url("/_tasks/removeLink").param("link", JSON.stringify({ uid: fb.getUID(), pick: key })))

			return ["ok", "ok"]
		}

	}
})
