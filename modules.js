/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Modules
	Container for 3rd Party Libs and models and controllers. This allows everything to easily talk to each other

\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Setup Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports = function() {
	var modules = {
		// 3rd Party libs
		connect: require('connect'),
		express: require('express'),
		passport : require('passport'),
		fbsdk: require('facebook-sdk'),
		mongoose: require('mongoose'),
		path: require('path'),
		fs: require('fs'),
		os: require('os'),
		THREE: require('./three.js'),
		// Class object containers
		routes: {},
		models: {},
		controllers: {},
		// Functions
		import_classes: function(modules, module_obj, path) {
			modules.fs.readdirSync(path).forEach(function (file) {
				var filename = file.replace('.js','');
				if(file.substr(-3) == '.js') {
					module_obj[filename] = require(path + '/' + file)(modules);
				}
			});
		},
		render: function(req, res, template, variables) {
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
	};

	// Connect to database

	modules.mongoose.connect('127.0.0.1:27017/langenium', {
		user: process.env['DB_USERNAME'],
		pass: process.env['DB_PASSWORD']
	});

	// More 3rd party modules that are dependent on the other set already being initialized
	modules.fb = new modules.fbsdk.Facebook({ appId: process.env['APP_ID'], secret: process.env['APP_SECRET'] });
	modules.app = modules.express();
	modules.server = require('http').createServer(modules.app);
	modules.io = require('socket.io').listen(8080);
	modules.io.set('log level', 2);

	// Configure express app
	modules.app.configure(function () {
		
		modules.app.use(modules.app.router);
		modules.app.use(modules.connect.cookieParser());
		modules.app.use(modules.connect.bodyParser());
		modules.app.use(modules.connect.compress());
		modules.app.use(modules.connect.session({ secret: 'keyboard cat' }));
		modules.app.use(modules.connect.logger('dev'));
		modules.app.use(modules.connect.static(__dirname + '/public'));
	 	modules.app.use(modules.connect.favicon("public/favicon.ico"));
	 	modules.app.use(modules.express.methodOverride());
		modules.app.use(modules.fb);
		modules.app.use(modules.passport.initialize());
	  	modules.app.use(modules.passport.session());

		modules.app.set('views', __dirname + '/views');
		modules.app.set('view engine', 'jade');
		modules.app.locals.pretty = true;
		
		

	});
	return modules;
};

