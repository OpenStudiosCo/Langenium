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
    	x_buffer: 0,
    	y_buffer: 0,
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
	
	
		var diffX = controls.mouse.x - controls.mouse.lastX;
		var diffY = controls.mouse.y - controls.mouse.lastY;

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

		diffX *= 2;
		diffY *= 12;

		console.log('diffX: ' + diffX + ', diffY: ' + diffY);

		var x = 35 * Math.cos(diffX * Math.PI / 180);
		client.camera.position.x += x * diffX;

		var z = 35 * Math.sin(diffX * Math.PI / 180);
		client.camera.position.z += z * diffX;

		z = 3 * Math.sin(diffY * Math.PI / 180);
		client.camera.position.z += z * diffY;

		var y = 3 * Math.cos(diffY * Math.PI / 180);
		client.camera.position.y += y * diffY;
		
		client.camera.lookAt(new THREE.Vector3(0,0,0));

		client.camera.updateMatrix();
		
}

controls.prototype.zoom = function (e) {

	e.preventDefault();
	e.stopPropagation();

	var delta = controls.extractWheelDelta(e);

	var new_fov;
	
	if (controls.character.enabled == true) {
		new_fov = client.camera.position.z - delta / 333.321312;
		if ((new_fov > 8 && new_fov < 12)||
			(new_fov > 4 && new_fov < 100) &&
			client.is_editor == true) {
			client.camera.position.y = new_fov / 2;
			client.camera.position.z = new_fov;

		}
	}
	if (controls.flight.enabled == true) {
		new_fov = client.camera.position.z - delta / 33.321312;
		if (new_fov > 15 && new_fov < 100) {
			client.camera.position.z = new_fov;
		}
	}
	if (controls.editor.enabled == true) {
		new_fov = client.camera.position.z - delta / 333.321312;
		if (new_fov > 35 && new_fov < 500) {
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