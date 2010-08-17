(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	
	return {
		show: function() {
			var links = new Object() 
			for(var link in Iterator(ds.prepare(new Query("links")).asIterator())) {
				var picks = JSON.parse(link.getProperty("data").getValue())
				for(var i = 0 ; i < picks.length ; i++) {
					links[picks[i]] = 0
				}
			}

			var backup = new Object()	
			var t = new java.util.ArrayList()
			for(var link in links) {
				t.add(KeyFactory.createKey("picks", parseInt(link)))
			}
			for(var e in Iterator(ds.get(t).values().iterator())) {
				backup[e.getKey().getId()] = {
					comments: JSON.parse(e.getProperty("comments").getValue()),
					data: JSON.parse(e.getProperty("data").getValue())
				}
			}

			ds["delete"](KeyFactory.createKey("picks_backup", "backup"))
			var ent = new Entity(KeyFactory.createKey("picks_backup", "backup"))
			ent.setProperty("backup", new Text(JSON.stringify(backup)))
			ds.put(ent)

			return ["ok", "ok"]
		}
	}
})
