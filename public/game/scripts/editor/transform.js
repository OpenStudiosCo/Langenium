  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Editor
	This class defines editor objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var transform = function() {
   this.mouseover = false;
   return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Events

$("#transform").live("mouseover",function(e){
	editor.transform.mouseover = true;
//	controls.enabled = false;
});
$("#transform").live("mouseout",function(e){
	editor.transform.mouseover = false;
//	controls.enabled = true;
});

// Helpers
transform.prototype.makeControls = function () {
	var html = { width: 500, alignX: "right", alignY: "bottom", data: "" };
	
	html.data += "<div class='controls'>";
	html.data += "<h3>Position</h3>";
	html.data += "<h4>X</h4><input type='text' class='position x textbox' value='0' /><span class='position x slider-control'>0</span>";
	html.data += "<h4>Y</h4><input type='text' class='position y textbox' value='0' /><span class='position y slider-control'>0</span>";
	html.data += "<h4>Z</h4><input type='text' class='position z textbox' value='0' /><span class='position z slider-control'>0</span>";
	html.data += "<h3>Rotation</h3>";
	html.data += "<h4>X</h4><input type='text' class='rotation x textbox' value='0' /><span class='rotation x slider-control'>0</span>";
	html.data += "<h4>Y</h4><input type='text' class='rotation y textbox' value='0' /><span class='rotation y slider-control'>0</span>";
	html.data += "<h4>Z</h4><input type='text' class='rotation z textbox' value='0' /><span class='rotation z slider-control'>0</span>";
	html.data += "<h3>Scale</h3>";
	html.data += "<input type='text' class='scale textbox' value='0' /><span class='scale slider-control'>0</span>";
	html.data += "</div>";
	
	return html;
};

transform.prototype.loadProperties = function(id) {
	// clears and populates the transform window
	var object, obj_index, scale = M / 2;
	for (var i in scene.__objects) {
		if (scene.__objects[i].id == id) {
			object = scene.__objects[i];
			obj_index = i;
		}
	};

	$("#transform .controls .position.x.textbox").val(object.position.x).change(function(){ scene.__objects[obj_index].position.x =  $("#transform .controls .position.x.textbox").val(); } );
	$("#transform .controls .position.y.textbox").val(object.position.y).change(function(){ scene.__objects[obj_index].position.y =  $("#transform .controls .position.y.textbox").val(); } );
	$("#transform .controls .position.z.textbox").val(object.position.z).change(function(){ scene.__objects[obj_index].position.z =  $("#transform .controls .position.z.textbox").val(); } );
	
	//$("#transform .controls .position.x.slider-control").slider( { value: object.position.x, min: object.position.x - scale, max: object.position.x + scale, slide: function( event, slider) {  scene.__objects[obj_index].position.x = slider.value; $("#transform .controls .position.x.textbox").val(slider.value); } } );
	//$("#transform .controls .position.y.slider-control").slider( { value: object.position.y, min: object.position.y - scale, max: object.position.y + scale, slide: function( event, slider) {  scene.__objects[obj_index].position.y = slider.value; $("#transform .controls .position.y.textbox").val(slider.value); } } );
	//$("#transform .controls .position.z.slider-control").slider( { value: object.position.z, min: object.position.z - scale, max: object.position.z + scale, slide: function( event, slider) {  scene.__objects[obj_index].position.z = slider.value; $("#transform .controls .position.z.textbox").val(slider.value); } } );
	
	$("#transform .controls .rotation.x.textbox").val(object.rotation.x).change(function(){ scene.__objects[obj_index].rotation.x =  $("#transform .controls .rotation.x.textbox").val(); } );
	$("#transform .controls .rotation.y.textbox").val(object.rotation.y).change(function(){ scene.__objects[obj_index].rotation.y =  $("#transform .controls .rotation.y.textbox").val(); } );
	$("#transform .controls .rotation.z.textbox").val(object.rotation.z).change(function(){ scene.__objects[obj_index].rotation.z =  $("#transform .controls .rotation.z.textbox").val(); } );
	
	//$("#transform .controls .rotation.x.slider-control").slider( { value: object.rotation.x, step: .1, min: object.rotation.x - scale, max: object.rotation.x + scale, slide: function( event, slider) {  scene.__objects[obj_index].rotation.x = slider.value; $("#transform .controls .rotation.x.textbox").val(slider.value); } } );
	//$("#transform .controls .rotation.y.slider-control").slider( { value: object.rotation.y, step: .1, min: object.rotation.y - scale, max: object.rotation.y + scale, slide: function( event, slider) {  scene.__objects[obj_index].rotation.y = slider.value; $("#transform .controls .rotation.y.textbox").val(slider.value); } } );
	//$("#transform .controls .rotation.z.slider-control").slider( { value: object.rotation.z, step: .1, min: object.rotation.z - scale, max: object.rotation.z + scale, slide: function( event, slider) {  scene.__objects[obj_index].rotation.z = slider.value; $("#transform .controls .rotation.z.textbox").val(slider.value); } } );
	
	$("#transform .controls .scale.textbox").val(object.scale.x).change(function(){ 
			scene.__objects[obj_index].scale.x = $("#transform .controls .scale.textbox").val();
			scene.__objects[obj_index].scale.y = $("#transform .controls .scale.textbox").val();
			scene.__objects[obj_index].scale.z = $("#transform .controls .scale.textbox").val();
	} );
	
	/*$("#transform .controls .scale.slider-control").slider( { value: object.scale.x, min: object.scale.x - scale, max: object.scale.x + scale, slide: function( event, slider) {  
		scene.__objects[obj_index].scale.x = slider.value; scene.__objects[obj_index].scale.y = slider.value; scene.__objects[obj_index].scale.z = slider.value; 
		$("#transform .controls .scale.textbox").val(slider.value);
	} } );*/
};

transform.prototype.render = function() {
	// need to update this to scale
	var scale = M / 2;
	/*
	$( "#transform  .position.slider-control" ).each(function() {
		 var value = parseInt( $( this ).text(), 10 );
		 $( this ).empty().slider({
			value: value,
			min: value - scale,
			max: value + scale,
			animate: true
		});
	});
	$( "#transform  .rotation.slider-control" ).each(function() {
		 var value = parseInt( $( this ).text(), 10 );
		 $( this ).empty().slider({
			value: value,
			min: -5,
			max: 5,
			animate: true
		});
	});
	$( "#transform  .scale.slider-control" ).each(function() {
		 var value = parseInt( $( this ).text(), 10 );
		 $( this ).empty().slider({
			value: value,
			min: 0,
			max: 10000,
			animate: true
		});
	});
  */
};