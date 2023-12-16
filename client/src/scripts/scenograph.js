/**
 * Multi purpose scenograph for displaying "Scenes".
 * 
 * Components
 * - Asset Loader
 * - Event handler
 * 
 * Todo:
 * - Animation Loop
 * - UI Templates
 */

// Boot up the Scenograph and populate the window accessor
function _init( wait ) {

	let iosVer = iOSversion();

	// Don't run if we are dealing with iOS < v14 as it won't work.
	if (iosVer.status && parseInt(iosVer.version) < parseInt(14)) {
		return;
	}

	window.matrix_scene.start();
	
	// Create the main engine accessor
    if ( window.s ) { alert("window.s already set! Something is wrong."); return; }
	window.s = {};

    s.version = '0.6.0';
	s.url = '//' + location.host;
	s.env = _check_environment();
	s.scale = 500000;

	console.log( '[ Langenium Engine ]' );
	console.log( '\t Version: ' + s.version );
	console.log( '\t Environment: ' + s.env );
	
	// Default modules
	var modules = [
		{
			name: "tweakpane",
			files: [ { path: './vendor/tweakpane-3.1.10.min.js' } ]
		},
		{
			name: "TWEEN.js",
			files: [ { path: './vendor/tween-21.0.0.umd.min.js' } ]
		},
		{ 
			// @todo: Implement scene changer
			name: "Test Scene",
			requires: [ 'tweakpane', 'TWEEN.js' ],
			files: [ { path: "./main.js", callback: "window.test_scene.init" } ]
		}
	];

	setTimeout( () => {
		_load_modules( modules, "s" );
	} , wait);
	
}

// @Source: https://hoohoo.top/blog/7389546/
function iOSversion() {
	let d, v;
	if (/iP(hone|od|ad)/.test(navigator.platform)) {
		v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		d = {
		status: true,
		version: parseInt(v[1], 10) , 
		info: parseInt(v[1], 10)+'.'+parseInt(v[2], 10)+'.'+parseInt(v[3] || 0, 10)
		};
	}else{
		d = {status:false, version: false, info:''}
	}
	return d;
}

// Checks URL and determines environment.
function _check_environment () {
	var env;
	switch(location.hostname.split('.')[0]) {
		case 'lcl':
			env = 'Dev';
			break;
		default:
			env = 'Live';
			break;
	}
	return env;
	
}

// Execute an arbitrary function attached to the window global s.
function _execute(functionName, arguments, context ) {
	// Usage: executeFunctionByName("s.scenograph.director.init", [], window);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for(var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(this, arguments);
}

// Loads a list of modulesm
function _load_modules (modules, modules_class) {
	console.log('[ ' + modules.length + ' modules to load ]');
	var modules_loaded = 0;	

	// Array of modules waiting to be loaded
	var require_queue = [];

	// Array of required modules that will be removed. 
	// Every time a module is loaded, it goes through this 
	// modulename: loaded (true/false)
	var required_modules = {};

	var modules_callbacks = [];  // Note callback queue is sequential
	
	var requirement_check = function(module, module_idx) {
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
						load_module(queued_module, queued_module.original_idx);
						require_queue.splice(queued_module_idx,1); 	
					}
				}
			});
		});
	}

	var load_module = function(module, module_idx) {
		var loaded_module = function() {
			console.log('\t ' + (module_idx + 1) + '/' + modules.length + ' : \t [' + module.name + '] finished loading');
			modules_loaded++;
			if (require_queue.length > 0) {
				requirement_check(module, module_idx);
			}
		};

		var loaded_files = 0;

		console.log( '\t ' + (module_idx + 1) + '/' + modules.length + ' : \t [' + module.name + ']' + (module.requires ?  '\t Requires: ' + module.requires.join(', ') : '' ) );
		module.files.forEach(function(file){	
			console.log( '\t ' + (module_idx + 1) + '/' + modules.length +  ' : \t - Loading ' + file.path );

			if (file.callback) modules_callbacks.push(file);
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
					modules_callbacks.forEach(function(file){
						console.log( '\t Executing ' + file.callback );
						_execute(file.callback, file.variables ? file.variables : {}, window );	
					});
				
				}
			}

			_load(module.name, file.path, default_callback, modules_class);
		});
	}

	modules.forEach(function(module, module_idx) {
		if (module.requires){
			module.requires.forEach(function(dependency){
				if ( typeof required_modules[dependency] === 'undefined' ) {
					required_modules[dependency] = false;
				}
			});
			module.original_idx = module_idx;
			require_queue.push(module);
		}
		else {
			load_module(module, module_idx );
		}

	}); 

}

// Loads a module and then fires the relevant callback.
function _load(name, path, callback, modules_class) {
	document.write.to = {filename: path};
	var head = document.getElementsByTagName('head')[0];

	// Disable cache for Dev and Staging
	path += (s.env == 'Dev' || s.env == 'Staging') ? '?_=' + Date.now() : '';
	
	if (path.match(/\.js/)) {
		var script = document.createElement('script');
		script.type = 'module';
		script.className += modules_class;
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
