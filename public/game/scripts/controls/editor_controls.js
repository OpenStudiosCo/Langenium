/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Editor controls
	This contains input handlers for sky-bird view and any other special editor cameras in the future
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var editor_controls = function() {
    
   	this.camera = new THREE.PerspectiveCamera( 45, (client.winW / client.winH), 1, M * 2 );
	this.camera.position.y = 5000;
	this.camera.rotation.x = -.85;
	this.enabled = false;
	
    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

$(document).bind("mousedown", function(event) {
	if (window.location.href.indexOf("editor") > 0 && controls.enabled == true) {
		var raycaster = new THREE.Raycaster( client.camera_position, controls.editor.cursor_position.sub( client.camera_position ).normalize() );	

		var intersects = raycaster.intersectObjects( engine.scene.children );

		if ( intersects.length > 0 ) {
			
			if (intersects[0].object.id == scenes.grid.id) {

				var other_face = intersects[ 0 ].faceIndex;

				if (other_face % 2 == 0) {
					other_face += 1;
				}
				else {
					other_face -= 1;
				}
				console.log(intersects[ 0 ].object.geometry.vertices[intersects[0].face.a])
				console.log(intersects[ 0 ].object.geometry.vertices[intersects[ 0 ].object.geometry.faces[other_face].a])
				var new_red = 0.8 * Math.random() + 0.2;
				intersects[ 0 ].face.color.setRGB( new_red , 0, 0 ); 
				intersects[ 0 ].object.geometry.faces[other_face].color.setRGB( new_red, 0, 0 ); 
				intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
			}
			else {
				editor.selected.new(
					intersects[0].object.id,
					intersects[0].object.name,
					intersects[0].object.position,
					intersects[0].object.scale.x
				);
				$('.object_properties select.object_list option').each(function(index, obj_item){
					var obj_item_id = $(obj_item).val();
					if (intersects[0].object.id == obj_item_id) {
						$(obj_item).attr('selected','selected');
						editor.object_properties.select();
					}
				});
			}
		}
	}
});

$(document).bind("mousemove", function(event) {
	if (window.location.href.indexOf("editor") > 0) {
		if (controls.enabled == true && controls.editor) {
			controls.editor.cursor_position = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
			projector.unprojectVector( controls.editor.cursor_position, client.camera );

			$('.cursor_info .x').html('x: ' + Math.round(controls.editor.cursor_position.x));
			$('.cursor_info .y').html('y: ' + Math.round(controls.editor.cursor_position.y));
			$('.cursor_info .z').html('z: ' + Math.round(controls.editor.cursor_position.z));
		}
	}
});

// these are not for flight control, they're keyboard inputs for the editor specifically
editor_controls.prototype.input = function (delta){
	if (keyboard.pressed("e")){
		console.log('esc pressed');
	}
}
editor_controls.prototype.toggleCamera = function() {

	if (controls.editor.enabled == true) {
		player.remove(controls.editor.camera);
		client.camera = controls.flight.camera;
		player.add(controls.flight.camera);
		controls.editor.enabled = false;
		controls.flight.enabled = true;
	}
	else {
		player.remove(controls.flight.camera);
		client.camera = controls.editor.camera;
		player.add(controls.editor.camera);
		controls.editor.enabled = true;
		controls.flight.enabled = false;

	}
	client.camera.updateProjectionMatrix();
}



