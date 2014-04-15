/*

	Server Startup Script

*/

var 	app = require('./app')();

// Initialize models
//app.util.import_classes(app.models, './models');

// Initialize controllers
//app.util.import_classes(app.controllers, './controllers');

//* Configure the main route
app.express.get('/', function(req, res){
	app.util.render(req, res, 'index', { page_template: "website/home", title: "Home - Langenium" });
});

// Start server
app.http.listen(process.env['HTTP_PORT']); // dev

console.log("\nServer started in " + process.env.NODE_ENV + " mode succesfully");