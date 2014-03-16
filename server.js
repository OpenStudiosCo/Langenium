/*

	Server Startup Script

*/

var 	app = require('./app')();

// Initialize models
app.util.import_classes(app.models, './models');

// Initialize controllers
app.util.import_classes(app.controllers, './controllers');

// Configure the main route
app.express.get('/', function(req, res){
	
});

// Start server
app.http.listen(process.env['HTTP_PORT']); // dev

console.log(app);
console.log("\nServer started successfully\n");