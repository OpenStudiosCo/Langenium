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
	this.players = new players();
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
	var x = instruction.position.x,
		y = instruction.position.y,
		z = instruction.position.z,
		scale = instruction.scale, 
		type = instruction["class"],
		o = this;
	
	if ((cacheIndex >= 0)&&(window.location.href.indexOf("editor") <= 0)) {
		var cachedObject = o.cache[cacheIndex];
		mesh = o.makeObjectMesh(type, cachedObject.geometry, cachedObject.materials, x, y, z , scale);
		o.renderObject(mesh, type, instruction);
	}
	else {
		loader.load(instruction.url, function(geometry, materials) {
			mesh = o.makeObjectMesh(type, geometry, materials, x, y, z , scale);
			var cachedObject = { url: instruction.url, geometry: geometry, materials: materials};
			o.cache.push(cachedObject);	
			o.renderObject(mesh, type, instruction);
		});
	}
};

objects.prototype.makeObjectMesh = function (objectType, geometry, materials, x, y, z, scale) {
	var useVertexOverrides = false;
	if ((objectType != "ship")&&(objectType != "players")&&(objectType != "bot")) {
		useVertexOverrides = true;

	}
	materials.forEach(function(material, index){

		if (material.name == "Metal") {

				materials[index].vertexColors = THREE.VertexColors;
		}
		if (material.name == "Light-Metal") {
				materials[index].vertexColors = THREE.VertexColors;
		}
		if (material.name == "Red-Metal") {
				materials[index].vertexColors = THREE.VertexColors;
		}
		if (material.name == "Glass") {
				materials[index].transparent = true;
				materials[index].opacity = 0.8;
	
				materials[index].color.r = .1;
				materials[index].color.g =  .5; 
				materials[index].color.b =  .9;
		
				materials[index].vertexColors = THREE.VertexColors;

		}
		if (material.name == "Dark-Glass") {
			materials[index].shading = THREE.FlatShading;
			materials[index].transparent = true;
			materials[index].opacity = 0.95;

			materials[index].vertexColors = THREE.VertexColors;
			
		}
	});
	geometry.faces.forEach(function(face,index){
		if ((materials[face.materialIndex].name == "Red-Metal")&&(useVertexOverrides == true)) {
			face.vertexColors[0] =  new THREE.Color( 0x440000 );
			face.vertexColors[1] =  new THREE.Color( 0x440000 );
			face.vertexColors[2] =  new THREE.Color( 0x550000);
			face.vertexColors[3] =  new THREE.Color( 0x440000 );
		}
		if ((materials[face.materialIndex].name == "Metal")&&(useVertexOverrides == true)) {
			face.vertexColors[0] =  new THREE.Color( 0x333333 );
			face.vertexColors[1] =  new THREE.Color( 0x222222 );
			face.vertexColors[2] =  new THREE.Color( 0x333333);
			face.vertexColors[3] =  new THREE.Color( 0x333333 );
		}
		if ((materials[face.materialIndex].name == "Light-Metal")&&(useVertexOverrides == true)) {
			face.vertexColors[0] =  new THREE.Color( 0x666666 );
			face.vertexColors[1] =  new THREE.Color( 0x444444 );
			face.vertexColors[2] =  new THREE.Color( 0x666666);
			face.vertexColors[3] =  new THREE.Color( 0x666666 );
		}
		if ((materials[face.materialIndex].name == "Dark-Glass")&&(useVertexOverrides == true)) {
			face.vertexColors[0] =  new THREE.Color( 0x112233 );
			face.vertexColors[1] =  new THREE.Color( 0x112233 );
			face.vertexColors[2] =  new THREE.Color( 0x116699);
			face.vertexColors[3] =  new THREE.Color( 0x113355 );
		}
	});
	object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
	object.geometry.computeBoundingBox();
	object.name = objectType;
	object.position.set(x, y, z);
	object.scale.set(scale, scale, scale);
	object.matrixAutoUpdate = true;
	object.updateMatrix();
	object.geometry.colorsNeedUpdate = true;
	return object;
};

objects.prototype.renderObject = function (mesh, type, instruction) {
	mesh.uid = instruction.id;
	var  x = instruction.position.x,
			y = instruction.position.y,
			z = instruction.position.z,
			scale = instruction.scale;

	if (type == "environment") { 
		this.world_map.push(mesh);
		scene.add(this.world_map[this.world_map.length-1]);
	}
	if (type == "players") {
		player = mesh;
		player.bullets = [];
		player.moveInterval = new Date().getTime();
		player.username = instruction.username;
		player.socket_id = instruction.socket_id;
		player.rotation.y = instruction.position.rY;
		player.material.materials.forEach(function(material,index){
			player.material.materials[index].morphTargets = true;
		});
		
		player.velocity = 0;
		
		player.add(client.camera);
		
		scene.add(player);
		ships.push(player);
	}
	console.log(type);
	if (type == "ship") {
		var ship = mesh;
		ship.bullets = [];
		ship.moveInterval = new Date().getTime();
		ship.username = instruction.username;
		ship.socket_id = instruction.socket_id;
		ship.rotation.y = instruction.position.rY;
		ship.material.materials.forEach(function(material,index){
			ship.material.materials[index].morphTargets = true;
		});
		
		ship.velocity = 0;
		
		ships.push(ship);
		scene.add(ships[ships.length-1]);

	}
	if (type == "bot") {
		var bot = mesh;
		bot.bullets = [];
		bot.id = instruction.id;
		bot.type = instruction.shipType;
		bot.rotation.y = instruction.position.rotationY;
		bot.add(botScope());
		bots.push(bot);
		scene.add(bots[bots.length-1]);
	}
};