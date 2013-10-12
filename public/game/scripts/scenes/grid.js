/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Grid
	This contains the classes that manage scene grids
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var grid = function() {

	return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

grid.prototype.create = function() {
	// This might become useful later
	/*
		var size = 1000; // creates 1000 cells by default
		var regions = {
			NW: { x: -1, y: 1 },
			NE: { x: 1, y: 1},
			SW: { x: -1, y: -1},
			SE: { x: 1, y: -1} 
		};

		for (var i = 0; i <= size; i++) {
			console.log("i:" + i);
			for (var r in regions){
				console.log("r:"+r);
				console.log(regions[r].x * i * 100)
				console.log(regions[r].y * i * 100)
			}
		}
	*/
	var grid_geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
	var grid_material = new THREE.MeshBasicMaterial({ color: 0x333333, vertexColors: THREE.FaceColors});
		
	grid_geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	scenes.grid.object = new THREE.Mesh(grid_geometry.clone(), grid_material);
	scenes.grid.object.position.y = -3;
	engine.scene.add(scenes.grid.object);
}

grid.prototype.select_cell = function() {
	var raycaster = new THREE.Raycaster( client.camera_position, controls.editor.cursor_position.sub( client.camera_position ).normalize() );	

	var intersects = raycaster.intersectObjects( engine.scene.children );

	if ( intersects.length > 0 ) {
		if (intersects[0].object.id == scenes.grid.object.id) {
			scenes.grid.clear_selection();
			var other_face = intersects[ 0 ].faceIndex;

			if (other_face % 2 == 0) {
				other_face += 1;
			}
			else {
				other_face -= 1;
			}

			var new_red = 0.8 * Math.random() + 0.2;
			intersects[ 0 ].face.color.setRGB( new_red , 0, 0 ); 
			intersects[ 0 ].object.geometry.faces[other_face].color.setRGB( new_red, 0, 0 ); 
			intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
		}
	};
}

grid.prototype.clear_selection = function() {
	scenes.grid.object.geometry.faces.forEach(function(face){
		face.color.setRGB(1,1,1);
	});
	scenes.grid.object.geometry.colorsNeedUpdate = true;
}