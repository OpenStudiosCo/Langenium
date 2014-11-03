/*
	Sandbox (separating editor functions from the scene thingy)
*/

var sandbox = function() {
	L.scenograph.camera_state.zoom = 3500;
	L.scenograph.camera.position.set(
		0, 
		1000,
		L.scenograph.camera_state.zoom
	);	

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, 100, 0 );
	L.scenograph.scene.add(hemiLight);

	L.scenograph.scene_variables.objects = [];


	L.scenograph.scene_variables.collidables = [];

	L.scenograph.scene_variables.select_multiple = false;
	L.scenograph.scene_variables.selected_objects = [];
	L.scenograph.scene_variables._selectedObj = ""; // holder for object chosen in multi select dropdown, this definitely needs to be put in a smarter place
	
	console.log("WTF - Sandbox is pointless atm :P")
	L.scenograph.animation_queue.push(new L.scenograph.editor.select_object());

	return this;
}

sandbox.prototype._init = function() {
	L.director.sandbox = new sandbox();
}
