L.scenograph.editor = function() {

		L.scenograph.director.camera_state.zoom = 3500;

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
	L.scenograph.director.scene.add(hemiLight);

	L.scenograph.director.scene_variables.objects = [];


	L.scenograph.director.scene_variables.collidables = [];

	for (var folder in L.scenograph.editor.gui_folders) {
		var newFolder = L.scenograph.director.gui.addFolder(folder);
		for (var element in L.scenograph.editor.gui_folders[folder]) {
			newFolder.add(L.scenograph.editor.gui_folders[folder], element)
			newFolder.open();
		};
	}

	L.scenograph.director.scene_variables.select_multiple = false;
	L.scenograph.director.scene_variables.selected_objects = [];
	L.scenograph.director.scene_variables._selectedObj = ""; // holder for object chosen in multi select dropdown, this definitely needs to be put in a smarter place
	L.scenograph.director.gui.add(L.scenograph.director.scene_variables, "select_multiple");
	L.scenograph.director.animation_queue.push(new L.scenograph.editor.select_object());
}

// Structuring like this so it slides into dat.gui nicely. Will probably need to come up with object "views" to plug into dat.gui....
L.scenograph.editor.csg = {
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
		L.scenograph.editor.clear_selection();
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
		L.scenograph.editor.clear_selection();
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
		L.scenograph.editor.clear_selection();
		L.scenograph.director.scene.add(newMesh);
	}
};

L.scenograph.editor.select_object = function() {
	this.animate = function(delta) {
		if (L.scenograph.director.cursor.leftClick == true) {
			L.scenograph.director.projector.unprojectVector(L.scenograph.director.cursor.position, L.scenograph.director.camera);
			var raycaster = new THREE.Raycaster( L.scenograph.director.camera.position, L.scenograph.director.cursor.position.sub( L.scenograph.director.camera.position ).normalize() );	

			var intersects = raycaster.intersectObjects( L.scenograph.director.scene.children );
			if (intersects.length > 0) {
				if (L.scenograph.director.scene_variables.select_multiple == false) {
					L.scenograph.editor.clear_selection();
					L.scenograph.director.scene_variables.selected = intersects[0].object;
					intersects[0].object.geometry.computeBoundingBox();
					L.scenograph.editor.draw_bounding_box(0xFFFF00, intersects[0].object, intersects[0].object.geometry.boundingBox.max, intersects[0].object.geometry.boundingBox.min, intersects[0].object.scale.x );
					L.scenograph.director.scene_variables.selectedFolder = L.scenograph.director.gui.addFolder("Selected Object");
					L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.editor, "clear_selection");
					L.scenograph.director.scene_variables.selectedFolder.open();					

					var material = L.scenograph.director.scene_variables.selected.material;

					
					if (material instanceof THREE.MeshFaceMaterial) {
						var materialsFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Materials");
						material.materials.forEach(function(mat, mi){
							var materialFolder = materialsFolder.addFolder("#" + mi)
							var control = {
								color: {
									r: mat.color.r * 256,
									g: mat.color.g * 256,
									b: mat.color.b * 256
								},
								side: [ 'FrontSide', 'BackSide', 'DoubleSide' ][mat.side],
								opacity: mat.prev_opacity
							}
							materialFolder.add(control, 'side', [ 'FrontSide', 'BackSide', 'DoubleSide' ]).onChange(function(e){
								mat.side = THREE[e];
							});
							materialFolder.add(mat, 'wireframe');
							materialFolder.add(control, 'opacity').onChange(function(e){
								mat.prev_opacity = e;
								mat.opacity = e;
							});
							materialFolder.addColor(control, 'color').onChange(function (e) {
								if (typeof e == 'object' ) {								
									mat.color = new THREE.Color().setRGB(e.r / 256,e.g / 256,e.b / 256);
								}
								if (typeof e == 'string') {
									mat.color = new THREE.Color().setHex(e);	
								}
						    });
						    materialFolder.open();
						});
						materialsFolder.open();
					}
					else {
						var materialFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Material");
						var control = {
							color: {
								r: material.color.r * 256,
								g: material.color.g * 256,
								b: material.color.b * 256
							},
							side: [ 'FrontSide', 'BackSide', 'DoubleSide' ][material.side],
							opacity: material.prev_opacity
						}
						materialFolder.add(control, 'side', [ 'FrontSide', 'BackSide', 'DoubleSide' ]).onChange(function(e){
							material.side = THREE[e];
						});
						materialFolder.add(material, 'wireframe');
						materialFolder.add(control, 'opacity').onChange(function(e){
							material.prev_opacity = e;
							material.opacity = e;
						});

						materialFolder.addColor(control, 'color').onChange(function (e) {
							if (typeof e == 'object' ) {								
								material.color = new THREE.Color().setRGB(e.r / 256,e.g / 256,e.b / 256);
							}
							if (typeof e == 'string') {
								material.color = new THREE.Color().setHex(e);	
							}
					    });					    
					    materialFolder.open();
					}
					

					var posFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Position");
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "x").step(1);
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "y").step(1);
					posFolder.add(L.scenograph.director.scene_variables.selected.position, "z").step(1);
					posFolder.open();

					var rot_step = Math.round(Math.PI / 12);
					var rotFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Rotation");
					rotFolder.add(L.scenograph.director.scene_variables.selected.rotation, "x").step(rot_step);
					rotFolder.add(L.scenograph.director.scene_variables.selected.rotation, "y").step(rot_step);
					rotFolder.add(L.scenograph.director.scene_variables.selected.rotation, "z").step(rot_step);
					rotFolder.open();


					var sclFolder = L.scenograph.director.scene_variables.selectedFolder.addFolder("Scale");
					
					var scl_control = {
						lock_aspect: false
					};

					var scl_update = function(dim, delta) {
						if (scl_control.lock_aspect == true) {
							L.scenograph.director.scene_variables.selected.scale.set(delta,delta,delta)
						}
						else {
							L.scenograph.director.scene_variables.selected.scale[dim] = delta;
						}
					}
					
					sclFolder.add(scl_control, "lock_aspect");
					sclFolder.add(L.scenograph.director.scene_variables.selected.scale, "x").step(.01).onChange(function(e){
						scl_update('x', e);
					});
					sclFolder.add(L.scenograph.director.scene_variables.selected.scale, "y").step(.01).onChange(function(e){
						scl_update('y', e);
					});
					sclFolder.add(L.scenograph.director.scene_variables.selected.scale, "z").step(.01).onChange(function(e){
						scl_update('z', e);
					});
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
						L.scenograph.editor.clear_selection();
					}
					if (!L.scenograph.director.gui.__folders["Selected Objects"]) {
						L.scenograph.director.scene_variables.selectedFolder = L.scenograph.director.gui.addFolder("Selected Objects");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.editor, "clear_selection");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.editor.csg, "intersect");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.editor.csg, "subtract");
						L.scenograph.director.scene_variables.selectedFolder.add(L.scenograph.editor.csg, "union");
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
						L.scenograph.editor.draw_bounding_box( randomColor, intersects[0].object, intersects[0].object.geometry.boundingBox.max, intersects[0].object.geometry.boundingBox.min, intersects[0].object.scale.x );
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

