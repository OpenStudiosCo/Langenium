function moveShip(ship, isPlayer, instruction) {
	
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
	cache.forEach(function(cachedObject, index){ if (instruction.details.url == cachedObject.url) { cacheIndex = index;} });

	var  x = instruction.details.position.x,
		y = instruction.details.position.y,
		z = instruction.details.position.z,
		scale = instruction.details.position.scale;
	if (cacheIndex >= 0) {
		var cachedObject = cache[cacheIndex];
		object = makeObjectMesh(instruction.details.type, cachedObject.geometry, cachedObject.materials, x, y, z , scale);
		renderObject(object, instruction);
	}
	else {
		loader.load(instruction.details.url, function(geometry, materials) {
			object = makeObjectMesh(instruction.details.type, geometry, materials, x, y, z , scale);
			var cachedObject = { url: instruction.details.url, geometry: geometry, materials: materials};
			cache.push(cachedObject);	
			renderObject(object, instruction);
		});
	}
}
var islands = [];
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
	object.position.set(x, y, z);
	object.scale.set(scale, scale, scale);
	object.matrixAutoUpdate = true;
	object.updateMatrix();
	object.geometry.colorsNeedUpdate = true;
	return object;
}

function renderObject(object, instruction) {
	object.uid = instruction.details.uid;
	var  x = instruction.details.position.x,
			y = instruction.details.position.y,
			z = instruction.details.position.z,
			scale = instruction.details.position.scale;
	
	if (instruction.details.type == "platform") {
		object.rotation.y = -3.3;
		scene.add(object);
	}
	if (instruction.details.type == "island") {
		islands.push(object);
		scene.add(islands[islands.length-1]);
	}
	if (instruction.details.type == "player") {	
		player = object;
		player.moveInterval = new Date().getTime();
		player.username = instruction.details.username;
		player.rotation.y = instruction.details.position.rotationY;
		player.add(camera);
		scene.add(player);
		ships.push(player);
		$("#stats .player.info .username").html(player.username);
		$("#playerList").append("<li>" + player.username + "</li>");
	}
	if (instruction.details.type == "ship") {
		var ship = object;
		ship.username = instruction.details.username;
		ship.rotation.y = instruction.details.position.rotationY;
		ships.push(ship);
		scene.add(ships[ships.length-1]);
		$("#playerList").append("<li>" + ship.username + "</li>");
		$("#players h2").html("Players online (" + ships.length + ")");
	}
}