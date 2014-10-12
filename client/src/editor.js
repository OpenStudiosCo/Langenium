/*
	editor.js
*/

var l = function () {
	
    $('.ui.sidebar').sidebar('attach events', '.launch.button');

    L.scenograph.director.init();

	console.log('[ Editor started ]');
};

window.l = l;

l.prototype._init = function() {
	window.l = new l();
	delete l._init;
}