L.scenograph.editor.create_group = function() {

}

L.scenograph.editor.clone_group = function() {

}

L.scenograph.editor.delete_selection = function() {
	// delete the currently selected object
}

L.scenograph.editor.clear_selection = function() {
	for (var i = 0; i < L.scenograph.director.scene.children.length; i++) {
		if (L.scenograph.director.scene.children[i].material) {
			if (L.scenograph.director.scene.children[i].material.materials) {
		    	L.scenograph.director.scene.children[i].material.materials.forEach(function(material){
		    		if (material.prev_opacity) {
		    			material.opacity = material.prev_opacity;
		    			//delete material.prev_opacity;
		    		}
		    	});
		    }
		    else {
		    	if (L.scenograph.director.scene.children[i].material.prev_opacity) {
	    			L.scenograph.director.scene.children[i].material.opacity = L.scenograph.director.scene.children[i].material.prev_opacity;
	    			//delete L.scenograph.director.scene.children[i].material.prev_opacity;
	    		}
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

L.scenograph.editor.draw_bounding_box = function(color, object, max, min, scale) {

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
    		material.prev_opacity = material.opacity;
    		material.opacity = 0.7;
    	});
    }
    else {
    	object.material.transparent = true;
    	object.material.prev_opacity = object.material.opacity;
    	object.material.opacity = 0.7;
    }
    object.add(bounding_box);
};

L.scenograph.editor.random_color = function(){
	return Math.random() * 0xffffff;
}

L.scenograph.editor.add = function(type, position, scale, rotation) {
	var length = 40;
	var geometry;
	switch(type) {
		case 'cube': 
			geometry = new THREE.BoxGeometry(length, length, length);
			break;
		case 'prism': 
			geometry = new THREE.Geometry();
		    ////custom triangular pyramid TODO--fix problems during rotation.
		    geometry.vertices.push(new THREE.Vector3(-length/2, length/2, length)); // Vertex is not used anymore
		    geometry.vertices.push(new THREE.Vector3(-length/2, -length/2, length));
		    geometry.vertices.push(new THREE.Vector3(length/2, -length/2, length));
		    geometry.vertices.push(new THREE.Vector3(-length/2, length/2, -length));
		    geometry.vertices.push(new THREE.Vector3(-length/2, -length/2, -length));
		    geometry.vertices.push(new THREE.Vector3(length/2, -length/2, -length));

		    geometry.faces.push(new THREE.Face3(0, 1, 2));
		    geometry.faces.push(new THREE.Face3(3, 4, 0));
		    geometry.faces.push(new THREE.Face3(0, 4, 1)); //041 MUST BE Counter Clockwise
		    geometry.faces.push(new THREE.Face3(1, 4, 5));
		    geometry.faces.push(new THREE.Face3(1, 5, 2)); //152 MUST BE Counter Clockwise
		    geometry.faces.push(new THREE.Face3(2, 3, 0)); //230 MUST BE Counter Clockwise
		    geometry.faces.push(new THREE.Face3(2, 5, 3)); //253 MUST BE Counter Clockwise
		    geometry.faces.push(new THREE.Face3(3, 5, 4)); //354 MUST BE Counter Clockwise
			break;
		case 'cylinder': 
			geometry = new THREE.CylinderGeometry( length, length, length, 32, 4 );
			break;
		case 'sphere': 
			geometry = new THREE.SphereGeometry(length/2, 64, 32);
			break;
		case 'torus': 
			geometry = new THREE.TorusGeometry( length, 8, 8, 8 );
			break;
		case 'plane': 
			geometry = new THREE.PlaneGeometry( length, length, 4, 4 );
			break;
		case 'tetrahedron': 
			geometry = new THREE.TetrahedronGeometry( length, 0 );
			break;
		case 'octahedron': 
			geometry = new THREE.OctahedronGeometry( length, 2 );
			break;
	}
	var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: L.scenograph.editor.random_color()}));
	mesh.type = type;
	mesh.position.set(position.x, position.y, position.z);
	mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	mesh.scale.set(scale.x, scale.y, scale.z);
	L.scenograph.director.scene.add(mesh);
}

