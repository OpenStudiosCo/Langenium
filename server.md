
```js
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
```

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 

```js
	LANGENIUM SERVER 
 
```

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

```js
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
 
 
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Modules
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
 
 
var 	modules = require('./modules')();
 
```

Initialize models
console.log("Initializing models");

```js
modules.import_classes(modules, modules.models, './models');
```

console.log(modules.models)
 
Initialize controllers
console.log("Initializing controllers");

```js
modules.import_classes(modules, modules.controllers, './controllers');
```

console.log(modules.controllers)
 
Initialize routes
console.log("Initializing routes");

```js
modules.import_classes(modules, modules.routes, './routes');
```

console.log(modules.app.routes)
 

```js
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Startup (move these into a class later and import via modules?). Maybe create a new class called director ? 
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
 
```

Get the auto startup instances running and load in their objects

```js
modules.models.game.scene.model.find({}, function(err, scenes) {
	scenes.forEach(function(scene,index) {
		if (scene.startup == 'auto') {
			modules.controllers.game.scene.instance.create(scene, function(index) {
				modules.add_clock(
					modules.controllers.game.scene.instance.collection[index], 
					modules.controllers.game.scene.instance.update
				);
			});
		}
	});
});
 
```

Start server

```js
modules.server.listen(process.env['HTTP_PORT']); // dev
 
```

FOR DEBUGGING ONLY

```js
if (process.env['HOST_URL'].indexOf('dev') >= 0) {
	global.modules = modules;
}
 
 
```
