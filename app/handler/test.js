(function() {
	return {
		locationLookup: function(request, response, session) {
			var html = hget("http://maps.google.com/maps?view=text&q=" + escape(request.args[0]))
			var scrape = eval("({" + html.match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow
			scrape = {
				title: scrape.title,
				address_lines: scrape.addressLines,
				phones: scrape.phones,
				url: scrape.hp.actual_url
			}

			return ["ok", scrape.toSource()]
		}
	}
})