// pointer will be a place-able thingo in the environment. Objects get dropped there and the camera orbits around it.
var pointer = {
	x: 0, y: 0, z: 0
};
L.scenograph.editor.gui_folders = {
	'Add': {
		'Cube': function() {
			L.scenograph.editor.add('cube', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Prism': function() {
			L.scenograph.editor.add('prism', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Cylinder': function() {
			L.scenograph.editor.add('cylinder', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Sphere': function() {
			L.scenograph.editor.add('sphere', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Torus': function() {
			L.scenograph.editor.add('torus', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Plane': function() {
			L.scenograph.editor.add('plane', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Tetrahedron': function() {
			L.scenograph.editor.add('tetrahedron', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		},
		'Octahedron': function() {
			L.scenograph.editor.add('octahedron', pointer, {x:10,y:10,z:10}, {x: 0, y: 0, z: 0});
		}
	}
};


/*

	TODO:
		- Function to fart out object creation script  (--implicit tagged fields are built into the object and don't need to be added. They're shown here purely to help understand the data model)
			-- object details
			{
				type: 'cube',
				--implicit-material: THREE.MeshLambertMaterial(),
				--implicit-position: {},
				--implicit-rotation: {},
				--implicit-scale: {}
			}
			e.g. L.scenograph.add('cube');
		- Will need to be able to dispatch infinite nesting for CSG functions
		{
			type: 'csg',
			operation: 'subtract',
			position: {},
			rotation: {},
			scale: {}
			object1: {
				type: 'cube',
				material: THREE.MeshLambertMaterial(),
				position: {},
				rotation: {},
				scale: {}
			}
			object2: {
				type: 'cube',
				material: THREE.MeshLambertMaterial(),
				position: {},
				rotation: {},
				scale: {}
			}
		}
		- Nested CSG:
		{
			type: 'csg',
			operation: 'union',
			position: {},
			rotation: {},
			scale: {}
			object1: {
				type: 'cube',
				material: THREE.MeshLambertMaterial(),
				position: {},
				rotation: {},
				scale: {}
			}
			object2: {
				type: 'csg',
				operation: 'subtract',
				position: {},
				rotation: {},
				scale: {}
				object1: {
					type: 'cube',
					material: THREE.MeshLambertMaterial(),
					position: {},
					rotation: {},
					scale: {}
				}
				object2: {
					type: 'cube',
					material: THREE.MeshLambertMaterial(),
					position: {},
					rotation: {},
					scale: {}
				}
			}
		}



*/