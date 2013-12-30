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
    	camera_distance: 35,
    	theta: 0, 
    	phi: 3, 
    	onClickTheta: 0, 
    	onClickPhi: 0,
    	onClickX: 0,
    	onClickY: 0,
    	x: 0,
    	y: 0,
    	lastX: 0,
    	lastY: 0
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
				controls.mouse.onClickTheta = controls.mouse.theta;
				controls.mouse.onClickPhi = controls.mouse.phi;
				controls.mouse.onClickX = controls.mouse.x;
				controls.mouse.onClickY = controls.mouse.y;
				controls.camera_state.rotating = true;

				controls.mouse.reset_timer = setTimeout(function(){
					if (controls.camera_state.rotating == true) {
						// Disable camera reset if the camera is rotating again, otherwise the camera will snap back on mouseUp
						controls.camera_state.reset_check = false;
					}
					delete controls.mouse.reset_timer;
				}, 100);

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
				controls.mouse.onClickX = event.clientX - controls.mouse.onClickX;
				controls.mouse.onClickY = event.clientX - controls.mouse.onClickY;
				if (controls.camera_state.reset_check == true) {
					controls.reset_property(client.camera.position.x, 0, controls.camera_state.reset_position._x);
					controls.reset_property(client.camera.position.y, 3, controls.camera_state.reset_position._y);
					controls.reset_property(client.camera.position.z, controls.mouse.camera_distance, controls.camera_state.reset_position._z);

					controls.reset_property(client.camera.rotation.x, 0, controls.camera_state.reset_rotation._x);
					controls.reset_property(client.camera.rotation.y, 0, controls.camera_state.reset_rotation._y);
					controls.reset_property(client.camera.rotation.z, 0, controls.camera_state.reset_rotation._z);

					// Set everything back to default
					controls.mouse.camera_distance = 35;
					controls.mouse.theta = 0;
					controls.mouse.phi = 3;
					controls.mouse.onClickTheta = 0;
					controls.mouse.onClickPhi = 0;
					controls.mouse.x = 0;
					controls.mouse.y = 0;
					controls.mouse.lastX = 0;
					controls.mouse.lastY = 0;
					controls.mouse.onClickX = 0;
					controls.mouse.onClickY = 0;
					controls.camera_state.reset_check = false;
				}
				else {
					if (client.camera.position.x != 0 ||
						client.camera.position.y != 0 ||
						client.camera.position.z != 0 ||
						client.camera.rotation.x != 0 ||
						client.camera.rotation.y != 0 ||
						client.camera.rotation.z != 0) {
						controls.camera_state.reset_check = true;
					}
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
		controls.mouse.x = event.clientX;
	
		controls.mouse.lastY = controls.mouse.y;	
		controls.mouse.y = event.clientY;	

		if (controls.camera_state.rotating == true) {
			controls.mouse.theta = - ( ( controls.mouse.x - controls.mouse.onClickX ) * 0.5 ) + controls.mouse.onClickTheta;
			controls.mouse.phi = ( ( controls.mouse.y - controls.mouse.onClickY ) * 0.5 ) + controls.mouse.onClickPhi;
			controls.mouse.phi = Math.min( 180, Math.max( -180, controls.mouse.phi ) );
		}
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


controls.prototype.rotateCamera = function(delta) {
	client.camera.position.x = controls.mouse.camera_distance * Math.sin( controls.mouse.theta * Math.PI / 360 ) * Math.cos( controls.mouse.phi * Math.PI / 360 );
	client.camera.position.y = controls.mouse.camera_distance * Math.sin( controls.mouse.phi * Math.PI / 360 ) ;
	client.camera.position.z = controls.mouse.camera_distance * Math.cos( controls.mouse.theta * Math.PI / 360 ) * Math.cos( controls.mouse.phi * Math.PI / 360 );
	client.camera.lookAt(new THREE.Vector3(0,0,0))
	client.camera.updateMatrix();
}


controls.prototype.zoom = function (event) {
	event.preventDefault();

	var wheel_delta = controls.extractWheelDelta(event) * clock.getDelta() * 4;

	if (controls.mouse.camera_distance - wheel_delta > 1) {
		controls.mouse.camera_distance -= wheel_delta;

		client.camera.position.x = controls.mouse.camera_distance * Math.sin( controls.mouse.theta * Math.PI / 360 ) * Math.cos( controls.mouse.phi * Math.PI / 360 );
		client.camera.position.y = controls.mouse.camera_distance * Math.sin( controls.mouse.phi * Math.PI / 360 ) ;
		client.camera.position.z = controls.mouse.camera_distance * Math.cos( controls.mouse.theta * Math.PI / 360 ) * Math.cos( controls.mouse.phi * Math.PI / 360 );
		client.camera.lookAt(new THREE.Vector3(0,0,0))
		client.camera.updateMatrix();
	}
}

controls.prototype.extractWheelDelta = function (e)
{
    if (e.wheelDelta)   return e.wheelDelta;
    if (e.detail)       return e.detail * -40;
    if (e.originalEvent && e.originalEvent.wheelDelta)
                    return e.originalEvent.wheelDelta;
}
