/*
	editor.js
*/

var app = function () {
	
    $('.ui.sidebar').sidebar('attach events', '.launch.button');

	console.log('[ Editor started ]');

	return this;
};

app.prototype._init = function() {
	L.app = new app();
}
