function moveShip(ship, isPlayer, instruction) {

	var platform = platforms[0];
	
	var playerMesh = player;
	
	if (instruction.details.pY != 0){
		ship.position.y += instruction.details.pY;
	}
	if (instruction.details.pZ != 0) {
		ship.position.x += instruction.details.pX;
		ship.position.z += instruction.details.pZ;
	}
	
	var rotate = instruction.details.rY;

	if (rotate > 0){
		if (ship.rotation.z < .5) {
			if (isPlayer == true) { camera.rotation.z -= rotate / 3; }
			ship.rotation.z += rotate / 3;
		}
		else 
		{
			if (isPlayer == true) { camera.rotation.z -= rotate / 4; }
			ship.rotation.z += rotate / 4;
		}
		ship.rotation.y += rotate;
	}
	if (rotate < 0){
		if (ship.rotation.z > -.5) {
			if (isPlayer == true) { camera.rotation.z -= rotate / 3; }
			ship.rotation.z += rotate / 3;
		}
		else {
			if (isPlayer == true) { camera.rotation.z -= rotate / 4; }
			ship.rotation.z += rotate / 4;
		}
		ship.rotation.y += rotate;
	}
	
}

function loadInstructions(data) {
	data.instructions.forEach(function(instruction){ loadObject(instruction); });
}

function loadObject(instruction) {
	var loader = new THREE.JSONLoader();
	var cacheIndex = -1;
	cache.forEach(function(cachedObject, index){ if (instruction.url == cachedObject.url) { cacheIndex = index;} });

	var  x = instruction.position.x,
		y = instruction.position.y,
		z = instruction.position.z,
		scale = instruction.position.scale,
		category,
		type;
	
	// it looks dodgy but this only loops once.
	for (var objectType in instruction.type) {
		type = instruction.type[objectType]; 
		category = objectType;
	}
	
	if (cacheIndex >= 0) {
		var cachedObject = cache[cacheIndex];
		mesh = makeObjectMesh(type, cachedObject.geometry, cachedObject.materials, x, y, z , scale);
		renderObject(mesh, category, type, instruction);
	}
	else {
		loader.load(instruction.url, function(geometry, materials) {
			mesh = makeObjectMesh(type, geometry, materials, x, y, z , scale);
			var cachedObject = { url: instruction.url, geometry: geometry, materials: materials};
			cache.push(cachedObject);	
			renderObject(mesh, category, type, instruction);
		});
	}
}
var 	islands = [],
		platforms = [];
function makeObjectMesh(objectType, geometry, materials, x, y, z, scale) {
	var useVertexOverrides = false;
	if ((objectType != "ship")&&(objectType != "player")) {
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
}

function renderObject(mesh, category, type, instruction) {
	mesh.uid = instruction.id;
	var  x = instruction.position.x,
			y = instruction.position.y,
			z = instruction.position.z,
			scale = instruction.position.scale;

	if (type == "platform") {
		platforms.push(mesh);
		scene.add(platforms[platforms.length-1]);
	}
	if (type ==  "island") {
		islands.push(mesh);
		scene.add(islands[islands.length-1]);
	}
	if (type == "player") {	
		player = mesh;
		player.moveInterval = new Date().getTime();
		player.username = instruction.username;
		player.rotation.y = instruction.position.rotationY;
		player.add(camera);
		scene.add(player);
		ships.push(player);
		$("#stats .player.info .username").html(player.username);
		$("#playerList").append("<li>" + player.username + "</li>");
	}
	if (type == "ship") {
		var ship = mesh;
		ship.username = instruction.username;
		ship.rotation.y = instruction.position.rotationY;
		ships.push(ship);
		scene.add(ships[ships.length-1]);
		$("#playerList").append("<li>" + ship.username + "</li>");
		$("#players h2").html("Players online (" + ships.length + ")");
	}
}