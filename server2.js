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
		connect = require('connect'),
		express = require('express.io'),
		app = express(),
		passport  = require('passport'),
		fbsdk = require('facebook-sdk'),
		mongoose = require('mongoose'),
		path = require('path'),
		dir = require('node-dir'),
		// Fire up libs
		server = require('http').createServer(app),
		io = require('socket.io').listen(8080),
		fb = new fbsdk.Facebook({ appId: process.env['APP_ID'], secret: process.env['APP_SECRET'] }),
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

// Initialize models
var models = import_libs('./models/', 'initialize');

/*
var controllers;
// Bind controllers
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      controllers[file.substr(-3)] = require('./controllers/' + file);
      controllers[file.substr(-3)].bind(app, db, fb, instances, io, passport);
  }
});
*/


// Start server
server.listen(process.env['HTTP_PORT']); // dev

events.bind_events(io, db, instances, client_sessions);

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

function import_libs(directory_path, callback_name) {
/*

	Imports all files from the directories 

*/
	var return_obj = {};
	dir.paths(directory_path,

	    function(err, paths) {
	        if (err) throw err;	
	        
	        paths.files.forEach(function(file_path){
	        	
	        	if (file_path.indexOf('\\') >= 0) {
		        	path_segments = file_path.replace('\\','//').split('//');
		        	file_path = './/' + file_path;
		        }
		        else {
		        	path_segments = filename.split('//');	
		        	file_path = './/' + file_path;
		        }
		        
		        return_obj[path_segments[path_segments.length-1].replace('.js','')] = require(file_path);
	        });
			
	        return return_obj;
	    }
	);

}

function makeUniverse() {
/*
	Sets up the main map
*/
	
	var instances_callback = function(results) {
		results.forEach(function(instance_result){
			
			instances[instance_result.instance_id] = instance.make(io, instance_result.type, THREE, db);
			

			var objects = function(obj_result) { 
				obj_result.forEach(function(object){
					instances[instance_result.instance_id].addObject(object, instances[instance_result.instance_id], THREE, db);
				}); 
			};
			db.queryClientDB("instance_objects", { instance_id: instance_result.instance_id }, objects);
			
		
		});

	}

	db.queryClientDB("instances", { }, instances_callback );

}
