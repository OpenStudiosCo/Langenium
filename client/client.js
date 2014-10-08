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
			files: 	[ 
						{ path: "./src/vendor/semantic.js" , callback: 'poop' }, 
						{ path: "./src/vendor/semantic.css" }, 
				   	] 					
		},
		{ 	
			name: "Core",
			files: [ 
				{ path: "./src/core.js", 	callback: 'L.Core.prototype._init' },
				{ path: "./src/core.css" }
			]
		}
	];

	// Load all the modules. Callbacks don't fire until all modules are loaded
	var finished_loading = function() {
		console.log('[ ' + modules.length + ' modules loaded, processing callbacks ]');
	}
	_load_modules(modules, finished_loading);

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

function _load_modules (modules, finished_loading) {

	// Sort the modules array so the load in order
	modules.sort( function( a, b ) { return a - b });
	
	var modules_loaded = 0;	

	// Array of modules waiting to be loaded
	var require_queue = [];

	// Array of required modules that will be removed. 
	// Every time a module is loaded, it goes through this 
	// modulename: loaded (true/false)
	var required_modules = {};

	var modules_callbacks = [];  // Note callback queue is sequential
	modules.forEach(function(module, module_idx){
		if (module.requires){
			console.log('-\t ' + module.name + ' requires: ' + module.requires.join(', ') + '. Adding to requirement queue.');
			module.requires.forEach(function(dependency){
				if ( typeof required_modules[dependency] === 'undefined' ) {
					required_modules[dependency] = false;
				}
				require_queue.push(module);
				console.log(require_queue)
			});
		}
		else {
			var loaded_module = function() {
				console.log('-\t Loaded ' + (module_idx + 1) + '/' + modules.length + ' : ' + module.name);
				modules_loaded++;			
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
						// This is a hook to do something before module callbacks are fired
						if (finished_loading) finished_loading();
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
