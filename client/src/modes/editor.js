/*
	editor.js
*/

var app = function () {
	
    $('.ui.sidebar').sidebar('attach events', '.launch.button');

    $('.ui.dropdown').dropdown();
    $('.ui.dropdown').hide();

    $('.console .menu').slideUp();

	console.log('[ Editor started ]');

	
	L.scenograph.animate();

	return this;
};

app.prototype._init = function() {
	L.app = new app();
}

app.prototype._destroy = function() {
	L.director.options.paused = true;
	
}