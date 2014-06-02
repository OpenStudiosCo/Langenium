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

	L.scenograph.director.gui.add(L.scenograph.director, "add_cube");
	L.scenograph.director.gui.add(L.scenograph.director, "add_cylinder");
	L.scenograph.director.gui.add(L.scenograph.director, "add_sphere");
	L.scenograph.director.gui.add(L.scenograph.director, "add_torus");
	L.scenograph.director.gui.add(L.scenograph.director, "add_plane");
	L.scenograph.director.gui.add(L.scenograph.director, "add_tetrahedron");
	L.scenograph.director.gui.add(L.scenograph.director, "add_octahedron");

	L.scenograph.director.scene_variables.select_multiple = false;
	L.scenograph.director.scene_variables.selected_objects = [];
	L.scenograph.director.scene_variables._selectedObj = ""; // holder for object chosen in multi select dropdown, this definitely needs to be put in a smarter place
	L.scenograph.director.gui.add(L.scenograph.director.scene_variables, "select_multiple");
	L.scenograph.director.animation_queue.push(new L.scenograph.director.select_object());
}

// Structuring like this so it slides into dat.gui nicely. Will probably need to come up with object "views" to plug into dat.gui....
L.scenograph.director.csg = {
	intersect: function() {
		var materials = [];
		L.scenograph.director.scene_variables.selected_objects.forEach(function(object){
			if (object.material instanceof THREE.MeshFaceMaterial) {
				
				object.material.materials.forEach(function(material, fm_index){
					materials.push(material);
					object.geometry.faces.forEach(function(face){
						if (face.materialIndex == fm_index) {
							face.newIndex = materials.length-1; // set it to the index of the array
						}
					});
				});
				// had to separate it as changing materialIndex was screwing the if statement and always setting everything to the last 
				object.geometry.faces.forEach(function(face){
					face.materialIndex = face.newIndex;					
				});
			}
			else {
				materials.push(object.material);
				object.geometry.faces.forEach(function(face){
					face.materialIndex = materials.length-1;
				});
			}
		});

		var objBSP = new ThreeBSP(L.scenograph.director.scene_variables.selected_objects[0]);
		for (var i = 1; i < L.scenograph.director.scene_variables.selected_objects.length; i++) {
			var thisBSP = new ThreeBSP(L.scenograph.director.scene_variables.selected_objects[i]);
			objBSP = objBSP.intersect(thisBSP);
		}
		var newGeo = objBSP.toGeometry();
		var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));

		for (var i = 0; i < L.scenograph.director.scene_variables.selected_objects.length; i++) {
			L.scenograph.director.scene.remove(L.scenograph.director.scene_variables.selected_objects[i]);
		}
		L.scenograph.director.clear_selection();
		L.scenograph.director.scene.add(newMesh);
	},
	subtract: function() {
		var materials = [];
		L.scenograph.director.scene_variables.selected_objects.forEach(function(object){
			if (object.material instanceof THREE.MeshFaceMaterial) {
				
				object.material.materials.forEach(function(material, fm_index){
					materials.push(material);
					object.geometry.faces.forEach(function(face){
						if (face.materialIndex == fm_index) {
							face.newIndex = materials.length-1; // set it to the index of the array
						}
					});
				});
				// had to separate it as changing materialIndex was screwing the if statement and always setting everything to the last 
				object.geometry.faces.forEach(function(face){
					face.materialIndex = face.newIndex;					
				});
			}
			else {
				materials.push(object.material);
				object.geometry.faces.forEach(function(face){
					face.materialIndex = materials.length-1;
				});
			}
		});

		var objBSP = new ThreeBSP(L.scenograph.director.scene_variables.selected_objects[0]);
		for (var i = 1; i < L.scenograph.director.scene_variables.selected_objects.length; i++) {
			var thisBSP = new ThreeBSP(L.scenograph.director.scene_variables.selected_objects[i]);
			objBSP = objBSP.subtract(thisBSP);
		}
		var newGeo = objBSP.toGeometry();
		var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));

		for (var i = 0; i < L.scenograph.director.scene_variables.selected_objects.length; i++) {
			L.scenograph.director.scene.remove(L.scenograph.director.scene_variables.selected_objects[i]);
		}
		L.scenograph.director.clear_selection();
		L.scenograph.director.scene.add(newMesh);
	},
	union: function() {
		var materials = [];
		L.scenograph.director.scene_variables.selected_objects.forEach(function(object){
			if (object.material instanceof THREE.MeshFaceMaterial) {
				
				object.material.materials.forEach(function(material, fm_index){
					materials.push(material);
					object.geometry.faces.forEach(function(face){
						if (face.materialIndex == fm_index) {
							face.newIndex = materials.length-1; // set it to the index of the array
						}
					});
				});
				// had to separate it as changing materialIndex was screwing the if statement and always setting everything to the last 
				object.geometry.faces.forEach(function(face){
					face.materialIndex = face.newIndex;					
				});
			}
			else {
				materials.push(object.material);
				object.geometry.faces.forEach(function(face){
					face.materialIndex = materials.length-1;
				});
			}
		});
		
		var objBSP = new ThreeBSP(L.scenograph.director.scene_variables.selected_objects[0]);
		
		for (var i = 1; i < L.scenograph.director.scene_variables.selected_objects.length; i++) {
			var thisBSP = new ThreeBSP(L.scenograph.director.scene_variables.selected_objects[i]);
			objBSP = objBSP.union(thisBSP);
		}
		
		var newGeo = objBSP.toGeometry();
		
			

		// Clean up the scene
		for (var i = 0; i < L.scenograph.director.scene_variables.selected_objects.length; i++) {
			L.scenograph.director.scene.remove(L.scenograph.director.scene_variables.selected_objects[i]);
		}
		
		var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));
		newMesh.position.set(0,-100,50)
		L.scenograph.director.clear_selection();
		L.scenograph.director.scene.add(newMesh);
	}
};
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

					var colorFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Colors");
					var material = L.scenograph.director.scene_variables.selected.material;
					
					if (material instanceof THREE.MeshFaceMaterial) {
						material.materials.forEach(function(mat){
							var control = {
								color: {
									r: mat.color.r * 256,
									g: mat.color.g * 256,
									b: mat.color.b * 256
								}
							}
							colorFolder.addColor(control, 'color').onChange(function (e) {
								if (typeof e == 'object' ) {								
									mat.color = new THREE.Color().setRGB(e.r / 256,e.g / 256,e.b / 256);
								}
								if (typeof e == 'string') {
									mat.color = new THREE.Color().setHex(e);	
								}
						    });
						});
					}
					else {
						var control = {
							color: {
								r: material.color.r * 256,
								g: material.color.g * 256,
								b: material.color.b * 256
							}
						}
						colorFolder.addColor(control, 'color').onChange(function (e) {
							if (typeof e == 'object' ) {								
								material.color = new THREE.Color().setRGB(e.r / 256,e.g / 256,e.b / 256);
							}
							if (typeof e == 'string') {
								material.color = new THREE.Color().setHex(e);	
							}
					    });
					}
					colorFolder.open();

					var posFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Position");
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "x").step(1);
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "y").step(1);
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "z").step(1);
					posFolder.open();

					var rotFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Rotation");
					rotFolder.add(L.scenograph.director.scene_variables.selected.rotation, "x").step(.01);
					rotFolder.add(L.scenograph.director.scene_variables.selected.rotation, "y").step(.01);
					rotFolder.add(L.scenograph.director.scene_variables.selected.rotation, "z").step(.01);
					rotFolder.open();

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
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.director.csg, "intersect");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.director.csg, "subtract");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.director.csg, "union");
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

