
function lookup(place) {
	return hget("http://maps.google.com/maps?view=text&q=" + escape(place))
}

var scrape = eval("({" + lookup("hatos bar tokyo").match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow

scrape = {
	title: scrape.title,
	address_lines: scrape.addressLines,
	phones: scrape.phones,
	url: scrape.hp.actual_url
}

log.info(scrape.toSource())
