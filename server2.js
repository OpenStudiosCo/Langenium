/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	LANGENIUM SERVER 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Modules
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


var 	modules = require('./modules')();

// Initialize models
//console.log("Initializing models");
modules.import_classes(modules, modules.models, './models');
//console.log(modules.models)

// Initialize controllers
//console.log("Initializing controllers");
modules.import_classes(modules, modules.controllers, './controllers');
//console.log(modules.controllers)

// Initialize routes
//console.log("Initializing routes");
modules.import_classes(modules, modules.routes, './routes');
//console.log(modules.app.routes)

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Startup (move these into a class later and import via modules?). Maybe create a new class called director ? 
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Get the auto startup instances running and load in their objects
modules.models.game.scene.model.find({}, function(err, scenes) {
	scenes.forEach(function(scene,index) {
		if (scene.startup == 'auto') {
			modules.controllers.game.scene.instance.create(scene, function() {
				modules.add_clock(
					modules.controllers.game.scene.instance.collection[modules.controllers.game.scene.instance.collection.length-1], 
					modules.controllers.game.scene.instance.collection[modules.controllers.game.scene.instance.collection.length-1].update
				);	
				//console.log(modules.controllers.game.scene.instance.collection)
					var plop = new modules.models.user.model({
						username: "plog",
						characters: [
							{ object_id:  "51d68ed1fc48c37630000000" },
							{ object_id:  "526fae95ba40eb100a000001" }
						]
					});
					console.log(plop)
			});
			
		}
	});
});

// Start server
modules.app.listen(process.env['HTTP_PORT']); // dev

