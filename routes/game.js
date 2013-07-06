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
	ObjectID = require('mongodb').ObjectID,
	db,
	fb,
	instances;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Pages
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.setProviders = function (database, facebook, instance_provider) {
	db = database;
	fb = facebook;
	instances = instance_provider;
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

exports.create_object = function(req, res) {
	if (req.user) {
		var new_object = {
			class: req.query.obj_class,
			instance_id: "master",
			position: {
				x: req.query.pX,
				y: req.query.pY,
				z: req.query.pZ,
				rY: req.query.rY
			},
			scale: req.query.scale,
			type: {}
		};
		new_object.type[req.query.type] = req.query.name;
		new_object.sub_type = req.query.sub_type;
		
		var callback = function(_id) {
			res.setHeader("Expires", "-1");
			res.setHeader("Cache-Control", "must-revalidate, private");
			res.writeHead(200, {"Content-Type": "application/json"});
	  		res.end(JSON.stringify(_id ? _id : {}));
		}

		db.saveObject(new_object, callback, instances);
	}
	else {
		res.setHeader("Expires", "-1");
		res.setHeader("Cache-Control", "must-revalidate, private");
		res.writeHead(200, {"Content-Type": "application/json"});
  		res.end(JSON.stringify(0));
	}
}

exports.update_object = function(req, res) {
	if (req.user) {
		var existing_object = {
			_id: new ObjectID(req.query._id),
			class: req.query.obj_class,
			instance_id: "master",
			position: {
				x: req.query.pX,
				y: req.query.pY,
				z: req.query.pZ,
				rY: req.query.rY
			},
			scale: req.query.scale,
			type: {}
		};
		existing_object.type[req.query.type] = req.query.name;
		existing_object.sub_type = req.query.sub_type;
		
		var callback = function(_id) {
			res.setHeader("Expires", "-1");
			res.setHeader("Cache-Control", "must-revalidate, private");
			res.writeHead(200, {"Content-Type": "application/json"});
	  		res.end(JSON.stringify(req.query._id));
		}

		db.saveObject(existing_object, callback, instances);
	}
	else {
		res.setHeader("Expires", "-1");
		res.setHeader("Cache-Control", "must-revalidate, private");
		res.writeHead(200, {"Content-Type": "application/json"});
  		res.end(JSON.stringify(0));
	}
}

exports.delete_object = function(req, res) {
	if (req.user) {
		var details = {
			_id: new ObjectID(req.query._id),
			class: req.query.obj_class
		};

		var callback = function(_id) {
			res.setHeader("Expires", "-1");
			res.setHeader("Cache-Control", "must-revalidate, private");
			res.writeHead(200, {"Content-Type": "application/json"});
	  		res.end(JSON.stringify(req.query._id));
		}

		db.deleteObject(details, callback, instances);
	}
	else {
		res.setHeader("Expires", "-1");
		res.setHeader("Cache-Control", "must-revalidate, private");
		res.writeHead(200, {"Content-Type": "application/json"});
  		res.end(JSON.stringify(0));
	}
}

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
