/*

	Container for the Langenium Server application modules and current state

*/

module.exports = function() {

	var app = {
		controllers: {},
		models: {},
		routes: {}
	};
	// All vendor modules/libraries hang off here
	app.libs = require('./libs')();
	
	// Express is being initialized on the main container as it's going to be called very often, 
	// other stuff could possibly be moved up to the top level if required
	app.express = app.libs.express();

	// Create an endpoint for the HTTP server on the main application
	app.http = require('http').createServer(app.express);

	// Configure express
	app.express.configure(function () {
		app.express.use(app.express.router);
		app.express.use(app.libs.connect.cookieParser());
		app.express.use(app.libs.connect.bodyParser());
		app.express.use(app.libs.connect.compress());
		app.express.use(app.libs.connect.session({ secret: 'keyboard cat' }));
		app.express.use(app.libs.connect.logger('dev'));
		
	 	app.express.use(app.libs.connect.favicon("public/favicon.ico"));
	 	app.express.use(app.libs.express.methodOverride());
		app.express.use(app.libs.fb);
		app.express.use(app.libs.passport.initialize());
	  	app.express.use(app.libs.passport.session());
	  	app.express.use(app.libs.stylus.middleware({
	  		debug: true,
	  		src: __dirname + '/',
	  		dest: __dirname + '/public/',
	  		compile: function (str, path) {
	  			return app.libs.stylus(str)
	  			.set('filename', path)
	  			.use(app.libs.jeet());
			}
	  	}));
	  	app.express.use(app.libs.express.static(__dirname + '/public')); // This has to be after stylus so that the CSS files get regenerated on change
	  	
		app.express.set('views', __dirname + '/views');
		app.express.set('view engine', 'jade');
		app.express.locals.pretty = true;
	});

	// Utility functions that don't really have a place and can be called from anywhere
	app.util = require('./util')(app);

	return app;
};

