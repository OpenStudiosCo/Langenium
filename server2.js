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

var 	// Container for 3rd Party Libs and models and controllers. This allows everything to easily talk to each other
		modules = {
			connect: require('connect'),
			express: require('express.io'),
			passport : require('passport'),
			fbsdk: require('facebook-sdk'),
			mongoose: require('mongoose'),
			path: require('path'),
			fs: require('fs'),
			io: require('socket.io').listen(8080),
			THREE: require('./three.js'),
			models: {},
			controllers: {},
			import_classes: function(modules, module_obj, path) {
				modules.fs.readdirSync(path).forEach(function (file) {
					var filename = file.replace('.js','');
					if(file.substr(-3) == '.js') {
						module_obj[filename] = require(path + '/' + file)(modules);
					}
				});
			}
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
console.log("Initializing models");
modules.import_classes(modules, modules.models, './models');
console.log(modules.models)

// Initialize controllers
console.log("Initializing controllers");
modules.import_classes(modules, modules.controllers, './controllers');
console.log(modules.controllers)


// Start server
server.listen(process.env['HTTP_PORT']); // dev

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

