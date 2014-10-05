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
						{ path: "./src/website.js" }
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
	var mode = 'Default';
	this.mode = this.modes[mode];

	var finished_loading = function() {
		console.log('[ Client modules loaded ]')
	}

	_load_modules(this.mode.modules, finished_loading);
	
	console.log( '-\t Mode: ' + mode );
	console.log( '-\t Loading ' + mode + ' template - ( ' + this.mode.template_url + ' ) ' );
	$.ajax({
	    url: L.url + this.mode.template_url,
	    type: "GET",
	    cache: (L.env == 'Dev' || L.env == 'Staging') ? false : true,
	    success: function(html) {
	        $("body").html(html);
	        console.log( '[ Client template loaded ]' );
	    }
	});

	
};

L.Core.prototype._init = function() {
	L.Core = new L.Core();
	delete L.Core._init;
}