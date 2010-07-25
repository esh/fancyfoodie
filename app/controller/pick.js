(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var queue = QueueFactory.getQueue("tasks")
	var model = require("model/pick.js")()
	var comments = require("model/comments.js")()
	
	return {
		show: function(uid, key) {
			return ["ok", render("view/pick.jhtml", { pick: model.get(uid, key), comments: comments.get(uid + "/" + key) })]
		},
		fetch: function() {
			var fb = require("model/facebook.js")()
			var ids = fb.getFriends().map(function(e) { return e.id })
			ids.push(fb.getUID())
			return ["ok", JSON.stringify(model.find(ids)), "application/json"]
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
		remove: function(key) {
			var fb = require("model/facebook.js")()
			var uid = fb.getUID()
			model.remove(uid, key)
			comments.remove(uid + "/" + key)
			return ["ok", "ok"]
		}
	}
})
