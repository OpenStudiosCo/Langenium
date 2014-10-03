/*
	client.js
*/


function _init() {
	// Boot up the client 

	window.L = {};

	var env = _check_environment();

	console.log( '%c', 'line-height: 50px; padding: 30px 120px; background:url("http://' + location.hostname + '/res/logo-colour-medium.png") no-repeat left center;' );

	console.log( '---' );
	console.log( 'Version: 0.5.1-alpha' );
	
	console.log( 'Environment: ' + env );
	console.log( '---' );
	console.log( 'Starting client ' );

	
	
	// Default modules set in variable (core.js, jquery) 
	var modules = [
		{ 
			name: "JQuery" ,
			files: [ { path: "./src/vendor/jquery-2.1.1.min.js" } ]
		},
		{
			name: "Semantic UI" , 	
			files: [ { path: "./src/vendor/semantic.js" } ] 						
		},
		{ 	
			name: "Core", 		
			files: [ { path: "./src/core.js", 	callback: 'L.bleh' }]
		}
	];

	// Determine list of modules to use (hardcode for now)

	// Load all the modules and fire relevant callbacks
	// executeFunctionByName below can be used to fire callbacks that aren't defined yet

	modules.forEach(function(module){
		module.files.forEach(function(file){
			console.log( '- Loading ' + module.name + ' ( ' + file.path + ' ) ' );
			_load(file.path, file.callback);	
		});
		
	}); 

	var stylesheets = [
		{ name: "Semantic UI",	path: "./src/" }
	];
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

function _load(path, callback) {
	var head = document.getElementsByTagName('head')[0];
	if (path.match(/\.js/)) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = path;
		if (callback) {
			// most browsers
			script.onload = _execute(callback, window);
			
		}
		head.appendChild(script);
	}
	if (path.match(/\.css/)) {
		var stylesheet = document.createElement('link');
		stylesheet.rel = 'Stylesheet';
		stylesheet.href = path;
		if (callback) {
			stylesheet.onload = _execute(callback, window);
		}
		head.appendChild(stylesheet);
	}
}
