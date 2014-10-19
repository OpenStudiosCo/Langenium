/*
	Editor
*/


var editor = function() {
	// Structuring like this so it slides into dat.gui nicely. Will probably need to come up with object "views" to plug into dat.gui....
	this.csg = {
		scale_avg: function() {
			var scale = 0;
			L.director.scene_variables.selected_objects.forEach(function(object) {
				scale += object.scale.x;
			})
			scale = scale / L.director.scene_variables.selected_objects.length;
			return scale;
		},
		intersect: function() {
			var materials = [];
			L.director.scene_variables.selected_objects.forEach(function(object){
				// Check if we're dealing with something that has sub materials or not
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

			var objBSP = new ThreeBSP(L.director.scene_variables.selected_objects[0]);
			for (var i = 1; i < L.director.scene_variables.selected_objects.length; i++) {
				var thisBSP = new ThreeBSP(L.director.scene_variables.selected_objects[i]);
				objBSP = objBSP.intersect(thisBSP);
			}
			var newGeo = objBSP.toGeometry();
			var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));
			var scale = L.scenograph.editor.csg.scale_avg();
			newMesh.scale.set(scale,scale,scale);

			for (var i = 0; i < L.director.scene_variables.selected_objects.length; i++) {
				L.director.scene.remove(L.director.scene_variables.selected_objects[i]);
			}
			L.scenograph.editor.gui_functions['Clear Selection']();
			L.director.scene.add(newMesh);
		},
		subtract: function() {
			var materials = [];
			L.director.scene_variables.selected_objects.forEach(function(object){
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

			var objBSP = new ThreeBSP(L.director.scene_variables.selected_objects[0]);
			for (var i = 1; i < L.director.scene_variables.selected_objects.length; i++) {
				var thisBSP = new ThreeBSP(L.director.scene_variables.selected_objects[i]);
				objBSP = objBSP.subtract(thisBSP);
			}
			var newGeo = objBSP.toGeometry();
			var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));
			var scale = L.scenograph.editor.csg.scale_avg();
			newMesh.scale.set(scale,scale,scale);

			for (var i = 0; i < L.director.scene_variables.selected_objects.length; i++) {
				L.director.scene.remove(L.director.scene_variables.selected_objects[i]);
			}
			L.scenograph.editor.gui_functions['Clear Selection']();
			L.director.scene.add(newMesh);
		},
		union: function() {
			var materials = [];
			L.director.scene_variables.selected_objects.forEach(function(object){
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
			
			var objBSP = new ThreeBSP(L.director.scene_variables.selected_objects[0]);
			
			for (var i = 1; i < L.director.scene_variables.selected_objects.length; i++) {
				var thisBSP = new ThreeBSP(L.director.scene_variables.selected_objects[i]);
				objBSP = objBSP.union(thisBSP);
			}
			
			var newGeo = objBSP.toGeometry();
			// Clean up the scene
			for (var i = 0; i < L.director.scene_variables.selected_objects.length; i++) {
				L.director.scene.remove(L.director.scene_variables.selected_objects[i]);
			}
			
			var newMesh = new THREE.Mesh(newGeo, new THREE.MeshFaceMaterial(materials));

			var scale = L.scenograph.editor.csg.scale_avg();
			newMesh.scale.set(scale,scale,scale);

			L.scenograph.editor.gui_functions['Clear Selection']();
			L.director.scene.add(newMesh);
		}
	};

	this.gui_functions = {
		'Object Select Listener': function() {
		},
		'Delete Selected': function() {
			if (confirm('Delete selected objects? (THERE IS NO UNDO)')) {
				if (L.director.scene_variables.select_multiple == false) {
					L.director.scene.remove(L.director.scene_variables.selected);
				}
				else {
					L.director.scene_variables.selected_objects.forEach(function(object){
						L.director.scene.remove(object);
					});	
				}
				
				L.scenograph.editor.gui_functions['Clear Selection']();
			}
		},
		'Clear Selection': function() {
			for (var i = 0; i < L.director.scene.children.length; i++) {
				if (L.director.scene.children[i].material) {
					if (L.director.scene.children[i].material.materials) {
				    	L.director.scene.children[i].material.materials.forEach(function(material){
				    		if (material.prev_opacity) {
				    			material.opacity = material.prev_opacity;
				    			//delete material.prev_opacity;
				    		}
				    	});
				    }
				    else {
				    	if (L.director.scene.children[i].material.prev_opacity) {
			    			L.director.scene.children[i].material.opacity = L.director.scene.children[i].material.prev_opacity;
			    			//delete L.director.scene.children[i].material.prev_opacity;
			    		}
				    }
				}
				var obj_to_remove = [];
				for (var j = 0; j < L.director.scene.children[i].children.length; j++) {			
					if (L.director.scene.children[i].children[j].name == "bounding_box") {
						obj_to_remove.push(L.director.scene.children[i].children[j])
						//L.director.scene.children[i].remove(L.director.scene.children[i].children[j]);
					}
				}
				for (var k = 0; k < obj_to_remove.length; k++) {
					L.director.scene.children[i].remove(obj_to_remove[k]);
				}
			}

			L.director.scene_variables.selected_objects = []; // clears the selected object group
			L.director.scene_variables.selected = undefined;
			
		}
	}
	this.gui_folders = {
		'Add Shape': {
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

	return this;
}

editor.prototype._init = function() {
	L.scenograph.editor = new editor();
}

editor.prototype.select_object = function() {
	this.animate = function(delta) {
		if (L.director.cursor.leftClick == true) {
			L.director.projector.unprojectVector(L.director.cursor.position, L.director.camera);
			var raycaster = new THREE.Raycaster( L.director.camera.position, L.director.cursor.position.sub( L.director.camera.position ).normalize() );	

			var intersects = raycaster.intersectObjects( L.director.scene.children );
			if (intersects.length > 0) {
				if (L.director.scene_variables.select_multiple == false) {
					L.scenograph.editor.gui_functions['Clear Selection']();
					L.director.scene_variables.selected = intersects[0].object;
					intersects[0].object.geometry.computeBoundingBox();
					L.scenograph.editor.draw_bounding_box(0xFFFF00, intersects[0].object, intersects[0].object.geometry.boundingBox.max, intersects[0].object.geometry.boundingBox.min, intersects[0].object.scale.x );
					
					var material = L.director.scene_variables.selected.material;

					var vector = intersects[0].object.position.clone();
					L.director.scene_variables.target = intersects[0].object;
					L.director.controls.target.set(
						vector.x,
						vector.y,
						vector.z
					);
				}
				else {
					
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
						L.director.scene_variables.selected_objects.push(intersects[0].object);
						$(L.director.scene_variables.selectedFolder.domElement).append(
							"<li style='background-color: #" + parseInt(randomColor).toString(16) + ";'></li>"
						);
					}
				}
			}
		}
	}
	return this;
}

editor.prototype.create_group = function() {

}

editor.prototype.clone_group = function() {

}

editor.prototype.draw_bounding_box = function(color, object, max, min, scale) {

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

editor.prototype.random_color = function(){
	return Math.random() * 0xffffff;
}

editor.prototype.add = function(type, position, scale, rotation) {
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
			geometry = new THREE.CylinderGeometry( length, length, length, 32, 20, false );
			break;
		case 'sphere': 
			geometry = new THREE.SphereGeometry(length/2, 32, 32);
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
	L.director.scene.add(mesh);
}

// pointer will be a place-able thingo in the environment. Objects get dropped there and the camera orbits around it.
var pointer = {
	x: 0, y: 0, z: 0
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