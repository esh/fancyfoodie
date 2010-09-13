var geolocation = (function() {
	if(navigator.geolocation) {
		return navigator.geolocation
	} else if ((window.google || window.google.gears) && google.gears) {
		return google.gears.factory.create('beta.geolocation')
	} else {
		return null
	}
})()
