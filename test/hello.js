function lookup(place) {
	var uri = new java.net.URI("http", "a.com", "/" + place, null)
	uri = "http://maps.google.com/maps?view=text&q=" + uri.toASCIIString().slice("http://a.com/".length)
	return hget(uri)
}


var html = lookup("Jasmine thai near Japan, Tokyo Minato六本木５丁目１８−２２")

//java.lang.System.out.print(html)
var scrape = eval("({" + html.match(/infoWindow:.*basics:/)[0] + "\"\"}})").infoWindow

scrape = {
	title: scrape.title,
	address_lines: scrape.addressLines,
	phones: scrape.phones,
	url: scrape.hp.actual_url
}

log.info(scrape.toSource())
