(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		fetch: function(ids) {
			var t = new java.util.ArrayList()
			for(var i = 0 ; i < ids.length ; i++) {
				t.add(KeyFactory.createKey("pick", ids[i]))
			}
			var res = []
			for(var e in Iterator(ds.get(t).values().iterator())) {
				var picks = JSON.parse(e.getProperty("data").getValue()).picks
				for(var key in picks) {
					var pick = picks[key]
					pick.id = {
						uid: e.getKey().getName(),
						key: key
					}
					res.push(pick)
				}
			}

			return res 
		},
		persist: function(uid, key, pick) {
			var transaction = ds.beginTransaction()
			try {
				log.info("saving - uid:" + uid + " data: " + pick.toSource())
				var entity
				try {
					entity = ds.get(KeyFactory.createKey("pick", uid))
					log.info("existing uid: " + uid)
				} catch(e) {
					entity = new Entity(KeyFactory.createKey("pick", uid))
					log.info("new uid: " + uid)
				}

				
				var data = entity.hasProperty("data") ?
					JSON.parse(entity.getProperty("data").getValue()) :
					{ nextKey: 0, picks: {} }

				if(!key) {
					key = data.nextKey++
					log.info("new key:" + key)
				} else {
					log.info("existing key:" + key)
				}

				data.picks[key] = pick
				entity.setProperty("data", new Text(JSON.stringify(data)))
				ds.put(entity)
				transaction.commit()
				
				return { id: { uid: uid, key: key } }
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		}
	}
})
