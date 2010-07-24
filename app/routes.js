(function(url) {
	if(url.match(/^\/[0-9]+\/[0-9]+$/)) {
		return "/pick/show" + url
	} else {
		return url
	}
})
