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
		tilt_vertical: 0
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
				if (!controls.camera_state.reset_x &&
					!controls.camera_state.reset_y &&
					!controls.camera_state.reset_z) {
					controls.resetCamera();
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

controls.prototype.resetCamera = function() {

	if (controls.camera_state.rotating == false || controls.mouse.changeX == false) {
		if ((client.camera.rotation.x != 0 ||
			client.camera.position.x != 0 )) {
			controls.camera_state.reset_x = new TWEEN.Tween( {x: client.camera.rotation.x, y: client.camera.position.x })
				.to({x: 0, y: 0}, 500)
				.onUpdate(function(){
					if (controls.camera_state.rotating == false) {
						client.camera.position.x = this.y;
						
							client.camera.rotation.x = this.x;
						
					}
					else {
						delete controls.camera_state.reset_x;
					}

				})
				.onComplete(function(){
					delete controls.camera_state.reset_x;
				})
				.start();
		}
	}	
	

	if (controls.camera_state.rotating == false || controls.mouse.changeY == false) {
		if ((client.camera.position.y != 3 || 
			 client.camera.rotation.y != 0)) {
			controls.camera_state.reset_y = new TWEEN.Tween( {x: client.camera.position.y, y: client.camera.rotation.y })
				.to({x: 3, y: 0}, 500)
				.onUpdate(function(){
					if (controls.camera_state.rotating == false) {
						client.camera.position.y = this.x;
						
						client.camera.rotation.y = this.y;	
						
					}
					else {
						delete controls.camera_state.reset_y;
					}
					client.camera.updateMatrix();
				})
				.onComplete(function(){
					delete controls.camera_state.reset_y;
				})
				.start();
		}
				
	}

	if (controls.camera_state.rotating == false || 
		(controls.mouse.changeX == false && controls.mouse.changeY == false)) {
		if ((client.camera.position.z != 35 || 
			 client.camera.rotation.z != 0)) {
			controls.camera_state.reset_z = new TWEEN.Tween( {x: client.camera.position.y, y: client.camera.rotation.y })
				.to({x: 3, y: 0}, 500)
				.onUpdate(function(){
					if (controls.camera_state.rotating == false) {
						client.camera.position.y = this.x;
						//if (client.camera.position.x == 0) {
						client.camera.rotation.y = this.y;	
						
					}
					else {
						delete controls.camera_state.reset_z;
					}
					client.camera.updateMatrix();

				})
				.onComplete(function(){
					delete controls.camera_state.reset_z;
				})
				.start();
		}
				
	}


}

controls.prototype.rotateCamera = function (delta) {
		
	
		var diffX = (controls.mouse.x - controls.mouse.lastX) ;
		var diffY = (controls.mouse.y - controls.mouse.lastY) ;

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

		//console.log('diffX: ' + diffX + ', diffY: ' + diffY);

		var x = diffX * 350 * Math.cos(delta * Math.PI / 180);
		client.camera.position.x += x;

		var z = diffX * 350 * Math.sin(delta * Math.PI / 180);
		client.camera.position.z += z;

		z = diffY * 30 * Math.sin(delta * Math.PI / 180);
		client.camera.position.z += z;

		var y = diffY * 30 * Math.cos(delta * Math.PI / 180);
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