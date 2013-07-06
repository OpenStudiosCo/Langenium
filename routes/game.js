/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Game
	This class contains handlers for game client paths
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var https = require('https'),
	db,
	fb;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Pages
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.setProviders = function (database, facebook) {
	db = database;
	fb = facebook;
}

exports.play = function(req, res) {
	render(req, res, 'game/client', { title: "Langenium Game Client Alpha", editor: false });
};
exports.editor = function(req, res) {
	var callback = function(result) {
		render(req, res, 'game/editor', { title: "Langenium Game Map Editor Alpha", editor: true, objects: result });
	};
	db.queryClientDB("objects", { }, callback);
};

// Modals
exports.selected = function(req, res) {
	render(req, res, 'game/editor/selected', { 
		id: req.query.id, 
		name: req.query.name, 
		position: {
			x: req.query.positionX,
			y: req.query.positionY,
			z: req.query.positionZ
		}, 
		scale: req.query.scale });
};

var render = function(req, res, template, variables) { 
	res.setHeader("Expires", "-1");
	res.setHeader("Cache-Control", "must-revalidate, private");
	res.render(template, variables);
};


var render = function(req, res, template, variables) {
	res.setHeader("Expires", "-1");
	res.setHeader("Cache-Control", "must-revalidate, private");
	if ((req.user)&&(req.user.username == 'TheZeski')) { // this is hopefully overkill as FB is in sandbox_mode :D
		variables.logged_in = true;
		variables.user = { username: req.user.username, profile_img: 'https://graph.facebook.com/'+req.user.facebook_id+'/picture?width=20&height=20' };
	}
	else {
		variables.logged_in = false;	
	}
	res.render(template, variables);
}
