(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		find: function(keys) {
			var t = new java.util.ArrayList()
			for(var i = 0 ; i < keys.length ; i++) {
				t.add(KeyFactory.createKey("links", parseInt(keys[i])))
			}

			var set = {}
			for(var e in Iterator(ds.get(t).values().iterator())) {
				var links = JSON.parse(e.getProperty("data").getValue())
				for(var i = 0 ; i < links.length ; i++) {
					set[links[i]] = 0
				}
			}

			var links = []
			for(var link in set) {
				links.push(link)
			}
			return links 

		},
		add: function(key, pick_key) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - key:" + key + " pick_key: " + pick_key)
				var entity
				var links
				try {
					entity = ds.get(KeyFactory.createKey("links", parseInt(key)))
					links = JSON.parse(entity.getProperty("data"))
					log.info("existing key: " + key + "links: " + links.toSource())
				} catch(e) {
					entity = new Entity(KeyFactory.createKey("links", parseInt(key)))
					links = []
					log.info("new key")
				}
				
				links.push(parseInt(pick_key))
					
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
				var entity = ds.get(KeyFactory.createKey("links", parseInt(key)))
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
