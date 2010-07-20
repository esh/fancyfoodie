(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		fetch: function(ids) {
			var t = new java.util.ArrayList()
			ids.forEach(function(id) {
				t.add(KeyFactory.createKey("pick", id))
			})
			var res = []
			for(var e in Iterator(ds.get(t).values().iterator())) {
				JSON.parse(e.getProperty("data").getValue()).forEach(function(e) {
					res.push(e)
				})
			}

			return res 
		},
		persist: function(uid, pick) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving: " + key + " " + uid + " " + pick.name + " " + pick.lat + ":" + pick.lng)
				var key = KeyFactory.createKey("pick", uid)
				var entity
				try {
					entity = ds.get(key)
					log.info("existing uid")
				} catch(e) {
					entity = new Entity(key)
					log.info("new uid")
				}

				var data 
				if(entity.hasProperty("data")) {
					data = JSON.parse(entity.getProperty("data").getValue())
				} else {
					data = []
				}
				data.push(pick)
				entity.setProperty("data", new Text(JSON.stringify(data)))
				ds.put(entity)
				transaction.commit()

				return entity.getKey().getId() 
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		}
	}
})
