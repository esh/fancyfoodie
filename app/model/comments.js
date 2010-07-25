(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(pick) {
			return JSON.parse(ds.get(KeyFactory.createKey("comments", pick)).getProperty("data").getValue())
		},
		persist: function(pick, uid, author, comment) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - comment:" + pick + " author: " + author + " text: " + comment)
				var entity
				try {
					entity = ds.get(KeyFactory.createKey("comments", pick))
					log.info("existing comment: " + pick)
				} catch(e) {
					entity = new Entity(KeyFactory.createKey("comments", pick))
					log.info("new comment: " + comment)
				}

				
				var data = entity.hasProperty("data") ?
					JSON.parse(entity.getProperty("data").getValue()) :
					[]	

				data.push({
					uid: uid,
					author: author,
					comment: comment,
					timestamp: new Date()
				})

				entity.setProperty("data", new Text(JSON.stringify(data)))
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
