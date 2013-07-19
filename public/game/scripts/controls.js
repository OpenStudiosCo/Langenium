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
    this.mouse = {
    	x: 0,
    	y: 0,
    	lastX: 0,
    	lastY: 0,
    	changeX: false,
    	changeY: false
    };
	this.radius = ( client.winW + client.winH ) / 4;
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

$(document).bind('mousewheel DOMMouseScroll', function (e) {
	controls.zoom(e);
});

$(document).bind("mousemove", function(event) {
	if (controls.enabled == true) {
		controls.mouse.lastX = controls.mouse.x;
		controls.mouse.x = event.clientX / client.winW;
	
		controls.mouse.lastY = controls.mouse.y;	
		controls.mouse.y = event.clientY / client.winH;	
		
	}
});

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

controls.prototype.rotateCamera = function (delta) {
	
	
		var diffX = (controls.mouse.x - controls.mouse.lastX) / 2;
		var diffY = (controls.mouse.y - controls.mouse.lastY) / 2;

		if (diffX == 0) {
			controls.mouse.changeX = false;
		}
		else {
			controls.mouse.changeX = true;
		}
		if (diffY == 0) {
			controls.mouse.changeY = false;
		}
		else {
			controls.mouse.changeY = true;
		}
		
		client.camera.rotation.y -= controls.radius * Math.sin(diffX * Math.PI / 360 );
		client.camera.rotation.x -= controls.radius * Math.sin(diffY * Math.PI / 360 );
		client.camera.updateMatrix();
		//console.log('diffX: ' + diffX + ', diffY: ' + diffY);
		
	

}
controls.prototype.zoom = function (e) {

	e.preventDefault();
	e.stopPropagation();

	var delta = controls.extractWheelDelta(e);

	var new_fov = client.camera.position.z - delta / 21.321312;
	
	if (controls.character.enabled == true) {
		if (new_fov > 11 && new_fov < 25) {
			client.camera.position.z = new_fov;
		}
	}
	if (controls.flight.enabled == true) {
		if (new_fov > 15 && new_fov < 100) {
			client.camera.position.z = new_fov;
		}
	}
	if (controls.editor.enabled == true) {
		if (new_fov > 5 && new_fov < 500) {
			client.camera.position.z = new_fov;
		}
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