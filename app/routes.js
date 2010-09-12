(function(url) {
	if(url.match(/^\/p\/[0-9]+$/)) {
		return "/pick/show" + url.slice(2)
	} else if(url.match(/^\/r\/[0-9]+$/)) {
		return "/root/yours" + url.slice(2)
	} else {
		return url
	}
})
