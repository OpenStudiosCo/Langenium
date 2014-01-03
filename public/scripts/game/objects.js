/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Objects
	This defines object methods and proxies the sub class functions 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var objects = function() {
	this.characters = new characters();
	this.ships = new ships();
    this.cache = [];
    this.world_map = [];
    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

 // based on https://github.com/documentcloud/underscore/blob/bf657be243a075b5e72acc8a83e6f12a564d8f55/underscore.js#L767
objects.prototype.new = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
};

objects.prototype.loadObject = function (instruction) {
	
	var loader = new THREE.JSONLoader();
	var cacheIndex = -1;
	this.cache.forEach(function(cachedObject, index){ if (instruction.url == cachedObject.url) { cacheIndex = index;} });

	if ((cacheIndex >= 0)&&(window.location.href.indexOf("editor") < 0)) {
		var cachedObject = objects.cache[cacheIndex];
		mesh = objects.makeObjectMesh(instruction, cachedObject.geometry, cachedObject.materials);
		objects.renderObject(mesh, instruction.category, instruction);
	}
	else {
		loader.load(instruction.url, function(geometry, materials) {
			mesh = objects.makeObjectMesh(instruction, geometry, materials);
			var cachedObject = { url: instruction.url, geometry: geometry, materials: materials};
			objects.cache.push(cachedObject);	
			objects.renderObject(mesh, instruction.category, instruction);
		});
	}
};

objects.prototype.makeObjectMesh = function (instruction, geometry, materials) {
	var useVertexOverrides = false;
	if ((instruction.category != "terrain")&&(instruction.category != "ships")&&(instruction.category != "bots")) {
		useVertexOverrides = true;
	}

	textures.prepare(geometry, materials, useVertexOverrides);

	object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
	object.obj_details = {
		_id: instruction._id,
		object_id: instruction.details.object_id,
		name: instruction.details.name,
		type: instruction.details.type,
		sub_type: instruction.details.sub_type,
		status: instruction.status ? instruction.status : 'Saved'
	};
	object.geometry.computeBoundingBox();
	object.name = instruction.category;
	object.position.set(parseFloat(instruction.position.x), parseFloat(instruction.position.y), parseFloat(instruction.position.z));
	object.rotation.set(parseFloat(instruction.rotation.x), parseFloat(instruction.rotation.y), parseFloat(instruction.rotation.z));
	object.scale.set(parseFloat(instruction.scale.x), parseFloat(instruction.scale.y), parseFloat(instruction.scale.z));
	object.matrixAutoUpdate = true;
	object.updateMatrix();
	object.geometry.colorsNeedUpdate = true;
	if (window.location.href.indexOf("editor") >= 0) {
		editor.object_properties.add_object(object);
	}
	return object;
};

objects.prototype.renderObject = function (mesh, obj_class, instruction) {

	// Convert all to floats to resolve stupid issues
	instruction.position.x = parseFloat(instruction.position.x);
	instruction.position.y = parseFloat(instruction.position.y);
	instruction.position.z = parseFloat(instruction.position.z);
	instruction.rotation.x = parseFloat(instruction.rotation.x);
	instruction.rotation.y = parseFloat(instruction.rotation.y);
	instruction.rotation.z = parseFloat(instruction.rotation.z);

	if (obj_class == "environment") { 
		
		if (mesh.obj_details.type == 'terrain') {
			//mesh.material = 
		}
		
		if (mesh.obj_details.type =='infrastructure' &&
			mesh.obj_details.sub_type =='platforms' &&
			mesh.obj_details.name =='union') {

			var 	pos_x = instruction.position.x + Math.sin(mesh.rotation.y) * -1950,
				 	pos_z = instruction.position.z + Math.cos(mesh.rotation.y) * -2250;

			var thruster_1 = effects.particles.createThruster(15, { x: pos_x, y: instruction.position.y - 900, z: pos_z });
			engine.scene.add(thruster_1);

			pos_x = instruction.position.x + Math.sin(instruction.rotation.y) * -100;
			pos_z = instruction.position.z + Math.cos(instruction.rotation.y) * -100;		

			var thruster_2 = effects.particles.createThruster(15, { x: pos_x, y: instruction.position.y - 900, z: pos_z });
			engine.scene.add(thruster_2);

			pos_x = instruction.position.x + Math.sin(instruction.rotation.y) * 2050;
			pos_z = instruction.position.z + Math.cos(instruction.rotation.y) * 2150;	

			var thruster_3 = effects.particles.createThruster(15, { x: pos_x, y: instruction.position.y - 900, z: pos_z });
			engine.scene.add(thruster_3);

			var window_material = textures.procedural.createMaterial('union_platform_building_windows', textures.procedural.building_windows);
			var roof_material = textures.procedural.createMaterial('union_platform_building_roof', textures.procedural.building_roof);
			// reset UV mappings? :P

			mesh.material.materials.push(window_material);
			var window_index = mesh.material.materials.length - 1;

			mesh.material.materials.push(roof_material);
			var roof_index = mesh.material.materials.length - 1;

			var light = new THREE.Color( 0xffffff )
			var shadow    = new THREE.Color( 0x303050 );
			var color_ticker = 0;
			var value   = 1 - Math.random() * Math.random();
			var baseColor   = new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );

			var topColor    = baseColor.clone().multiply( light );
			var bottomColor = baseColor.clone().multiply( shadow );

			mesh.geometry.faceVertexUvs[0] = [];
		    mesh.geometry.faces.forEach(function(face, index){
		    	if (color_ticker < 2) {
		    		value   = 1 - Math.random() * Math.random();
					baseColor   = new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );

					topColor    = baseColor.clone().multiply( light );
					bottomColor = baseColor.clone().multiply( shadow );
		    		color_ticker++;
		    	}
		    	else {
		    		color_ticker = 0;
		    	}

		    	if (mesh.material.materials[face.materialIndex].name == 'Dark-Glass') {				    		
		    		face.materialIndex = window_index;
		    		if (mesh.geometry.vertices[face.a].y == mesh.geometry.vertices[face.b].y &&
				        mesh.geometry.vertices[face.a].y == mesh.geometry.vertices[face.c].y) {
				    	face.materialIndex = roof_index;
				    } 
		    		mesh.material.materials[face.materialIndex].vertexColors = THREE.VertexColors;
					mesh.material.materials[face.materialIndex].side = THREE.DoubleSide;
					// Use vertex colours
					if ( index === 2 ) {
				        // set face.vertexColors on root face
				        face.vertexColors = [ baseColor, baseColor, baseColor ];
				    } else {
				        // set face.vertexColors on sides faces
				        face.vertexColors = [ topColor, topColor, bottomColor ];
				    }
				}

		    	if (index % 2 == 0) {
					mesh.geometry.faceVertexUvs[0].push([
						new THREE.Vector2(1,0),
						new THREE.Vector2(0,0),
						new THREE.Vector2(1,1)
					]);
				}
				else {
					mesh.geometry.faceVertexUvs[0].push([
						new THREE.Vector2(0,0),
						new THREE.Vector2(0,1),
						new THREE.Vector2(1,1)
					]);
				}
				
			});
		}
		this.world_map.push(mesh);
		engine.scene.add(this.world_map[this.world_map.length-1]);
	}
	
	if (obj_class == "ships" ||
		obj_class == "bots") {
		objects.ships.make(obj_class, instruction, mesh);
	}
	


};