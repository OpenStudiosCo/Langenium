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
	this.camera_state = {
		rotating: false,
		turning: false,
		tilt_horizontal: 0,
		tilt_vertical: 0,
		reset_check: false,
		reset_position: {
			_x: function() {
				var update = function() { client.camera.position.x = this.x; };
				var complete = function() { delete controls.camera_state.reset_position.x; };
				controls.camera_state.reset_position.x = controls.camera_tween(client.camera.position.x, 0, update, complete);
			},
			_y: function() {
				var update = function() { client.camera.position.y = this.x; };
				var complete = function() { delete controls.camera_state.reset_position.y; };
				controls.camera_state.reset_position.y = controls.camera_tween(client.camera.position.y, 3, update, complete);
			},
			_z: function() {
				var update = function() { client.camera.position.z = this.x; };
				var complete = function() { delete controls.camera_state.reset_position.z; };
				controls.camera_state.reset_position.z = controls.camera_tween(client.camera.position.z, 35, update, complete);
			}
		},
		reset_rotation: {
			_x: function() {
				var update = function() { client.camera.rotation.x = this.x; };
				var complete = function() { delete controls.camera_state.reset_rotation.x; };
				controls.camera_state.reset_rotation.x = controls.camera_tween(client.camera.rotation.x, 0, update, complete);
			},
			_y: function() {
				var update = function() { client.camera.rotation.y = this.x; };
				var complete = function() { delete controls.camera_state.reset_rotation.y; };
				controls.camera_state.reset_rotation.y = controls.camera_tween(client.camera.rotation.y, 0, update, complete);
			},
			_z: function() {
				var update = function() { client.camera.rotation.z = this.x; };
				var complete = function() { delete controls.camera_state.reset_rotation.z; };
				controls.camera_state.reset_rotation.z = controls.camera_tween(client.camera.rotation.z, 0, update, complete);
			}
		}
	};
    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Event Binders
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

$(document).bind("mousedown", function(event) {
	if (controls.camera_state && 
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
				controls.camera_state.rotating = true;
				break;
		}
	}

});

$(document).bind("mouseup", function(event) {
	if (controls.camera_state && 
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
				if (controls.camera_state.reset_check == true) {
					controls.reset_property(client.camera.position.x, 0, controls.camera_state.reset_position._x);
					controls.reset_property(client.camera.position.y, 3, controls.camera_state.reset_position._y);
					controls.reset_property(client.camera.position.z, 35, controls.camera_state.reset_position._z);

					controls.reset_property(client.camera.rotation.x, 0, controls.camera_state.reset_rotation._x);
					controls.reset_property(client.camera.rotation.y, 0, controls.camera_state.reset_rotation._y);
					controls.reset_property(client.camera.rotation.z, 0, controls.camera_state.reset_rotation._z);
					controls.camera_state.reset_check = false;
				}
				else {
					controls.camera_state.reset_check = true;
				}
				controls.camera_state.rotating = false;
				
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

controls.prototype.reset_property = function(value, target, callback) {
	if (value != target) {
		callback();
	}
}

controls.prototype.camera_tween = function(property, target, update, complete) {
	return new TWEEN.Tween( {x: property, y: 0 })
		.to({x: target, y: 0}, 500)
		.onUpdate(update)
		.onComplete(complete)
		.start();
}

controls.prototype.rotateCamera = function (delta) {
		var rotateAngle = 0.01744444444444444444444444444444 * 2;
	
		var diffX = 2 * Math.PI * (controls.mouse.x - controls.mouse.lastX) ;
		var diffY = 20 * Math.PI * (controls.mouse.y - controls.mouse.lastY) ;

		if (diffX == 0) {
			controls.mouse.changeX = false;
		}
		else {
			controls.mouse.changeX = true;
			controls.camera_state.reset_check = false;
		}
		if (diffY == 0) {
			controls.mouse.changeY = false;
		}
		else {
			controls.mouse.changeY = true;
			controls.camera_state.reset_check = false;
		}

		//console.log('diffX: ' + diffX + ', diffY: ' + diffY);

		var x = diffX * 35 * Math.cos(delta * rotateAngle);
		client.camera.position.x += x;

		var z = diffX * 35 * Math.sin(delta * rotateAngle);
		client.camera.position.z += z;

		z = diffY * 3 * Math.sin(delta * rotateAngle);
		client.camera.position.z += z;

		var y = diffY * 3 * Math.cos(delta * rotateAngle);
		client.camera.position.y += y;
		
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
	if (controls.camera_state.enabled == true) {
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