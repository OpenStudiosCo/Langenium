  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Library
	This defines behaviours for the object library menu and window in the editor
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var library = function() {
   
   return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

$(document).ready(function(){
	loadLibrary();
});

function loadLibrary() {
	
	var callback = function (result) {
		$('.header_menu .library menu.sub_menu ul.unstyled').append(result);
	};

	$.ajax({
		url: '/editor/library',
		success: callback
	});
}

library.prototype.addObject = function (name, type, url, scale) {
	
	var new_position = new THREE.Vector3(client.camera_position.x, client.camera_position.y, client.camera_position.z);

	new_position.x -= Math.sin(player.rotation.y) * 1000;
	new_position.z -= Math.cos(player.rotation.y) * 1000;

	if (controls.editor.enabled == true) {
		new_position.y -= 20000;
	}

	var instruction = {
		class: 'environment',
		instance_id: "master",
		scale: scale,
		url: url,
		position: {
			x: new_position.x,
			y: new_position.y,
			z: new_position.z,
			rY: player.rotation.y
		},
		type: {}
	};

	instruction.type[type] = name;

	objects.loadObject(instruction);

}