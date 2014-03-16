/*

	LANGENIUM
	Server Application

*/

var 	modules = require('./modules')();

// Initialize models
modules.import_classes(modules, modules.models, './models');

// Initialize controllers
modules.import_classes(modules, modules.controllers, './controllers');

// Initialize routes
modules.import_classes(modules, modules.routes, './routes');

// Start server
modules.server.listen(process.env['HTTP_PORT']); // dev

// FOR DEBUGGING ONLY
if (process.env['HOST_URL'].indexOf('dev') >= 0) {
	global.modules = modules;
}