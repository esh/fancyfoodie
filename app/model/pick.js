(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	function get(key) {
		return JSON.parse(ds.get(KeyFactory.stringToKey(key)).getProperty("data").getValue())
	}

	return {
		get: get,
		persist: function(key, uid, data) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving: " + key + " " + uid + " " + data.name + " " + data.lat + ":" + data.lng)

				var entity
				if(key) {
					entity = new Entity(KeyFactory.stringToKey(key))
				} else {
					entity = new Entity("pick")
				}
	
				entity.setProperty("uid", new Text(uid))
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
