(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	
	return {
		show: function() {
			for(var pick in Iterator(ds.prepare(new Query("pick")).asIterator())) {
				var t = JSON.parse(pick.getProperty("data").getValue()).picks
				var links = []
				for(var p in t) {
					t[p].referer_uid = pick.getKey().getName()
					t[p].referer_name = pick.getProperty("referer").getValue()
					
					var data = t[p]
					var comments = ds.get(KeyFactory.createKey("comments", t[p].referer_uid + "/" + p)).getProperty("data").getValue()
					
					var p = new Entity("picks")
					p.setProperty("data", new Text(JSON.stringify(data)))
					p.setProperty("comments", new Text(comments))
					links.push(ds.put(p).getId())
				}

				var link = new Entity(KeyFactory.createKey("links", parseInt(pick.getKey().getName())))
				link.setProperty("data", new Text(JSON.stringify(links)))
				ds.put(link)		
			}

			return ["ok", "ok"]
		}
	}
})
