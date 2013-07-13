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
		objects.renderObject(mesh, instruction['class'], instruction);
	}
	else {
		loader.load(instruction.url, function(geometry, materials) {
			mesh = objects.makeObjectMesh(instruction, geometry, materials);
			var cachedObject = { url: instruction.url, geometry: geometry, materials: materials};
			objects.cache.push(cachedObject);	
			objects.renderObject(mesh, instruction['class'], instruction);
		});
	}
};

objects.prototype.makeObjectMesh = function (instruction, geometry, materials) {
	var useVertexOverrides = false;
	if ((instruction['class'] != "terrain")&&(instruction['class'] != "ship")&&(instruction['class'] != "players")&&(instruction['class'] != "bots")) {
		useVertexOverrides = true;
	}

	textures.prepare(geometry, materials, useVertexOverrides);

	object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
	object.obj_details = {
		_id: instruction._id,
		object_id: instruction.object._id,
		name: instruction.object.name,
		type: instruction.object.type,
		sub_type: instruction.object.sub_type,
		status: instruction.status ? instruction.status : 'Saved'
	};
	object.geometry.computeBoundingBox();
	object.name = instruction['class'];
	object.position.set(instruction.position.x, instruction.position.y, instruction.position.z);
	object.rotation.set(instruction.rotation.x, instruction.rotation.y, instruction.rotation.z);
	object.scale.set(instruction.scale, instruction.scale, instruction.scale);
	object.matrixAutoUpdate = true;
	object.updateMatrix();
	object.geometry.colorsNeedUpdate = true;
	if (window.location.href.indexOf("editor") >= 0) {
		editor.object_properties.add_object(object);
	}
	return object;
};

objects.prototype.renderObject = function (mesh, obj_class, instruction) {

	if (obj_class == "environment") { 
		this.world_map.push(mesh);
		scene.add(this.world_map[this.world_map.length-1]);
	}
	if (obj_class == "players") {
		controls.enabled = true;
	}
	if (obj_class == "players" ||
		obj_class == "ship" ||
		obj_class == "bots") {
		objects.ships.make(obj_class, instruction, mesh);
	}
	

};