(function() {
	function show() {
		return ["ok", render("view/login.jhtml", {})]
	}
	
	return {
		show: show 
	}
})

