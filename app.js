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

	app.router = app.libs.express.Router();

	// Configure express
	app.express.use(app.libs.middleware.cookieParser());
	app.express.use(app.libs.middleware.bodyParser());
	app.express.use(app.libs.middleware.compression());
	app.express.use(app.libs.middleware.session({ secret: 'keyboard cat' }));
	app.express.use(app.libs.middleware.logger('dev'));
	
 	app.express.use(app.libs.middleware.favicon("public/favicon.ico"));
 	app.express.use(app.libs.middleware.methodOverride());
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


	// Utility functions that don't really have a place and can be called from anywhere
	app.util = require('./util')(app);

	app.io = require('socket.io').listen(app.http);
	app.io.set('log level', 2);

	// This should go into some kind of utility class... it applies to both admin and game.. maybe website? 

	app.io.on('connection', function(socket) {
		console.log("Client has connected!")
		socket.emit('ping', { time: new Date().getTime(), latency: 0 });
		socket.on('pong', function (data) { 
			return function(socket, data) {
				var time = new Date().getTime(); 
				var latency = time - data.time;
				socket.emit("ping", { time: new Date().getTime(), latency: latency });
			}(socket, data) 
		});

		socket.on('content', function(request){
			app.libs.fs.readFile('./content/' + request.join('/') + '.md', "utf-8", function(err, data){
				if (err) throw err;
				socket.emit('content', {
					request: request,
					response: app.libs.markdown.toHTML(data)
				})
			});
		});

		socket.on('ember-data', function(request){
			console.log(request)
			console.log(app.libs.fb.api)
			var query;
			switch (request.type) {
				case "news":
					query = "select post_id, created_time, message, description, type, attachment from stream where source_id in (select page_id from page where name = 'Langenium') and type > 0 and type in (80,128,247)"
					break;
				case "articles":
					query = "select title, created_time, content, content_html from note where uid in (select page_id from page where name = 'Langenium')"
					break;
			}
			app.libs.fb.api({ method: 'fql.query', query: query }, function(err, result){
				if (err)
					console.log(err)
				console.log(result)
				socket.emit('ember-data', {request: request, result: result });
			});

		});
	});

	return app;
};

