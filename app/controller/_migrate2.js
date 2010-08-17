(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()
	
	return {
		show: function() {
			var map = new Object()
			for(var link in Iterator(ds.prepare(new Query("links")).asIterator())) {
				var t = JSON.parse(link.getProperty("data").getValue())
				for(var i = 0 ; i < t.length ; i++) {
					var key = t[i]
					var uid = link.getKey().getId()
					if(!map[key]) {
						map[key] = []	
					}
					map[key].push(uid)
				}
			}
	
			for(key in map) {
				var pick = ds.get(KeyFactory.createKey("picks", parseInt(key)))
				pick.setProperty("referees", new Text(JSON.stringify(map[key])))
				ds.put(pick)
			}
			
			return ["ok", "ok"]
		}
	}
})
