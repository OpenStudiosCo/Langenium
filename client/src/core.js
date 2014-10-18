/*
	core.js
*/

L.Core = function () {
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
					files: [
						{ path: "./src/website.css" },
						{ path: "./src/website.js", callback:"l.prototype._init" }
					]
				}
			], 
			template_url: '/res/templates/website.html'
		},
		Editor: { 
			modules: [
				{
					name: "three.js",
					files: [ 
						{ path: './src/vendor/three.min.js' }						
					]
				},
				{
					name: "threex",
					requires: [ 'three.js' ],
					files: [
						{ path: './src/vendor/OrbitControls.js' }, 
						{ path: './src/vendor/threex.keyboardstate.js' }, 
						{ path: './src/vendor/threex.planets.js' } 
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
						{ path: "./src/scenograph.old.js" },
						{ path: "./src/scenograph.js" }
					]
				},
				{
					name: "Scenograph Modules",
					requires: [ 'Scenograph' ],
					files: [
						{ path: "./src/scenograph/editor.js" },
						{ path: "./src/scenograph/objects.js" },
						{ path: "./src/scenograph/stats.js" },
					]	
				},
				{
					name: "Scenograph Director Scenes",
					requires: [ "Scenograph" ],
					files: [
						{ path: "./src/scenograph/director/character_test.js" },
						{ path: "./src/scenograph/director/epochexordium.js" },
						{ path: "./src/scenograph/director/mmo.js" },
						{ path: "./src/scenograph/director/mmo_title.js" }
					]
				},
				{
					name: "Director",
					requires: [ "Scenograph", "Scenograph Modules" ],
					files: [
						{ path: "./src/director.js", callback:"L.director.prototype._init" }
					]
				},
				{
					name: "Editor Defaults",
					requires: [ 'three.js', 'threex', 'Scenograph', "Scenograph Modules", "Director" ],
					files: [
						{ path: "./src/editor.css" },
						{ path: "./src/editor.js", callback:"l.prototype._init" }
					]
				}
			], 
			template_url: '/res/templates/editor.html'
		}
	};
	// This variable 'mode' will come from somewhere
	this.mode = 'Editor';
	this.modes[this.mode].modules.sort( function( a, b ) { return a - b });
	console.log( '-\t Mode: ' + this.mode );

	_load_modules( this.modes[this.mode].modules );

	
	console.log( '-\t Loading ' + this.mode + ' template - ( ' + this.modes[this.mode].template_url + ' ) ' );
	$.ajax({
	    url: L.url + this.modes[this.mode].template_url,
	    type: "GET",
	    cache: (L.env == 'Dev' || L.env == 'Staging') ? false : true,
	    success: function(html) {
	        $("body").html(html);
	        console.log( '-\t Loaded ' + L.Core.mode + ' template - ( ' + L.Core.modes[L.Core.mode].template_url + ' ) ' );
	    }
	});

	
};

L.Core.prototype._init = function() {
	L.Core = new L.Core();
	delete L.Core._init;
}
