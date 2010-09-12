var config = require("config.js")
var pick = require("handler/pick.js")()
var comments = require("handler/comments.js")()
var tasks = require("handler/tasks.js")()

httpserver(config, require("utils/dispatcher.js")([
	{ route: /^\/p\/([0-9]+)$/, handler: pick.show },
	{ route: /^\/r\/([0-9]+)$/, handler: main.yours },	
	{ route: /^\/pick\/show\/([0-9]+)$/, handler: pick.show },
	{ route: /^\/pick\/remove\/([0-9]+)$/, handler: pick.remove },
	{ route: /^\/pick\/recommend\/([0-9]+)$/, handler: pick.recommend },
	{ route: /^\/pick\/post$/, handler: pick.post },
	{ route: /^\/pick\/edit$/, handler: pick.edit },
	{ route: /^\/comments\/post\/([0-9]+)$/, handler: comments.post },	
	{ route: /^\/comments\/get\/([0-9]+)$/, handler: comments.get },
	{ route: /^\/_tasks\/remove$/, handler: tasks.remove },
	{ route: /^\/_tasks\/addLink$/, handler: tasks.addLink },
	{ route: /^\/_tasks\/addComment$/, handler: tasks.addComments },	
	{ route: /./, handler: main.show }]))
