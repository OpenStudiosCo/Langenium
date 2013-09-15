  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Editor
	This class defines editor objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Initialize editor
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var editor = function() {
	this.toolbars = new toolbars();
	this.object_library = new object_library();
	this.object_properties = new object_properties();
	this.texture_editor = new texture_editor();
	this.selected = new selected();
	return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Helper Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Events

$("header *, footer *").live("mouseenter",function(e){
	controls.enabled = false;
});
$("header *, footer *").live("mouseover",function(e){
	controls.enabled = false;
});
$("header *, footer *").live("mouseout",function(e){
	controls.enabled = true;
});

$('a.make_window').live("click", function(e){
	$(this).parent().parent().css('left', (e.clientX - $('.moving').width() + 40 ) + 'px');
	$(this).parent().parent().addClass('window');
	$(this).parent().removeClass('sub_menu');

	$(this).parent().siblings('a').addClass('move');

	// Change this into a close button
	$(this).html('');
	$(this).attr('title','Close');
	$(this).prepend('<i class="icon-remove" />');
	$(this).addClass('close_window');
	$(this).removeClass('make_window');

});

$('a.close_window').live("click", function(e){
	$(this).parent().fadeToggle();
	$(this).parent().parent().css('left','');
	$(this).parent().parent().css('top','');
	$(this).parent().parent().removeClass('window');
	$(this).parent().addClass('sub_menu');

	// Add move button
	$(this).parent().children('.move').remove();

	// Change this into a close button
	$(this).html('');
	$(this).attr('title','Make window');
	$(this).prepend('<i class="icon-external-link" />');
	$(this).removeClass('close_window');
	$(this).addClass('make_window');
});

$('.window a.move').live("mousedown", function(e){
	$(this).parent().addClass('moving')
	window.addEventListener('mousemove', editor.mouseMove, true);
	window.addEventListener('mouseup', editor.mouseUp, false);

});

editor.prototype.mouseUp = function(e) {
	$('.moving').removeClass('moving');
	window.removeEventListener('mouseup', editor.mouseUp, false);
	window.removeEventListener('mousemove', editor.mouseMove, true);
};

editor.prototype.mouseMove = function (e) {
	$('.moving').css('top', e.clientY + 'px');
	$('.moving').css('left', e.clientX + 'px');
};