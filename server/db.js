module.exports.getLoadInstructions = getLoadInstructions;

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
	Object builder
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
var THREE = require('three');

function buildObject(role, type, position, scale) {
	var retObject;
	
	var objectTypes = {
		ship: 	{
						mercenary:	{  url: "assets/mercenary.js", scale: 10 },
						pirate: 			{  url: "assets/pirate.js", scale: 10 }
					},
		scene:	{
						platform: 		{ url: "assets/union-platform-plain.js" , scale: 1000},
						island: 			{ url: "island/island.js" , scale: 10}
					}
	};
	
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
	map.push({ name: "load", details: buildObject('platform', { scene: 'platform' }, { x: -13000, y: 4000, z: -125000 }, 0) });
	map.push({ name: "load", details: buildObject('platform', { scene: 'platform' }, { x: -8500, y: 500, z: -7000 }, 0) });
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 5500, y: -500, z: -10500, scale: 450 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 3000, y: -1000, z: -13000, scale: 800 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 0, y: -400, z: -14500, scale: 300 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: -3500, y: 0, z: -4500, scale: 250 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: -6500, y: 0, z: -17500, scale: 550 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 1900, y: 0, z: -13500, scale: 250 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 1100, y: -50, z: -16500, scale: 200 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 1000, y: -100, z: -16000, scale: 300 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: -5000, y: 0, z: -18500, scale: 700 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: -1500, y: 0, z: -16500, scale: 350 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: -3500, y: 0, z: -15500, scale: 300 }}});
	map.push({ name: "load", details: { type: "island", url: "assets/island.js", position: { x: 8000, y: 0, z: -9500, scale: 700 }}});
	return map;
}