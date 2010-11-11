function lookup(place) {
	return hget("http://maps.google.com/maps?view=text&q=" + escape(place))
}

var scrape = eval("({" + lookup("hatos bar tokyo").match(/infoWindow:.*basics:/)[0] + "\"\"}})")
info.log(scrape.toSource())
