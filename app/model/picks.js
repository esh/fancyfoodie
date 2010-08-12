(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(key) {
			var e = ds.get(KeyFactory.createKey("picks", key))
			if(e) {
				var pick = JSON.parse(e.getProperty("data").getValue())
				pick.key = e.getKey().getId()
				pick.comments = JSON.parse(e.getProperty("comments").getValue())
				return pick
			} else {
				throw "pick not found: " + key
			}
		},
		find: function(keys) {
			log.info("finding: " + keys.toSource())
			var t = new java.util.ArrayList()
			for(var i = 0 ; i < keys.length ; i++) {
				t.add(KeyFactory.createKey("picks", parseInt(keys[i])))
			}
			var res = []
			for(var e in Iterator(ds.get(t).values().iterator())) {
				var pick = JSON.parse(e.getProperty("data").getValue())
				pick.key = e.getKey().getId()
				res.push(pick)
			}

			return res 
		},
		addComment: function(key, comment) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - key:" + key + " comment: " + comment.toSource())
				var entity = ds.get(KeyFactory.createKey("picks", key))
				entity.setProperty("comments", new Text(JSON.stringify(JSON.parse(entity.getProperty("comments")).push(comment))))

				ds.put(entity)
				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		},
		persist: function(key, data) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - key:" + key + " data: " + data.toSource())
				var entity
				try {
					entity = ds.get(KeyFactory.createKey("picks", key))
					log.info("existing key: " + key)
				} catch(e) {
					entity = new Entity("picks")
					log.info("new key")
				}
								
				entity.setProperty("data", new Text(JSON.stringify(data)))
				if(!entity.hasProperty("comments")) {
					entity.setProperty("comments", new Text("[]"))
				}

				data.key = ds.put(entity).getId()
				transaction.commit()
			
				return data
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		},
		remove: function(key) {
			var transaction = ds.beginTransaction()
			try {
				log.info("removing - key: " + key)
				ds["delete"](KeyFactory.createKey("picks", key))
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
