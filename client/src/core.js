/*
	core.js
*/

L.Core = function () {
	console.log( '[ Client starting ]' );
	/*
		Modes:
			Default
			Editor
	*/
	this.modes = {
		Default: { 
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
			template_url: '/res/templates/homepage.html'
		},
		Editor: { 
			modules: [
			], 
			template_url: '/res/templates/editor.html'
		}
	};
	// This variable 'mode' will come from somewhere
	this.mode = 'Default';
	this.modes[this.mode].modules.sort( function( a, b ) { return a - b });

	var finished_loading = function() {
		console.log('[ Client modules loaded ]')
	}

	_load_modules(this.modes[this.mode].modules, finished_loading);

	console.log( '-\t Mode: ' + this.mode );
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