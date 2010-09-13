(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	require("utils/json2.js")

	var queue = QueueFactory.getQueue("tasks")
	var picks = require("model/picks.js")()
	var links = require("model/links.js")()

	function processTags(tags) {
		return tags ? tags.toLowerCase().replace(/[^\w]/,",").split(",").map(function(s) { return s.replace(/^\s*/, "").replace(/\s*$/, "") }).filter(function(e) { return e != "" }) : []
	}

	return {
		show: function(request, response, session) {
			var pick = picks.get(request.args[0])

			var editable = false	
			if(session["uid"]) {
				var fb = require("utils/facebook.js")(session)
				var ids = fb.getFriends().map(function(e) { return e.id })
				ids.push(fb.getUID())

				editable = ids.some(function(e) { return pick.data.referer_uid == e })
			}

			return ["ok", render("view/pick.jhtml", { pick: pick, editable: editable })]
		},
		post: function(request, response, session) {
			var fb = require("utils/facebook.js")(session)
			var p = JSON.parse(request.content)

			var uid = fb.getUID()
			var referer = fb.getName(uid)
			var pick = picks.persist({ 
				data: {
					name: p.name, 
					lat: p.lat,
					lng: p.lng,
					tags: processTags(p.tags),
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
		edit: function(request, response, session) {
			var fb = require("utils/facebook.js")(session)

			var p = JSON.parse(request.content)
			p.data.tags = processTags(p.data.tags)
			var pick = picks.get(p.key)

			var ids = fb.getFriends().map(function(e) { return e.id })
			ids.push(fb.getUID())
			// only friends can edit

			if(ids.some(function(e) { return pick.data.referer_uid == e })) {
				pick = picks.persist({
					key: p.key,
					data: p.data,
					comments: pick.comments,
					referees: pick.referees
				})

				return ["ok", JSON.stringify(pick), "application/json"]
			} else {
				return ["error", "error"]
			}
		},
		remove: function(request, response, session) {
			var fb = require("utils/facebook.js")(session)
			var uid = fb.getUID()
			links.remove(uid, request.args[0])
			queue.add(TaskOptions.Builder.url("/_tasks/remove").param("remove", JSON.stringify({ uid: uid, pick: request.args[0]})))

			return ["ok", "ok"]
		},
		recommend: function(request, response, session) {
			var fb = require("utils/facebook.js")(session)
			queue.add(TaskOptions.Builder.url("/_tasks/addLink").param("link", JSON.stringify({ uid: fb.getUID(), pick: request.args[0]})))

			return ["ok", "ok"]
		}
	}
})