L.scenograph.director.random_color = function(){
	return Math.random() * 0xffffff;
}

L.scenograph.director.add_cube = function() {
	var cube = new THREE.Mesh(new THREE.BoxGeometry(400, 400, 400), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(cube);
}

L.scenograph.director.add_cylinder = function() {
	var cylinder = new THREE.Mesh(new THREE.CylinderGeometry( 400, 400, 400, 40, 4 ), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(cylinder);
}

L.scenograph.director.add_sphere = function() {
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(200, 64, 32), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(sphere);
}

L.scenograph.director.add_torus = function() {
	var torus = new THREE.Mesh(new THREE.TorusGeometry( 400, 80, 80, 80 ), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(torus);
}

L.scenograph.director.add_plane = function() {
	var plane = new THREE.Mesh(new THREE.PlaneGeometry( 400, 400, 4, 4 ), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(plane);
}

L.scenograph.director.add_tetrahedron = function() {
	var tetrahedron = new THREE.Mesh(new THREE.TetrahedronGeometry( 400, 0 ), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(tetrahedron);
}
L.scenograph.director.add_octahedron = function() {
	var octahedron = new THREE.Mesh(new THREE.OctahedronGeometry( 400, 2 ), new THREE.MeshBasicMaterial({color: L.scenograph.director.random_color()}));
	this.scene.add(octahedron);
}


