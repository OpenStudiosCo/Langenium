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
		}
		this.world_map.push(mesh);
		engine.scene.add(this.world_map[this.world_map.length-1]);
	}
	
	if (obj_class == "ships" ||
		obj_class == "bots") {
		objects.ships.make(obj_class, instruction, mesh);
	}
	


};