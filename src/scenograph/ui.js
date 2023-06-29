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

ui.prototype.new = function(details) {
	/*
		valid types:
		form, scenograph, menu, content, list, button
	*/

	this.['new_' + details.type](details);
	
}

ui.prototype.new_form = function(details){
	console.log("-\t Creating new form");
	console.log(details);
}

ui.prototype.new_scenograph = function(details){
	console.log("-\t Creating new scenograph");
	console.log(details);
}

ui.prototype.new_menu = function(details){
	console.log("-\t Creating new menu");
	console.log(details);
}

ui.prototype.new_content = function(details){
	console.log("-\t Creating new content");
	console.log(details);
}

ui.prototype.new_list = function(details){
	console.log("-\t Creating new list");
	console.log(details);
}

ui.prototype.new_button = function(details){
	console.log("-\t Creating new button");
	console.log(details);
}