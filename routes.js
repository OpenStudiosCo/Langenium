/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Routes
	This class binds routes to route handlers in /routes
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var app,
	db,
	fb,
	instances,
	website = require('./routes/website.js'),
	game = require('./routes/game.js');


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Pages
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.setProviders = function (application, database, facebook, instance_provider) {
	app = application;
	db = database;
	fb = facebook;
	instances = instance_provider;
}

exports.bind = function () {
	// Bind website 
	website.setProviders(db, fb);

	// Bind game client
	game.setProviders(db, fb, instances);

	// Route bindings
	//		Home page
	app.get('/', website.index);
	app.get('/news', website.news);
	//		About
	app.get('/about/*', website.about);
	//		Gallery
	app.get('/gallery/', website.gallery_list);
	app.get('/gallery/*', website.gallery);
	//		Game guide
	app.get('/guide/*', website.guide);
	app.post('/guide/save', website.guide_save);
	//		Community
	app.get('/community/*', website.community);
	//		Play Langenium
	app.get('/play', game.play);
	app.get('/play/*', game.play);
	//		Map editor
	app.get('/editor', game.editor);
	app.get('/editor/selected', game.selected);
	app.get('/editor/create_object', game.create_object);
	app.get('/editor/update_object', game.update_object);
	//		Security overrides
	app.get('/wiki/*', website.redirect);
	//		Self closing page, might need to rename later but CBF
	app.get('/logged_in', function(req, res) {
		res.setHeader("Expires", "-1");
		res.setHeader("Cache-Control", "must-revalidate, private");
		res.render('logged_in', {  });
	});
	//		AJAX return to check if we're dealing with a
	app.get('/login_check', function(req, res) {
		res.setHeader("Expires", "-1");
		res.setHeader("Cache-Control", "must-revalidate, private");
		res.writeHead(200, {"Content-Type": "application/json"});
  		res.end(JSON.stringify(req.user ? req.user : {}));
	});
}