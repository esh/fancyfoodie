(function() {
	importPackage(com.google.appengine.api.datastore)
	require("utils/json2.js")
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(uid, key) {
			var e = ds.get(KeyFactory.createKey("pick", uid))
			var pick = e.hasProperty("data") ?
				JSON.parse(e.getProperty("data").getValue()).picks :
				{}

			if(key in pick) {
				pick[key].referer = e.getProperty("referer").getValue()
				pick[key].id = {
					uid: uid,
					key: key
				}
				return pick[key]
			} else {
				throw "pick not found: " + uid + ":" + key
			}
		},
		find: function(ids) {
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
					pick.referer = e.getProperty("referer").getValue()
					res.push(pick)
				}
			}

			return res 
		},
		persist: function(uid, key, referer, pick) {
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
				entity.setProperty("referer", new Text(referer))
				entity.setProperty("data", new Text(JSON.stringify(data)))
				ds.put(entity)
				transaction.commit()
			
				pick.referer = referer
				pick.id = {
					uid: uid,
					key: key
				}

				return pick 
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		}
	}
})
