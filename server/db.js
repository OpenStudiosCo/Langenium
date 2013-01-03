module.exports.getLoadInstructions = getLoadInstructions;
module.exports.getObject = getObject;

var THREE = require('three');
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Scene Loader
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function getLoadInstructions(set) {
	var res;
	var location;
	switch (set) {
		case "map":
			res = getMap();
			break;
		case "ships":
			res = getEnemies(location);
			break;
	}
	return res; 
}

function getEnemies(location) {
	var enemies = getDummyEnemies();
	return enemies;
}

function getMap(location) {
	var map = getDummyMap();
	return map;
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Bounding box builder
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
var urlPrefix = "http://localhost:8080/";
var objectTypes = {
	ship: 	{
					mercenary:	{  url: "assets/mercenary.js", scale: 10 },
					pirate: 			{  url: "assets/pirate.js", scale: 10 }
				},
	scene:	{
					platform: 		{ url: "assets/union-platform-plain.js" , scale: 1000},
					island: 			{ url: "assets/island.js" , scale: 10}
				}
};

for (var objectType in objectTypes) {
	for (var object in objectTypes[objectType]) {
		loadMesh(objectType, object);
	}
}
function loadMesh(objectType, object) {
	var 	urlPrefix = "http://localhost:8080/",
			loader =  new THREE.JSONLoader(),
			url = objectTypes[objectType][object].url;
			
	loader.load(urlPrefix + url, function(geometry, materials){
			objectTypes[objectType][object].geometry = geometry;
			objectTypes[objectType][object].materials = materials;
		});
}
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Object builder
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

function getObject(type) {
	var retObject;
	for (var objectType in objectTypes) {
		for (var object in objectTypes[objectType]) {
			if (type[objectType] == object) {
				retObject = objectTypes[objectType][object];
			}
		}
	}
	return retObject;
}
function buildObject(role, type, position, scale) {
	var retObject;
	for (var objectType in objectTypes) {
		for (var object in objectTypes[objectType]) {
			if (type[objectType] == object) {
				position.scale = scale || objectTypes[objectType][object].scale;
				retObject = 	{
										type: role,
										url: objectTypes[objectType][object].url,
										position: position
									};
			}
		}
	}
	return retObject;
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Placeholder functions that will be replaced with DB queries
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

/* =============================================================================

 Dummy Environment 
 -------------------------------
 
 Players:
  Bob 
  Sharky
  
 Enemies:
  Pirate 1
  Pirate 2
  
  Server startup event:
	???
  Player login event:
	1. Determine player location
	2. Load objects around player 
  Player continuous events:
	- Player movement
	- Monster movement
	- Cloud movement

=============================================================================*/

function getDummyEnemies() {
	var enemies = [];
	enemies.push({ name: "load", details: buildObject('monster', { ship: 'pirate' }, { x: -2000, y: 2200, z: -3800 }, 0) });
	enemies.push({ name: "load", details: buildObject('monster', { ship: 'pirate' }, { x: -1000, y: 1800, z: -2900 }, 0) });
	enemies.push({ name: "load", details: buildObject('monster', { ship: 'pirate' }, { x: -1000, y: 2000, z: -2700 }, 0) });
	enemies.push({ name: "load", details: buildObject('monster', { ship: 'pirate' }, { x: -3000, y: 2100, z: -5000 }, 0) });
	enemies.push({ name: "load", details: buildObject('monster', { ship: 'pirate' }, { x: -3000, y: 1800, z: -4000 }, 0) });
	return enemies;
}

function getDummyMap() {
	var map = [];
	map.push({ name: "load", details: buildObject('platform', { scene: 'platform' }, { x: -8500, y: 500, z: -5000 }, 0) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: 5500, y: -1500, z: -75000 }, 2500) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: 18000, y: -500, z: -65000 }, 2800) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: 50000, y: -1500, z: -25000 }, 2800) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: 57000, y: -500, z: -15000 }, 2000) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: -5500, y: -1500, z: -75000 }, 2500) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: -18000, y: -500, z: -65000 }, 2800) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: -50000, y: -1500, z: 25000 }, 2800) });
	map.push({ name: "load", details: buildObject('island', { scene: 'island' }, { x: -45000, y: -500, z: 15000 }, 2000) });
	return map;
}