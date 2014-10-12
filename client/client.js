/*
	client.js
*/

// Boot up the client and populate the L accessor
function _init() {
	
	// Create the main engine accessor L
	window.L = {};
	L.version = '.5.1-alpha';
	L.url = 'http://' + location.hostname; // output is http://prefix.langenium.com without a trailing '/'
	L.env = _check_environment();

	console.log( '%c', 'line-height: 50px; padding: 30px 120px; background:url("' + L.url + '/res/logo-medium.png") no-repeat left center;' );
	console.log( '[ Langenium Engine ]' );
	console.log( '-\t Version: ' + L.version );
	console.log( '-\t Environment: ' + L.env );
	console.log( '[ Loading dependencies ]' );
	
	// Default modules
	var modules = [
		{ 
			name: "JQuery" ,
			files: [ { path: "./src/vendor/jquery-2.1.1.min.js" } ]
		},
		{
			name: "Semantic UI" ,
			requires: [ 'JQuery' ],
			files: 	[ 
						{ path: "./src/vendor/semantic.js" , callback: 'poop' }, 
						{ path: "./src/vendor/semantic.css" }, 
				   	] 					
		},
		{ 	
			name: "Core",
			requires: [ 'JQuery', 'Semantic UI' ],
			files: [ 
				{ path: "./src/core.js", 	callback: 'L.Core.prototype._init' },
				{ path: "./src/core.css" }
			]
		}
	];

	_load_modules( modules );

}
window.poop = function() {
	console.log('-\t poop');
}
function _execute(functionName, context /*, args */) {
	// Usage: executeFunctionByName("L.scenograph.director"., window, arguments);
	var args = [].slice.call(arguments).splice(2);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for(var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(this, args);
}

function _check_environment () {
	var env;
	switch(location.hostname.split('.')[0]) {
		case 'dev':
			env = 'Dev';
			break;
		case 'staging':
			env = 'Staging';
			break;
		default:
			env = 'Live';
			break;
	}
	return env;
	
}

function _load_modules (modules) {

	var modules_loaded = 0;	

	// Array of modules waiting to be loaded
	var require_queue = [];

	// Array of required modules that will be removed. 
	// Every time a module is loaded, it goes through this 
	// modulename: loaded (true/false)
	var required_modules = {};

	var modules_callbacks = [];  // Note callback queue is sequential

	
	var requirement_check = function(module, module_idx) {
		console.log('-\t Looping through requirement queue to see if we can process anything.');

		// Set the switch so modules waiting on this module can load
		if ( required_modules[module.name] == false) {
			required_modules[module.name] = true;
		}
		
		// Check the required_modules array to see if there are any modules waiting for a module to be loaded	
		require_queue.forEach(function(queued_module, queued_module_idx){
			// Checking each dependency and comparing it to the required_modules array to see if it's been loaded
			var required_score = queued_module.requires.length;
			var score = 0;
			queued_module.requires.forEach(function(queued_module_requirement){
				if (required_modules[queued_module_requirement] == true) {
					score++;
					if (required_score == score) {
						console.log('-\t Ready to load ' + queued_module.name + ' ( Requires: ' + queued_module.requires.join(', ') + ' ) ')
						
						load_module(queued_module, (modules_loaded + queued_module_idx - 1));
						require_queue.splice(queued_module_idx,1); 	
					}
				}
			});
		});
	}

	var load_module = function(module, module_idx) {
		var loaded_module = function() {
			console.log('-\t Loaded ' + (module_idx + 1) + '/' + modules.length + ' : ' + module.name);
			modules_loaded++;
			requirement_check(module, module_idx);
		};

		var loaded_files = 0;

		module.files.forEach(function(file){	
			console.log( '-\t Loading ' + (module_idx + 1) + '/' + modules.length + ' : ' + module.name + ' ( ' + file.path + ' ) ' );

			if (file.callback) modules_callbacks.push(file.callback);
			// Add a default callback that wraps the normal callback
			var default_callback = function() {			
				loaded_files++;				
				if (loaded_files == module.files.length) {
					loaded_module();	
				}
				if (modules_loaded == modules.length) {
					console.log('[ ' + modules.length + ' modules loaded, processing callbacks ]');
					// Sort the callbacks so that they fire in order
					modules_callbacks.sort( function( a, b ) { return a - b });
					
					// Fire all the enqueued callbacks
					modules_callbacks.forEach(function(callback){
						console.log( '-\t Executing ' + callback );
						_execute(callback, window);	
					});
				
				}
			}

			_load(module.name, file.path, default_callback);
		});
	}

	modules.forEach(function(module, module_idx) {
		if (module.requires){
			console.log('-\t ' + module.name + ' requires: ' + module.requires.join(', ') + '. Checking requirement queue.');
			module.requires.forEach(function(dependency){
				if ( typeof required_modules[dependency] === 'undefined' ) {
					required_modules[dependency] = false;
				}
			});
			require_queue.push(module);
		}
		else {
			load_module(module, module_idx );
		}

	}); 

}

function _load(name, path, callback) {
	var head = document.getElementsByTagName('head')[0];

	path += (L.env == 'Dev' || L.env == 'Staging') ? '?_=' + Date.now() : '';
	
	if (path.match(/\.js/)) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = path;
		if (callback) {
			script.onload = callback;
		}
		head.appendChild(script);
	}
	if (path.match(/\.css/)) {
		var stylesheet = document.createElement('link');
		stylesheet.rel = 'stylesheet';
		stylesheet.href = path;
		if (callback) {
			stylesheet.onload = callback;
		}
		head.appendChild(stylesheet); 	
	}
}
