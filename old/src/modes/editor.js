/*
	editor.js
*/

var app = function () {

	this.finished_loading = function() {
		$('.ui.sidebar').sidebar('attach events', '.launch.button');

	    $('.ui.dropdown .menu').html('');
	    L.director.options.scenes.forEach(function(scene){
			$('.ui.dropdown .menu').append('<div class="item">' + scene + '</div>')    	
	    });

	    $('.ui.dropdown').dropdown({
			onChange: function (value, text) {
				L.director.options.activeScene = text;
			}
	    });
	    $('.ui.dropdown').dropdown('set selected',L.director.options.activeScene)

	    $('.console .menu').slideUp();

		console.log('[ Editor started ]');

		
		L.scenograph.animate();	
	}

	L.core.load_template('/old/src/modes/shaders.html', 'head', false);
    
	return this;
};

app.prototype._init = function() {
	L.app = new app();
}

app.prototype._destroy = function() {
	L.director.options.paused = true;
	
}