/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Controls
	This contains handlers for keyboard and mouse input
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var controls = function() {
    this.enabled = false;
	this.flight = new flight();
	this.character = new character();
	this.editor = new editor_controls();
    this.clientX = 0;
	this.clientY = 0;
	this.camera_rotating = false;

    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Event Binders
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

$(document).bind("mousedown", function(event) {
	if (controls.flight && 
		controls.enabled == true)
	{
		switch (event.which) {
			case 1:
				// fire IGNORE
				break;
			case 2:
				// zoom IGNORE
				break;
			case 3:
				controls.camera_rotating = true;
				break;
		}
	}

});

$(document).bind("mouseup", function(event) {
	if (controls.flight && 
		controls.enabled == true)
	{
		switch (event.which) {
			case 1:
				// fire IGNORE
				break;
			case 2:
				// zoom IGNORE
				break;
			case 3:
				controls.camera_rotating = false;
				break;
		}
	}
});

$(document).bind('mousewheel DOMMouseScroll', function (e)
{
	controls.zoom(e);
});
$(document).bind("mousemove", function(event) {
	if (controls.enabled == true) 
	{	
		controls.clientX = event.clientX;
		controls.clientY = event.clientY;	
	}
});
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

controls.prototype.rotateCamera = function (delta) {
	
	if (controls.flight.enabled == true) {
		var radius = 100;
		var theta = - ( ( userMouse.position.x - userMouse.down.position.x ) * userMouse.acceleration ) +  userMouse.down.theta;
   		var	phi = ( ( userMouse.position.y - userMouse.down.position.y ) * userMouse.acceleration ) + userMouse.down.phi;
    	phi = Math.min( 160, Math.max( 20, phi ) );
		
		camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
		camera.position.y = radius * Math.sin( phi * Math.PI / 360 );
		camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
		camera.lookAt(userCam.target);
		camera.updateMatrix(); 
		controls.flight.camera.position.x = Math.floor(Math.cos( controls.clientX ));         
		controls.flight.camera.position.z = 35 +  Math.floor(Math.sin( controls.clientY ));
		controls.flight.camera.lookAt( player.position );
	}

}
controls.prototype.zoom = function (e) {

	e.preventDefault();
	e.stopPropagation();

	var delta = controls.extractWheelDelta(e);

	var new_fov = client.camera.fov - delta / 11.321312;
	
	if (new_fov > 18 && new_fov < 100) {
		client.camera.fov = new_fov;
	}

  	client.camera.updateProjectionMatrix();
}

controls.prototype.extractWheelDelta = function (e)
{
    if (e.wheelDelta)   return e.wheelDelta;
    if (e.detail)       return e.detail * -40;
    if (e.originalEvent && e.originalEvent.wheelDelta)
                    return e.originalEvent.wheelDelta;
}