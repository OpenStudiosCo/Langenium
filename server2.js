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
		client_sessions = [];

var 	// 3rd Party Libs
		modules = {
			connect: require('connect'),
			express: require('express.io'),
			passport : require('passport'),
			fbsdk: require('facebook-sdk'),
			mongoose: require('mongoose'),
			path: require('path'),
			fs: require('fs'),
			io: require('socket.io').listen(8080),
			THREE: require('./three.js')
		}

modules.fb = new modules.fbsdk.Facebook({ appId: process.env['APP_ID'], secret: process.env['APP_SECRET'] });

var 	app = modules.express(),
		server = require('http').createServer(app);

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Startup
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


app.configure(function () {
	
	app.use(app.router);
	app.use(modules.connect.cookieParser());
	app.use(modules.connect.bodyParser());
	app.use(modules.connect.compress());
	app.use(modules.connect.session({ secret: 'keyboard cat' }));
	app.use(modules.connect.logger('dev'));
	app.use(modules.connect.static(__dirname + '/public'));
 	app.use(modules.connect.favicon("public/favicon.ico"));
 	app.use(modules.express.methodOverride());
	app.use(modules.fb);
	app.use(modules.passport.initialize());
  	app.use(modules.passport.session());

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
	
	

});

// Initialize models
var models = {};
modules.fs.readdirSync('./models').forEach(function (file) {
	var filename = file.replace('.js','');
	if(file.substr(-3) == '.js') {
		models[filename] = require('./models/' + file);
		models[filename] = models[filename].bind(modules);
	}
});

console.log(models)

var controllers;
// Bind controllers
modules.fs.readdirSync('./controllers').forEach(function (file) {
	var filename = file.replace('.js','');
	if(file.substr(-3) == '.js') {
		controllers[filename] = require('./controllers/' + file);
		controllers[filename] = controllers[filename].bind(modules);
	}
});



// Start server
server.listen(process.env['HTTP_PORT']); // dev

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

