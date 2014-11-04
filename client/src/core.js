/*
	core.js
*/

var core = function () {
	console.log( '[ Client starting ]' );
	/*
		Modes are basically self contained applications within the application that can be swapped 
		out at runtime.

		Modes:
			Default
			Editor
	*/
	this.modes = {
		Website: { 
			modules: [
				{
					name: "JQuery Cycle",
					files: [ 
						{ path: './src/vendor/jquery.cycle2.min.js' } 
					]
				},
				{
					name: "Website Defaults",
					requires: [ "JQuery Cycle" ],
					files: [
						{ path: "./src/modes/website.css" },
						{ path: "./src/modes/website.js", callback:"app.prototype._init" }
					]
				}
			], 
			template_url: '/src/modes/website.html'
		},
		Editor: { 
			modules: [
				{
					name: "three.js",
					files: [ 
						{ path: './src/vendor/three.js' }						
					]
				},
				{
					name: "threex",
					requires: [ 'three.js' ],
					files: [
						{ path: './src/vendor/OrbitControls.js' }, 
						{ path: './src/vendor/threex.keyboardstate.js' }, 
						{ path: './src/vendor/threex.planets.js' },
						{ path: './src/vendor/ThreeCSG.js' },
						{ path: './src/vendor/Mirror.js' },
						{ path: './src/vendor/WaterShader.js' },
					]
				},
				{
					name: "Scenograph Compatibility",
					files: [
						{ path: './src/vendor/smoothie.js' }
					]
				},
				{
					name: "Scenograph",
					requires: [ 'three.js', 'threex', "Scenograph Compatibility" ],
					files: [
						{ path: "./src/scenograph.js", callback: 'scenograph.prototype._init' }
					]
				},
				{
					name: "Scenograph Modules",
					requires: [ 'Scenograph' ],
					files: [
						{ path: "./src/scenograph/editor.js", callback: 'editor.prototype._init' },
						{ path: "./src/scenograph/objects.js", callback: 'objects.prototype._init' },
						{ path: "./src/scenograph/stats.js", callback: 'stats.prototype._init' },
					]	
				},
				{
					name: "Director",
					requires: [ "Scenograph", "Scenograph Modules" ],
					files: [
						{ path: "./src/director.js", callback:"director.prototype._init" }
					]
				},
				{
					name: "Director Scenes",
					requires: [ "Scenograph", "Director" ],
					files: [
						// Note, the startup for these activates the scene :P
						{ path: "./src/director/character_test.js" },
						{ path: "./src/director/epochexordium.js" },
						{ path: "./src/director/mmo.js" },
						{ path: "./src/director/mmo_title.js"  },
						{ path: "./src/director/porta.js"  },
						{ path: "./src/director/sandbox.js"  }

					]
				},
				{
					name: "Editor Defaults",
					requires: [ 'three.js', 'threex', 'Scenograph', "Scenograph Modules", "Director", "Director Scenes" ],
					files: [
						{ path: "./src/modes/editor.css" },
						{ path: "./src/modes/editor.js", callback:"app.prototype._init" }
					]
				}
			], 
			template_url: '/src/modes/editor.html'
		}
	};
	// This variable 'mode' will come from somewhere
	this.mode = 'Website';
	this.change_mode(this.mode);

	return this;
};

core.prototype._init = function() {
	L.core = new core();
}

core.prototype.change_mode = function(mode) {
	// Remove existing modules loaded by any active mode
	if (L.app) {
		L.app._destroy();
	}
	$('script.Core').remove();

	this.modes[mode].modules.sort( function( a, b ) { return a - b });
	console.log( '-\t Client Mode: ' + mode );

	_load_modules( this.modes[mode].modules, "Core");
	
	console.log( '-\t Loading ' + mode + ' template - ( ' + this.modes[mode].template_url + ' ) ' );
	$.ajax({
	    url: L.url + this.modes[mode].template_url,
	    type: "GET",
	    cache: (L.env == 'Dev' || L.env == 'Staging') ? false : true,
	    success: function(html) {
	        $("body").html(html);
	        console.log( '-\t Loaded ' + mode + ' template - ( ' + L.core.modes[mode].template_url + ' ) ' );
	    }
	});

}	