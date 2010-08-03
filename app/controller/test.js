(function() {
	importPackage(javax.servlet.http)

	return {
		show: function() {
			return ["ok", render("view/test.jhtml", {})]
		}
	}
})
