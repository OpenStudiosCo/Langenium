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

	L.scenograph.director.scene_variables.select_multiple = true;
	L.scenograph.director.scene_variables.selected_objects = [];
	L.scenograph.director.scene_variables._selectedObj = ""; // holder for object chosen in multi select dropdown, this definitely needs to be put in a smarter place
	L.scenograph.director.gui.add(L.scenograph.director.scene_variables, "select_multiple");

	L.scenograph.director.animation_queue.push(new L.scenograph.director.select_object());
}

L.scenograph.director.select_object = function() {
	this.animate = function(delta) {
		if (L.scenograph.director.cursor.leftClick == true) {
			L.scenograph.director.projector.unprojectVector(L.scenograph.director.cursor.position, L.scenograph.director.camera);
			var raycaster = new THREE.Raycaster( L.scenograph.director.camera.position, L.scenograph.director.cursor.position.sub( L.scenograph.director.camera.position ).normalize() );	

			var intersects = raycaster.intersectObjects( L.scenograph.director.scene.children );
			if (intersects.length > 0) {
				if (L.scenograph.director.scene_variables.select_multiple == false) {
					L.scenograph.director.clear_selection();
					L.scenograph.director.scene_variables.selected = intersects[0].object;
					intersects[0].object.geometry.computeBoundingBox();
					L.scenograph.director.draw_bounding_box(0xFFFF00, intersects[0].object, intersects[0].object.geometry.boundingBox.max, intersects[0].object.geometry.boundingBox.min, intersects[0].object.scale.x );
					L.scenograph.director.scene_variables.selectedFolder = L.scenograph.director.gui.addFolder("Selected Object");
					L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.director, "clear_selection");
					L.scenograph.director.scene_variables.selectedFolder.open();					

					var posFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Position");
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "x").step(1);
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "y").step(1);
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "z").step(1);
					posFolder.open();

					var sclFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Scale");
					sclFolder.add(L.scenograph.director.scene_variables.selected.scale, "x").step(.01);
					sclFolder.add(L.scenograph.director.scene_variables.selected.scale, "y").step(.01);
					sclFolder.add(L.scenograph.director.scene_variables.selected.scale, "z").step(.01);
					sclFolder.open();

					var vector = intersects[0].object.position.clone();
					L.scenograph.director.scene_variables.target = intersects[0].object;
					L.scenograph.director.controls.target.set(
						vector.x,
						vector.y,
						vector.z
					);
				}
				else {
					if (L.scenograph.director.gui.__folders["Selected Object"]) {
						L.scenograph.director.gui.removeFolder("Selected Object");
						L.scenograph.director.clear_selection();
					}
					if (!L.scenograph.director.gui.__folders["Selected Objects"]) {
						L.scenograph.director.scene_variables.selectedFolder = L.scenograph.director.gui.addFolder("Selected Objects");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.director, "clear_selection");
						L.scenograph.director.scene_variables.selectedFolder.open();	
					}
					// Make sure we're not dealing with something that's already selected
					var addToSelection = true;
					intersects[0].object.children.forEach(function(child_obj){
						if (child_obj.name == "bounding_box") {
							addToSelection = false;
						}
					});
					if (addToSelection == true) {
						intersects[0].object.geometry.computeBoundingBox();
						var randomColor = Math.random() * 0xffffff;
						L.scenograph.director.draw_bounding_box( randomColor, intersects[0].object, intersects[0].object.geometry.boundingBox.max, intersects[0].object.geometry.boundingBox.min, intersects[0].object.scale.x );
						L.scenograph.director.scene_variables.selected_objects.push(intersects[0].object);
						$(L.scenograph.director.scene_variables.selectedFolder.domElement).append(
							"<li style='background-color: #" + parseInt(randomColor).toString(16) + ";'></li>"
						);
					}
				}
			}
		}
	}
	return this;
}

L.scenograph.director.clear_selection = function() {
	for (var i = 0; i < L.scenograph.director.scene.children.length; i++) {
		console.log(L.scenograph.director.scene.children[i])
		if (L.scenograph.director.scene.children[i].material) {
			if (L.scenograph.director.scene.children[i].material.materials) {
		    	L.scenograph.director.scene.children[i].material.materials.forEach(function(material){
		    		material.transparent = false;
		    		material.opacity = 1.0;
		    	});
		    }
		    else {
		    	L.scenograph.director.scene.children[i].material.transparent = false;
		    	L.scenograph.director.scene.children[i].material.opacity = 1.0;
		    }
		}
		var obj_to_remove = [];
		for (var j = 0; j < L.scenograph.director.scene.children[i].children.length; j++) {			
			if (L.scenograph.director.scene.children[i].children[j].name == "bounding_box") {
				obj_to_remove.push(L.scenograph.director.scene.children[i].children[j])
				//L.scenograph.director.scene.children[i].remove(L.scenograph.director.scene.children[i].children[j]);
			}
		}
		for (var k = 0; k < obj_to_remove.length; k++) {
			L.scenograph.director.scene.children[i].remove(obj_to_remove[k]);
		}
	}

	L.scenograph.director.scene_variables.selected_objects = []; // clears the selected object group
	L.scenograph.director.scene_variables.selected = undefined;
	
	if (L.scenograph.director.gui.__folders["Selected Object"]) {
		L.scenograph.director.gui.removeFolder("Selected Object");
	}
	if (L.scenograph.director.gui.__folders["Selected Objects"]) {
		L.scenograph.director.gui.removeFolder("Selected Objects");
	}
}

L.scenograph.director.draw_bounding_box = function(color, object, max, min, scale) {

	var material = new THREE.LineBasicMaterial({
        color: color
    });

    var geometry = new THREE.Geometry();
    // Bottom square
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z));

    var bounding_box = new THREE.Line(geometry, material);
    bounding_box.name = "bounding_box";
    
    if (object.material.materials) {
    	object.material.materials.forEach(function(material){
    		material.transparent = true;
    		material.opacity = 0.7;
    	});
    }
    else {
    	object.material.transparent = true;
    	object.material.opacity = 0.7;
    }
    object.add(bounding_box);
};
L.scenograph.director.add_cube = function() {
	var cube = new THREE.Mesh(new THREE.BoxGeometry(400, 400, 400), new THREE.MeshNormalMaterial());
	this.scene.add(cube);
}

