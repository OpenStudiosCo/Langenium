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
		THREE = require('./three.js'),
		// Langenium Modules
		db = require("./db.js"),
		events = require('./events.js'),
		instance = require('./instance.js'),
		//Routes
		routes = require('./routes.js');
	

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
	app.locals.pretty = true;
	app.use(connect.favicon("public/favicon.ico"));
	app.use(app.router);
	app.use(connect.logger('dev'));
	app.use(connect.static(__dirname + '/public'));
 	app.use(express.methodOverride());
  	

	app.use(fb);

});

routes.setProviders(app, db, fb, instances);
routes.bind();

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

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/logged_in');
});


// Start server
server.listen(process.env['HTTP_PORT']); // dev
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
	socket.on("move_ship" , function(data){ events.move_ship(socket, data, db, instances, client_sessions); });
	socket.on("move_character" , function(data){ events.move_character(socket, data, db, instances, client_sessions); });
	socket.on("character_toggle" , function(){ events.character_toggle(socket, db, instances, client_sessions); });
});

function makeUniverse() {
/*
	Sets up the main map
*/
	
	var instances_callback = function(results) {
		results.forEach(function(instance_result){
			instances[instance_result.instance_id] = instance.make(io, instance_result.type, THREE, db);
			instances[instance_result.instance_id].instances.push(instance.make(io, instance_result.child_id));
			var objects = function(obj_result) { 
				obj_result.forEach(function(object){
					instances[instance_result.instance_id].addObjectToContainer(object, instances[instance_result.instance_id], THREE, db);
				}); 
			};

			db.queryClientDB("instance_objects", { instance_id: instance_result.instance_id }, objects);
		});
	}

	db.queryClientDB("instances", { }, instances_callback );

}
