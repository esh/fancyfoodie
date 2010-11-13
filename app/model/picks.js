(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")

	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(key) {
			var e = ds.get(KeyFactory.createKey("picks", parseInt(key)))
			if(e) {
				var pick = new Object()
				pick.key = e.getKey().getId()
				pick.data = JSON.parse(e.getProperty("data").getValue())
				pick.referees = JSON.parse(e.getProperty("referees").getValue())
				pick.comments = JSON.parse(e.getProperty("comments").getValue())
				return pick
			} else {
				throw "pick not found: " + key
			}
		},
		keys: function() {
			var keys = []
			for(var e in Iterator(ds.prepare(new Query("picks").setKeysOnly()).asIterator())) {
				keys.push(e.getKey().getId())
			}

			return keys
		},
		find: function(keys) {
			log.info("finding: " + keys.toSource())
			var t = new java.util.ArrayList()
			for(var i = 0 ; i < keys.length ; i++) {
				t.add(KeyFactory.createKey("picks", parseInt(keys[i])))
			}
			var res = []
			for(var e in Iterator(ds.get(t).values().iterator())) {
				var pick = new Object()
				pick.key = e.getKey().getId()
				pick.data = JSON.parse(e.getProperty("data").getValue())
				pick.referees = JSON.parse(e.getProperty("referees").getValue())
				pick.comments = JSON.parse(e.getProperty("comments").getValue())
				res.push(pick)
			}

			return res 
		},
		addComment: function(key, comment) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - key:" + key + " comment: " + comment.toSource())
				var entity = ds.get(KeyFactory.createKey("picks", parseInt(key)))
				var comments = JSON.parse(entity.getProperty("comments").getValue())
				comments.push(comment)
				entity.setProperty("comments", new Text(JSON.stringify(comments)))

				ds.put(entity)
				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		},
		persist: function(pick) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving: " + pick.toSource())
				var entity
				if(pick.key) {
					entity = ds.get(KeyFactory.createKey("picks", parseInt(pick.key)))
					log.info("existing key: " + pick.key)
				} else {
					entity = new Entity("picks")
					log.info("new key")
				}
								
				entity.setProperty("data", new Text(JSON.stringify(pick.data)))
			
				if(!pick.comments) {
					pick.comments = []
				}
				entity.setProperty("comments", new Text(JSON.stringify(pick.comments)))

				if(!pick.referees) {
					pick.referees = []
				}
				entity.setProperty("referees", new Text(JSON.stringify(pick.referees)))	

				pick.key = ds.put(entity).getId()
				transaction.commit()
			
				return pick 
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
				ds["delete"](KeyFactory.createKey("picks", parseInt(key)))
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
