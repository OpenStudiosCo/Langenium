/** characters indexes **/
db.getCollection("characters").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** objects indexes **/
  db.getCollection("objects").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** scene_objects indexes **/
  db.getCollection("scene_objects").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** scenes indexes **/
  db.getCollection("scenes").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** ships indexes **/
  db.getCollection("ships").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** system.users indexes **/
  db.getCollection("system.users").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** system.users indexes **/
  db.getCollection("system.users").ensureIndex({
    "user": NumberInt(1),
    "userSource": NumberInt(1)
  },{
    "unique": true
  });
  
  /** users indexes **/
  db.getCollection("users").ensureIndex({
    "_id": NumberInt(1)
  },[
    
  ]);
  
  /** characters records **/
  db.getCollection("characters").insert({
    "_id": ObjectId("527260d7b3d397a020000007"),
    "category": "characters",
    "name": "Anonymous",
    "user_id": ObjectId("52725fe1aeefa92027000004"),
    "type": "mercenary"
  });
  db.getCollection("characters").insert({
    "_id": ObjectId("527260e4b3d397a020000008"),
    "category": "characters",
    "name": "Anonymous",
    "user_id": ObjectId("52725f15bc0f5aa42a000004"),
    "type": "mercenary"
  });
  
  /** objects records **/
  db.getCollection("objects").insert({
    "_id": ObjectId("5206bbabb3d3976c0d000010"),
    "details": {
      "url": "\/assets\/game\/objects\/architecture\/placeholders\/straight-tower.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "straight-tower",
    "sub_type": "placeholders",
    "type": "architecture"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206bb9cb3d3976c0d00000f"),
    "details": {
      "url": "\/assets\/game\/objects\/architecture\/placeholders\/tall-cylinder.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "tall-cylinder",
    "sub_type": "placeholders",
    "type": "architecture"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206bb8ab3d3976c0d00000e"),
    "details": {
      "url": "\/assets\/game\/objects\/architecture\/placeholders\/short-cylinder.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "short-cylinder",
    "sub_type": "placeholders",
    "type": "architecture"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206bb7eb3d3976c0d00000d"),
    "details": {
      "url": "\/assets\/game\/objects\/architecture\/placeholders\/prism.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "prism",
    "sub_type": "placeholders",
    "type": "architecture"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206bb74b3d3976c0d00000c"),
    "details": {
      "url": "\/assets\/game\/objects\/architecture\/placeholders\/cube.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "cube",
    "sub_type": "placeholders",
    "type": "architecture"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b8ecb3d3976c0d00000a"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/smooth.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "smooth",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206bac9b3d3976c0d00000b"),
    "details": {
      "url": "\/assets\/game\/objects\/architecture\/placeholders\/angled-tower.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "angled-tower",
    "sub_type": "placeholders",
    "type": "architecture"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b8e0b3d3976c0d000009"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/short-sharp.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "short-sharp",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b8d5b3d3976c0d000008"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/short-blunt.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "short-blunt",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b86ab3d3976c0d000007"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/long-sharp.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "long-sharp",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b862b3d3976c0d000006"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/long-blunt.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "long-blunt",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b857b3d3976c0d000005"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/floating.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "floating",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("5206b7dbb3d3976c0d000004"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/rocks\/boulder.js?nocache",
      "scale": {
        "x": 500,
        "y": 500,
        "z": 500
      }
    },
    "name": "boulder",
    "sub_type": "rocks",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51e052e7fc48c36530000000"),
    "details": {
      "url": "\/assets\/game\/objects\/ships\/pirate\/marauder.js?nocache",
      "scale": {
        "x": 10,
        "y": 10,
        "z": 10
      }
    },
    "name": "pirate",
    "sub_type": "alazaar",
    "type": "ships"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51dee691fc48c32330000000"),
    "details": {
      "url": "\/assets\/game\/objects\/ships\/mercenary\/valiant.js?nocache",
      "scale": {
        "x": 10,
        "y": 10,
        "z": 10
      }
    },
    "name": "mercenary",
    "sub_type": "winthrom",
    "type": "ships"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d6a1dbfc48c37630000003"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/plateau\/regular-angled.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "regular-angled",
    "sub_type": "plateau",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d6a1cafc48c32430000002"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/plateau\/regular-straight.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "regular-straight",
    "sub_type": "plateau",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d6a051fc48c37630000002"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/plateau\/large-straight.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "large-straight",
    "sub_type": "plateau",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d69636fc48c32430000001"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/plateau\/large-angled.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "large-angled",
    "sub_type": "plateau",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d6956efc48c37630000001"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/mountain\/steep.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "steep",
    "sub_type": "mountain",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d69560fc48c32430000000"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/mountain\/splintered.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "splintered",
    "sub_type": "mountain",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51d68ed1fc48c37630000000"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/mountain\/base.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "base",
    "sub_type": "mountain",
    "type": "terrain"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51555f0aa47761084a000001"),
    "details": {
      "url": "\/assets\/game\/objects\/infrastructure\/platforms\/union.js?nocache",
      "scale": {
        "x": 1000,
        "y": 1000,
        "z": 1000
      }
    },
    "name": "union",
    "sub_type": "platforms",
    "type": "infrastructure"
  });
  db.getCollection("objects").insert({
    "_id": ObjectId("51555f12a47761094a000001"),
    "details": {
      "url": "\/assets\/game\/objects\/terrain\/mountain\/island.js?nocache",
      "scale": {
        "x": 2000,
        "y": 2000,
        "z": 2000
      }
    },
    "name": "island",
    "sub_type": "mountain",
    "type": "terrain"
  });
  
  /** scene_objects records **/
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52724afab3d397a020000003"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51d68ed1fc48c37630000000"),
      "name": "base",
      "type": "terrain",
      "sub_type": "mountain"
    },
    "position": {
      "x": 46568.583838158,
      "y": 35342.7109375,
      "z": 28878.719042823
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "scale": {
      "x": 1000,
      "y": 1000,
      "z": 1000
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766708b3d397941b000000"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f0aa47761084a000001"),
      "name": "union",
      "type": "infrastructure",
      "sub_type": "platforms"
    },
    "position": {
      "x": 9249,
      "y": 3244,
      "z": 100
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "scale": {
      "x": 1100,
      "y": 1100,
      "z": 1100
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766815b3d397941b000001"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f12a47761094a000001"),
      "name": "island",
      "type": "terrain",
      "sub_type": "mountain"
    },
    "position": {
      "x": 96000,
      "y": -2000,
      "z": 10000
    },
    "rotation": {
      "x": 0,
      "y": 1,
      "z": 0
    },
    "scale": {
      "x": 4000,
      "y": 4000,
      "z": 4000
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766a7bb3d397941b000002"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f12a47761094a000001"),
      "name": "island",
      "type": "terrain",
      "sub_type": "mountain"
    },
    "position": {
      "x": -35000,
      "y": -6000,
      "z": 55000
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "scale": {
      "x": 3500,
      "y": 3500,
      "z": 3500
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766a9bb3d397941b000003"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f12a47761094a000001"),
      "name": "island",
      "type": "terrain",
      "sub_type": "mountain"
    },
    "position": {
      "x": -40000,
      "y": -1000,
      "z": 40000
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "scale": {
      "x": 3000,
      "y": 3000,
      "z": 3000
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766ab9b3d397941b000004"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f12a47761094a000001"),
      "name": "island",
      "type": "terrain",
      "sub_type": "mountain"
    },
    "position": {
      "x": -18000,
      "y": -2000,
      "z": 65000
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "scale": {
      "x": 2500,
      "y": 2500,
      "z": 2500
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766adfb3d397941b000005"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f12a47761094a000001"),
      "name": "island",
      "type": "terrain",
      "sub_type": "mountain"
    },
    "position": {
      "x": 60000,
      "y": -5000,
      "z": 60000
    },
    "rotation": {
      "x": 0,
      "y": 2,
      "z": 0
    },
    "scale": {
      "x": 5000,
      "y": 5000,
      "z": 5000
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  db.getCollection("scene_objects").insert({
    "_id": ObjectId("52766b12b3d397941b000006"),
    "category": "environment",
    "details": {
      "object_id": ObjectId("51555f0aa47761084a000001"),
      "name": "union",
      "type": "infrastructure",
      "sub_type": "platforms"
    },
    "position": {
      "x": -6169.160160821,
      "y": 3244.3996582031,
      "z": 2964.6613037744
    },
    "rotation": {
      "x": 0,
      "y": -0.68067840827779,
      "z": 0
    },
    "scale": {
      "x": 1100,
      "y": 1100,
      "z": 1100
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001")
  });
  
  /** scenes records **/
  db.getCollection("scenes").insert({
    "__v": NumberInt(0),
    "_id": ObjectId("526faf72b3d397a020000000"),
    "description": "Configurable user hangar scene that spawns when a user triggers the relevant portal type",
    "environment": "indoor",
    "name": "User Hangars",
    "startup": "manual"
  });
  db.getCollection("scenes").insert({
    "__v": NumberInt(0),
    "_id": ObjectId("526fae95ba40eb100a000001"),
    "description": "This is the main MMORPG overworld",
    "environment": "outdoor",
    "name": "Overworld",
    "startup": "auto"
  });
  
  /** ships records **/
  db.getCollection("ships").insert({
    "_id": ObjectId("527263d4b3d397a020000009"),
    "category": "ships",
    "details": {
      "object_id": ObjectId("51dee691fc48c32330000000"),
      "name": "mercenary",
      "sub_type": "winthrom",
      "type": "ships"
    },
    "user_id": ObjectId("52725f15bc0f5aa42a000004")
  });
  
  /** system.indexes records **/
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.system.users",
    "name": "_id_"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "user": NumberInt(1),
      "userSource": NumberInt(1)
    },
    "unique": true,
    "ns": "langenium.system.users",
    "name": "user_1_userSource_1"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.scenes",
    "name": "_id_"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.objects",
    "name": "_id_"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.scene_objects",
    "name": "_id_"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.users",
    "name": "_id_"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.characters",
    "name": "_id_"
  });
  db.getCollection("system.indexes").insert({
    "v": NumberInt(1),
    "key": {
      "_id": NumberInt(1)
    },
    "ns": "langenium.ships",
    "name": "_id_"
  });
  
  /** system.users records **/
  db.getCollection("system.users").insert({
    "_id": ObjectId("526faaccb6464beef8b45dec"),
    "user": "langenium",
    "readOnly": false,
    "pwd": "de114cea5fad88e537dcd161dd16895a"
  });
  
  /** users records **/
  db.getCollection("users").insert({
    "__v": NumberInt(0),
    "_id": ObjectId("52725f15bc0f5aa42a000004"),
    "characters": [
      {
        "object_id": ObjectId("527260e4b3d397a020000008")
      }
    ],
    "position": {
      "x": NumberInt(7230),
      "y": NumberInt(6313),
      "z": NumberInt(-26165)
    },
    "rotation": {
      "x": NumberInt(0),
      "y": NumberInt(3),
      "z": NumberInt(0)
    },
    "scene_id": ObjectId("526fae95ba40eb100a000001"),
    "ships": [
      {
        "object_id": ObjectId("527263d4b3d397a020000009")
      }
    ],
    "username": "Saggy"
  });
  db.getCollection("users").insert({
    "__v": NumberInt(0),
    "_id": ObjectId("52725fe1aeefa92027000004"),
    "characters": [
      {
        "object_id": ObjectId("527260d7b3d397a020000007")
      }
    ],
    "position": {
      "x": -81.654967976659,
      "y": 1.7576373397718,
      "z": 105.59561194048
    },
    "rotation": {
      "x": NumberInt(0),
      "y": NumberInt(0),
      "z": NumberInt(0)
    },
    "scene_id": ObjectId("526faf72b3d397a020000000"),
    "ships": [
      
    ],
    "username": "Droopy"
  });