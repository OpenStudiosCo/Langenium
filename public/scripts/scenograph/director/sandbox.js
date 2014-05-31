L.scenograph.director.sandbox = function() {
	this.camera_state.zoom = 3500;

	L.scenograph.director.camera.position.set(
		0, 
		1000,
		L.scenograph.director.camera_state.zoom
	);	

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, 100, 0 );
	this.scene.add(hemiLight);

	L.scenograph.director.scene_variables.objects = [];

	var wallMaterial = new THREE.MeshPhongMaterial( { color: 0xCCCCCC, side: THREE.BackSide} ); 
	var floorMaterial = new THREE.MeshPhongMaterial( { color: 0x006666, side: THREE.BackSide} ); 
	var materials = [wallMaterial, floorMaterial];

	// radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
	var roomGeo = new THREE.CylinderGeometry( 500, 500, 450, 20, 4 );
	
	var room1 = new THREE.Mesh(roomGeo, new THREE.MeshNormalMaterial());
	room1.position.set(0, 75, 0);
	var room1BSP = new ThreeBSP( room1 );

	// Connect Room 1 to Room 3
	
	var corridor = new THREE.Mesh(new THREE.BoxGeometry(500, 300, 500), new THREE.MeshNormalMaterial());
	corridor.position.set(0, 0, -600)
	var corridorBSP = new ThreeBSP( corridor );

	var newBSP = room1BSP.union( corridorBSP );
	var newGeo = newBSP.toGeometry();

	for ( var i = 0; i < newGeo.faces.length; i++ ) 
	{
		if  (newGeo.vertices[newGeo.faces[ i ].c].y > -225) {
			newGeo.faces[ i ].materialIndex = 0;
		}
		else {
			newGeo.faces[ i ].materialIndex = 1;
		}

	}

	// Commented this out for now, using simple objects with texture overrides. 
	// Will eventually use more complex individual buffer geometries
	//var bufferGeo = THREE.BufferGeometryUtils.fromGeometry( newGeo );
	var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));
	newMesh.position.y = 75;
	L.scenograph.director.scene_variables.objects.push(newMesh);
	L.scenograph.director.scene.add(L.scenograph.director.scene_variables.objects[L.scenograph.director.scene_variables.objects.length-1]);
	
	L.scenograph.director.gui.add(L.scenograph.director, "add_cube");

}

L.scenograph.director.add_cube = function() {
	var cube = new THREE.Mesh(new THREE.BoxGeometry(400, 400, 400), new THREE.MeshNormalMaterial());
	this.scene.add(cube);
}

