/*
	Ui
*/

// This is a class for any objects within the Scenograph that are part of the DOM such as form elements, menus, content panels, etc.

var ui = function() {
	return this;
}

ui.prototype._init = function() {
	L.scenograph.ui = new ui();
}