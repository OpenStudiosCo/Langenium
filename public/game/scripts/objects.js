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

	var obj_status = 'Saved';
	if (instruction.status) {
		obj_status = instruction.status
	}
	var loader = new THREE.JSONLoader();
	var cacheIndex = -1;
	this.cache.forEach(function(cachedObject, index){ if (instruction.url == cachedObject.url) { cacheIndex = index;} });
	var x = instruction.position.x,
		y = instruction.position.y,
		z = instruction.position.z,
		scale = instruction.scale, 
		obj_class = instruction["class"],
		o = this;
	
	if ((cacheIndex >= 0)&&(window.location.href.indexOf("editor") < 0)) {
		var cachedObject = o.cache[cacheIndex];
		mesh = o.makeObjectMesh(obj_status, obj_class, instruction.name, instruction._id, instruction.obj_type, instruction.sub_type, cachedObject.geometry, cachedObject.materials, x, y, z , scale);
		o.renderObject(mesh, obj_class, instruction);
	}
	else {
		loader.load(instruction.url, function(geometry, materials) {
			mesh = o.makeObjectMesh(obj_status, obj_class, instruction.name, instruction._id, instruction.obj_type, instruction.sub_type, geometry, materials, x, y, z , scale);
			var cachedObject = { url: instruction.url, geometry: geometry, materials: materials};
			o.cache.push(cachedObject);	
			o.renderObject(mesh, obj_class, instruction);
		});
	}
};

objects.prototype.makeObjectMesh = function (obj_status, obj_class, obj_name, obj_id, obj_type, obj_sub_type, geometry, materials, x, y, z, scale) {
	var useVertexOverrides = false;
	if ((obj_class != "terrain")&&(obj_class != "ship")&&(obj_class != "players")&&(obj_class != "bot")) {
		useVertexOverrides = true;
	}

	textures.prepare(geometry, materials, useVertexOverrides);

	object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
	object.obj_details = {
		instance_id: obj_id,
		name: obj_name,
		type: obj_type,
		sub_type: obj_sub_type,
		status: obj_status
	};
	object.geometry.computeBoundingBox();
	object.name = obj_class;
	object.position.set(x, y, z);
	object.scale.set(scale, scale, scale);
	object.matrixAutoUpdate = true;
	object.updateMatrix();
	object.geometry.colorsNeedUpdate = true;
	if (window.location.href.indexOf("editor") >= 0) {
		editor.object_properties.add_object(object);
	}
	return object;
};

objects.prototype.renderObject = function (mesh, obj_class, instruction) {
	
	mesh.uid = instruction.id;
	var  x = instruction.position.x,
			y = instruction.position.y,
			z = instruction.position.z,
			scale = instruction.scale;

	if (obj_class == "environment") { 
		this.world_map.push(mesh);
		scene.add(this.world_map[this.world_map.length-1]);
	}
	if (obj_class == "players") {
		controls.enabled = true;
		objects.ships.make(instruction, mesh, true, objects.ships.mercenary);
	}
	if (obj_class == "ship") {
		objects.ships.make(instruction, mesh, false, objects.ships.mercenary);
	}

};