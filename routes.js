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
	io,
	passport,
	auth = require('./routes/auth.js'),
	admin = require('./routes/admin.js'),
	website = require('./routes/website.js'),
	game = require('./routes/game.js');


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Pages
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.setProviders = function (application, database, facebook, instance_provider, socketio, passport_provider) {
	app = application;
	db = database;
	fb = facebook;
	instances = instance_provider;
	io = socketio;
	passport = passport_provider;
}

exports.bind = function () {

	auth.configure_passport(passport, db);

	// Bind providers for routes 
	website.setProviders(db, fb);
	admin.setProviders(db, fb, instances, io);
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
	app.get('/editor/delete_object', game.delete_object);

	//		Admin
	app.get('/admin', admin.index);
	app.get('/admin/scene_director', admin.scene_director);



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

	app.get('/auth/facebook', function(req,res,next){
		if (req.user) {
			return res.redirect('/logged_in');
		}
		else {
			passport.authenticate('facebook')(req,res,next);
		}
	});

	app.get('/auth/facebook/callback', function(req, res, next) {
		passport.authenticate('facebook', function(err, user, info) {
			if (err) { return next(err); }
			if (!user) { console.log("User not found"); return res.redirect('/'); }
			req.logIn(user, function(err) {
			  if (err) { console.log(err); return next(err); }
			  else {
				io.sockets.emit("login", { username: req.user.username, facebook_id: req.user.facebook_id });
				return res.redirect('/logged_in');
			  }
			});
		})(req, res, next);
	});
	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/logged_in');
	});

}