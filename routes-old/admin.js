/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Admin
	This class contains handlers for admin paths
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var https = require('https'),
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

exports.index = function(req, res) {
	render(req, res, 'admin/index', { title: "Dashboard - Admin - Langenium", page: 'dashboard' });
};
exports.scene_director = function(req, res) {
	var objects, instances;
	var objects_callback = function(result) {
		objects = result;
		db.queryClientDB("instances", { }, instance_callback);
		
	};
	var instance_callback = function(result) {
		instances = result;
		render(req, res, 'admin/index', { title: "Scene director - Admin - Langenium", page: 'scene_director', objects: objects, instances: instances });
	};
	db.queryClientDB("objects", { }, objects_callback);
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
