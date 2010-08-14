(function(url) {
	if(url.match(/^\/[0-9]+\/[0-9]+$/)) {
		return "/pick/show" + url
	} else if(url.match(/^\/[0-9]+$/)) {
		return "/pick/test" + url
	} else {
		return url
	}
})
