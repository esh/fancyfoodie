(function() {
	require("utils/json2.js")
	var model = require("model/pick.js")()
	
	return {
		show: function(uid, key) {
			var pick = model.get(uid, key)
			return ["ok", render("view/pick.jhtml", { pick: pick })]
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
			return ["ok", JSON.stringify(model.persist(fb.getUID(), p.key, { name: p.name, lat: p.lat, lng: p.lng })), "application/json"]
		}
	}
})
