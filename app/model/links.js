(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(key) {
			var e = ds.get(KeyFactory.createKey("links", key))

			if(e) {
				return JSON.parse(e.getProperty("data").getValue())
			} else {
				throw "link not found: " + key
			}
		},
		add: function(key, pick_key) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - key:" + key + " pick_key: " + pick_key)
				var entity
				var links
				try {
					entity = ds.get(KeyFactory.createKey("links", key))
					links = JSON.parse(entity.getProperty("data"))
					log.info("existing key: " + key + "links: " + links.toSource())
				} catch(e) {
					entity = new Entity(KeyFactory.createKey("links")
					links = []
					log.info("new key")
				}
				
				links.push(pick_key)
					
				entity.setProperty("data", new Text(JSON.stringify(links)))
				ds.put(entity)
				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		},
		remove: function(key, pick_key) {
			var transaction = ds.beginTransaction()
			try {
				log.info("removing - key:" + key + " pick_key: " + pick_key)
				var entity = ds.get(KeyFactory.createKey("links", key))
				entity.setProperty("data", new Text(JSON.stringify(JSON.parse(entity.getProperty("data")).filter(function(e) {
					return e != pick_key
				}))))
					
				ds.put(entity)
				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		}
	}
})
