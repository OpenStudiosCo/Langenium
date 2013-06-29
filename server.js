/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	LANGENIUM SERVER 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var 	// Variables
		instances = {},
		client_sessions = [],
		host_url = process.env['HOST_URL'],
		app_id = process.env['APP_ID'],
		app_secret = process.env['APP_SECRET'];

var 	// 3rd Party Libs
		connect = require('connect'),
		express = require('express'),
		app = express(),
		passport  = require('passport'),
		fbsdk = require('facebook-sdk'),
		// Fire up libs
		server = require('http').createServer(app),
		io = require('socket.io').listen(8080),
		fb = new fbsdk.Facebook({ appId: app_id, secret: app_secret }),
		FacebookStrategy = require('passport-facebook').Strategy,
		// Langenium Modules
		db = require("./db.js"),
		events = require('./events.js'),
		instance = require('./instance.js'),
		//Routes
		website = require('./routes/website.js'),
		game = require('./routes/game.js');
	

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Startup
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


makeUniverse();
app.configure(function () {
	app.use(connect.cookieParser());
	app.use(connect.bodyParser());
	app.use(connect.compress());
	app.use(connect.session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
  	app.use(passport.session());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', {pretty: true});
	app.use(connect.favicon("public/favicon.ico"));
	app.use(app.router);
	app.use(connect.logger('dev'));
	app.use(connect.static(__dirname + '/public'));
 	app.use(express.methodOverride());
  	

	app.use(fb);

});

// Bind website 
website.setProviders(db, fb);

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
//		Security overrides
app.get('/wiki/*', website.redirect);

// Setup Facebook authentication
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
passport.use(new FacebookStrategy({
	clientID: app_id,
	clientSecret: app_secret,
	callbackURL: "http://" + host_url + "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	
  	var checkUserExists = function(result){
		if (result.length == 0) {
			db.addUser(profile._json.username, profile._json.id);
		}
  	};
 	var user = { 
 		username: profile._json.username, 
 		facebook_id: profile._json.id
 	};
  	db.queryWebsiteDB("users", { facebook_id: profile._json.id }, checkUserExists);
	return done(null, user);
  }
));
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', function(req, res, next) {
  passport.authenticate('facebook', function(err, user, info) {
	if (err) { return next(err); }
	if (!user) { console.log("User not found"); return res.redirect('/'); }
	req.logIn(user, function(err) {
	  if (err) { console.log(err); return next(err); }
	  
	  return res.redirect('/guide/');
	});
  })(req, res, next);
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// Test Facebook albums



// Start server
//server.listen(8000, "127.0.0.1"); // production
server.listen(process.env['HTTP_PORT']); // dev

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
io.set('log level', 2); // supresses the console output
io.sockets.on('connection', function (socket) {
	// Ping and Pong
	socket.emit("ping", { time: new Date().getTime(), latency: 0 }); 
	socket.on("pong", function(data){ events.pong(socket, data); });

	// Player
	socket.on("login", function(data){ events.login(socket, data, db, instances, client_sessions); });
	socket.on("disconnect" , function ()  { events.logout(socket, db, instances, client_sessions); });
	socket.on("move",function(data){ });
});

function makeUniverse() {
/*
	Sets up the main map
*/
	// Create container and first object 
	instances.master = instance.make("container", false);
	instances.master.instances.push(
		instance.make("world", false)
	);
	
	// Check the database for any objects that belong to this instance and add them
	var objects = function(result) { 
		result.forEach(function(object){
			instances.master.addObjectToContainer(object, instances.master);
		}); 
	};
	
	db.queryClientDB("instance_objects", { instance_id: "master" }, objects);

}
