var geolocation = (function() {
	if(navigator.geolocation) {
		return navigator.geolocation
	} else if ((window.google || window.google.gears) && google.gears) {
		return google.gears.factory.create('beta.geolocation')
	} else {
		return null
	}
})()

function calcDist(lat1, lon1, lat2, lon2) {
	lat1 = lat1 * Math.PI / 180
	lat2 = lat2 * Math.PI / 180
	lon1 = lon1 * Math.PI / 180
	lon2 = lon2 * Math.PI / 180

	var R = 6371 // km
	var dLat = lat2-lat1
	var dLon = lon2-lon1 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2) 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	return parseInt(R * c * 100) / 100
}

