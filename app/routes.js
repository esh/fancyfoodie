(function(url) {
	if(url.match(/^\/p\/[0-9]+$/)) {
		return "/pick/show" + url.slice(2)
	} else {
		return url
	}
})
