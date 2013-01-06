module.exports.getLoadInstructions = getLoadInstructions;
module.exports.getObject = getObject;
module.exports.getDummyMap = getDummyMap;
module.exports.getDummyEnemies = getDummyEnemies;

var THREE = require('three');

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Scene Loader
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function getLoadInstructions(set) {
	var res;
	var location;
	switch (set) {
		case "map":
			res = buildMap();
			break;
		case "bots":
			res = buildEnemies(location);
			break;
	}
	return res; 
}

function buildEnemies(location) {
	var 	enemyDetails = getDummyEnemies(),
			enemies = [];
			
	enemyDetails.forEach(function(objDetails, index) {
		var obj = buildObject(objDetails.id, objDetails.type, objDetails.position, objDetails.scale);
		obj.type = { ship: "bot" };
		obj.id = objDetails.id;
		enemies.push(obj);
	});
	return enemies;
}

function buildMap(location) {
	var 	mapDetails = getDummyMap(),
			map = [];
			
	mapDetails.forEach(function(objDetails, index) {
		var obj = buildObject(objDetails.id, objDetails.type, objDetails.position, objDetails.scale);
		map.push(obj);
	});
	return map;
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Object cacher
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
var urlPrefix = "http://localhost:8080/";
var objectTypes = {
	ship: 	{
					mercenary:	{  url: "assets/mercenary.js", scale: 10 },
					pirate: 			{  url: "assets/pirate.js", scale: 10 }
				},
	scene:	{
					platform: 		{ url: "assets/union-platform2.js" , scale: 1000},
					island: 			{ url: "assets/island.js" , scale: 10}
				} 
};

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
										type: type,
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
	enemies.push({ id: 'Pirate 1', type: { ship: 'mercenary' }, position: { x: -10500, y: 5500, z: -2500, rotationY: 0 }, scale: 10 });
	enemies.push({ id: 'Pirate 2', type: { ship: 'pirate' }, position: { x: -10500, y: 6500, z: -2000, rotationY: 0 }, scale: 10 });
	enemies.push({ id: 'Pirate 3', type: { ship: 'pirate' }, position: { x: -10500, y: 6500, z: -2500, rotationY: 0 }, scale: 10 });
	enemies.push({ id: 'Pirate 4', type: { ship: 'pirate' }, position: { x: -6500, y: 6500, z: -2500, rotationY: 0 }, scale: 10 });
	enemies.push({ id: 'Pirate 5', type: { ship: 'mercenary' }, position: { x: -8500, y: 5500, z: -3500, rotationY: 0 }, scale: 10 });
	enemies.push({ id: 'Pirate 6', type: { ship: 'pirate' }, position: { x: -6500, y: 7500, z: -2500, rotationY: 0 }, scale: 10 });
	enemies.push({ id: 'Pirate 7', type: { ship: 'pirate' }, position: { x: -8500, y: 7500, z: -3500, rotationY: 0 }, scale: 10 });
	return enemies;
}

function getDummyMap() {
	var map = [];
	map.push({ id: 'platform', type: { scene: 'platform' }, position: { x: -8500, y: 500, z: -5000 }, scale: 0 });
	map.push({ id: 'island1', type: { scene: 'island' }, position: { x: 5500, y: -1500, z: -75000 }, scale: 2500 });
	map.push({ id: 'island2', type: { scene: 'island' }, position: { x: 18000, y: -500, z: -65000 }, scale: 2800 });
	map.push({ id: 'island3', type: { scene: 'island' }, position: { x: 50000, y: -1500, z: -25000 }, scale: 2800 });
	map.push({ id: 'island4', type: { scene: 'island' }, position: { x: 57000, y: -500, z: -15000 }, scale: 2000 });
	map.push({ id: 'island5', type: { scene: 'island' }, position: { x: -5500, y: -1500, z: -75000 }, scale: 2500 });
	map.push({ id: 'island6', type: { scene: 'island' }, position: { x: -18000, y: -500, z: -65000 }, scale: 2800 });
	map.push({ id: 'island7', type: { scene: 'island' }, position: { x: -50000, y: -1500, z: 25000 }, scale: 2800 });
	map.push({ id: 'island8', type: { scene: 'island' }, position: { x: -45000, y: -500, z: 15000 }, scale: 2000 });
	return map;
}