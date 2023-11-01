import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


/**
 * Setup Back Wall
 * 
 * @param { THREE.Scene } scene 
 * @returns { THREE.Group } wallGroup
 */
export async function setupBackwall ( ) {
  var wallGroup = new THREE.Group();
  
  // About Us Neon sign
  await createNeonSign(async (signMesh) => {
    // Position and rotate the sign
    signMesh.position.set(-6.4, 15, 1); // Example position for the sign
    signMesh.name = "neon_sign";
    window.virtual_office.scene_objects.neon_sign = signMesh;
    wallGroup.add(signMesh);
  });

  window.virtual_office.scene_objects.tvWebGL = await createScreen( 720 );
  window.virtual_office.scene_objects.tvWebGL.position.y = 8;
  window.virtual_office.scene_objects.tvWebGL.position.z = - 14 - window.virtual_office.room_depth / 2;
  window.virtual_office.scene_objects.tvWebGL.name = "tvWebGL";

  var screenGeometry = new THREE.BoxGeometry(20.8, 11.7, 0.02);
  var screenMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  var screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0 , 8, 0.5);
  screen.name = "tv";
  wallGroup.add(screen);

  wallGroup.name = "backWall";
  wallGroup.webGLScreen = window.virtual_office.scene_objects.tvWebGL;

  await window.virtual_office.loaders.gtlf.load( './assets/models/Small Monstera.glb', async function ( glb ) {
    let object = glb.scene.children[0];

    object.traverse( function ( child ) {

      if ( child.isMesh ) {
        child.castShadow = true;
      }

    } );

    object.name = 'plant';

    object.scale.setScalar(7.5);
    object.position.set(30, -5, window.virtual_office.settings.adjusted_gap);

    wallGroup.add(object);

    let plant_left = object.clone();
    plant_left.position.x = -plant_left.position.x;
    plant_left.rotation.y = - Math.PI /2 ;
    wallGroup.add(plant_left);

    window.virtual_office.loaders.stats.gtlf.loaded ++;

  });

  return wallGroup;
}

// Create the About Us neon sign.
function createNeonSign(callback) {
  const loader = new FontLoader();

  loader.load('./assets/fonts/Stigmature.json', (font) => {

    const textGeometry = new TextGeometry('about us', {
      font: font,
      size: 2.7,
      height: 0.5,
      curveSegments: 4
    });

    // Create the emissive material for the text
    var textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xDA68C5, emissiveIntensity: 1 });

    // Create the "About Us" sign mesh
    var signMesh = new THREE.Mesh(textGeometry, textMaterial);

    const lightActual = new THREE.PointLight( 0xDA68C5, 
      window.virtual_office.fast ?
      window.virtual_office.settings.light.fast.neonSign.normal :
      window.virtual_office.settings.light.highP.neonSign.normal
    );
    lightActual.position.set(5.5, 0.25, 5); // Set the position of the light
    lightActual.castShadow = true;

    //Set up shadow properties for the light
    // lightActual.shadow.mapSize.width = 32; // default
    // lightActual.shadow.mapSize.height = 32; // default

    if (window.virtual_office.debug) {
      const helper = new THREE.CameraHelper( lightActual.shadow.camera );
      window.virtual_office.scene.add( helper );
      // Create a directional light helper
      const lightHelper = new THREE.PointLightHelper(lightActual, 5); // The second parameter is the size of the helper
      window.virtual_office.scene.add(lightHelper);
    }

    signMesh.layers.enable(1);

    signMesh.add(lightActual);

    // Add the sign to the scene
    callback(signMesh);
    window.virtual_office.loaders.stats.fonts.loaded ++;
  });
}

export function brightenMaterial(material, amount) {

  if (material.map) {
    // Increase the brightness of the texture
    material.map.magFilter = THREE.LinearFilter; // Ensures smooth interpolation
    material.map.needsUpdate = true; // Update the material
  }
  
  amount = window.virtual_office.fast ? amount / 4 : amount;

  // Increase the brightness by adjusting the material color
  const brightness = amount; // Increase the value to make it brighter
  material.color.setRGB(
    material.color.r * brightness,
    material.color.g * brightness,
    material.color.b * brightness
  );

  return material;
}

// Uses createDesk and arranges them in the room.
export async function setupDesks(gapSize, scale) {
  // Create groups
  var deskGroup = new THREE.Group();
  window.virtual_office.scene_objects.desk_labels = [];
  for (var i = 0; i < 4; i++) {
    var desk = await createDesk( i );
    desk.rotation.y = Math.PI / 2;

    // Add screens.
    var screenWebGL = await createScreen( i );
    screenWebGL.rotation.y = - Math.PI / 2;
    screenWebGL.position.y = 7.7;
    desk.webGLScreen = screenWebGL;

    // Main position coordinates.
    if (i < 2) {
      desk.position.x = -(gapSize * scale) * 1.25;
      desk.rotation.y += Math.PI; // Rotate the desk on the left side
      updateDeskZ(desk, i);

      screenWebGL.position.x = -(gapSize * scale) - 3.25 ;
      screenWebGL.rotation.y = Math.PI / 4;
      updateDeskZ(screenWebGL, i);
      screenWebGL.position.z += .175;

    } else {
      desk.position.x = (gapSize * scale) * 1.25;
      updateDeskZ(desk, i);

      screenWebGL.position.x = (gapSize * scale) + 3.25;
      screenWebGL.rotation.y = - Math.PI / 4;
      updateDeskZ(screenWebGL, i);      
      screenWebGL.position.z += .175;
    }

    // Space the desks a bit out a wittle.
    if ( i == 0 || i == 3) {
      desk.position.x += 1.25;
    }
    if ( i == 1 || i == 2 ) {
      desk.position.x -= 1.25;
    }

    if ( i == 0 ) {
      screenWebGL.position.x += .5;
    }
    if ( i == 1 ) {
      screenWebGL.position.x -= 2;
    }

    if ( i == 2 ) {
      screenWebGL.position.x -= .5;
    }
    if ( i == 3 ) {
      screenWebGL.position.x += 2;
    }
  
    desk.scale.set(scale, scale, scale); // Scale up the desk

    desk.children.forEach((desk_iter) => {
      if (desk_iter.name == 'cpu' || desk_iter.name == 'screen' || desk_iter.name == 'base' ) {
        if ( i < 2 ) {
          desk_iter.rotation.y = - Math.PI / 4;
        }
        else {
          desk_iter.rotation.y = Math.PI / 4;
        }
        desk_iter.updateMatrixWorld();
      }
      if (desk_iter.type == 'DirectionalLight') {
        desk_iter.position.set(
          0,
          1.6,
          0
        );
        desk_iter.updateMatrixWorld();

        // //Create a helper for the shadow camera (optional)
        if (window.virtual_office.debug) {
          const helper = new THREE.CameraHelper( desk_iter.shadow.camera );
          window.virtual_office.scene.add( helper );
          // Create a directional light helper
          const lightHelper = new THREE.DirectionalLightHelper(desk_iter, 0.25); // The second parameter is the size of the helper
          window.virtual_office.scene.add(lightHelper);
        }

      }
    });

    desk.deskIndex = i; // hack for storing the webgl screens in the same group.
    deskGroup.add(desk);
    deskGroup.add(screenWebGL);

  }

   
  await window.virtual_office.loaders.gtlf.load( './assets/models/Office Chair.glb', async function ( glb ) {
    let object = glb.scene.children[0];

    object.scale.setScalar(12);

    object.traverse( function ( child ) {

      if ( child.isMesh ) {

        child.castShadow = true;
 
      }

    } );

    object.name = "chair";
    object.position.y = -5;
    object.rotation.y = - Math.PI /2;

    for (var i = 0; i < 4; i++) {
      let chair = object.clone();
      chair.deskIndex = i;
      updateDeskZ(chair, i);
      if (i < 2) {
        chair.rotation.y -= Math.PI; // Rotate the desk on the left side
        chair.position.x = -(gapSize * scale) * 0.7;
      }
      else {
        chair.position.x = (gapSize * scale) * 0.7;
      }

       // Space the desks a bit out a wittle.
      if ( i == 0 || i == 3) {
        chair.position.x += 1.25;
      }
      if ( i == 1 || i == 2 ) {
        chair.position.x -= 1.25;
      }

      // Final rotation tweaks to match design reference.
      switch (i) {
        case 0:
          chair.position.x -= gapSize * 4;
          chair.position.z += gapSize * 2;
          break;
        case 1:
          chair.position.x -= gapSize;
          chair.rotation.y += Math.PI / 8;
          chair.position.z += gapSize;
          break;
        case 2:
          chair.position.x += gapSize * 4;
          chair.rotation.y -= Math.PI / 12;
          chair.position.z -= gapSize * 2;
          break;
        case 3:
          chair.position.x += gapSize;
          chair.rotation.y -= Math.PI / 3;
          chair.position.z -= gapSize;
          break;
      }
      deskGroup.add( chair );
    }

    window.virtual_office.loaders.stats.gtlf.loaded ++;

  } );
  return deskGroup;
}

/**
 * Updates the Z position of a desk based on it's index in the group.
 * 
 * @param { THREE.Object3D } desk 
 * @param { Number } i 
 */
export function updateDeskZ(desk, i) {
    if (i < 2) {
    desk.position.z = - 15 + (i === 0 ? -1.5 : 0.5) * window.virtual_office.settings.adjusted_gap;
  } else {
    desk.position.z = - 15 + (i === 2 ? -1.5 : 0.5) * window.virtual_office.settings.adjusted_gap;
  }
}

/**
 * Create a desk containing a PC, desk and overhead office light.
 * 
 * @returns THREE.Group containing a desk workstation
 */
async function createDesk( i ) {
  var deskGroup = new THREE.Group();
  deskGroup.name = "desk";
 
  await window.virtual_office.loaders.gtlf.load( './assets/models/Desk.glb', async function ( glb ) {
    let object = glb.scene.children[0];
    
    let amount = window.virtual_office.fast ? 3 : 1.5;

    object.traverse( function ( child ) {

      if ( child.isMesh ) {

        child.castShadow = true;

        child.original_material = child.material.clone();
        
        brightenMaterial(child.material, amount);

      }

    } );
    object.position.y = -0.4555;
    object.rotation.y = - Math.PI ;
    object.name = "deskMesh";
    deskGroup.add(object);
    window.virtual_office.loaders.stats.gtlf.loaded ++;
  }); 

  // Add computer screen
  var screenGeometry = new THREE.BoxGeometry(0.64, 0.48, 0.02);
  var screenMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
  var screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 0.7, 0.05);
  screen.castShadow = true; //default is false
  screen.receiveShadow = false; //default
  screen.name = "screen";
  deskGroup.add(screen);

  // Add screen stand (formerly CPU)
  var cpuGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.025);
  var cpuMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  var cpu = new THREE.Mesh(cpuGeometry, cpuMaterial);
  cpu.position.set(0, 0.4, 0.0625);
  cpu.castShadow = true; //default is false
  cpu.receiveShadow = false; //default
  cpu.name = "cpu";
  deskGroup.add(cpu);

  // Add screen stand base.
  var baseGeo = new THREE.BoxGeometry(0.25, 0.01, 0.125);
  var base = new THREE.Mesh(baseGeo, cpuMaterial);
  base.position.set(0, 0.32, 0.0625);
  base.castShadow = true; //default is false
  base.receiveShadow = false; //default
  base.name = "base";
  deskGroup.add(base);

  var deskLabelCallback = (signMesh, i, deskGroup) => {
    signMesh.scale.setScalar( 0.1 );
    signMesh.geometry.computeBoundingBox();
    const boundingBox = signMesh.geometry.boundingBox;

    // Step 4: Extract dimensions from bounding box
    const width = boundingBox.max.x - boundingBox.min.x;

    signMesh.rotation.y = Math.PI;
    if ( i < 2 ) {
      signMesh.rotation.y -= Math.PI / 4;
      signMesh.translateX( - 0.05 - width / 20 );
    }
    else {
      signMesh.rotation.y += Math.PI / 4;
      signMesh.translateX( 0.05 - width / 20 );
    }

    signMesh.position.y = 1.1;

    signMesh.updateMatrixWorld();    

    deskGroup.add(signMesh);
  };
  await createDeskLabel( i, deskLabelCallback, deskGroup );

  await window.virtual_office.loaders.gtlf.load( './assets/models/Ceiling Light.glb', async function ( glb ) {
    let object = glb.scene.children[0];
    object.scale.setScalar(1);
    window.desk = object;
    let amount = window.virtual_office.fast ? 120 : 60;

    object.traverse( function ( child ) {

      if ( child.isMesh ) {

        child.castShadow = true;
        
        brightenMaterial(child.material, amount);

        if (child.name == "CUBezierCurve006_3") {

          // Create the overhead office light material
          var lightMaterial = new THREE.MeshPhongMaterial({
            color: 0x00EEff,
            emissive: 0x00EEff,
            emissiveIntensity: 100,
            shininess: 200
          });
  
          child.material = lightMaterial;

          child.layers.enable(1);
        }
        
      }

    } );
    object.position.set(0, 1.95, 0);
    object.name = "ceilLightMesh2";
    deskGroup.add(object);
    window.virtual_office.loaders.stats.gtlf.loaded ++;
  }); 

  const lightActual = new THREE.DirectionalLight(0x00EEff,
    window.virtual_office.fast ?
    window.virtual_office.settings.light.fast.desk.normal :
    window.virtual_office.settings.light.highP.desk.normal
  ); // Color: white
  lightActual.castShadow = true;
  lightActual.name = "ceilLightActual";

  lightActual.target = screen;

  deskGroup.add(lightActual);

  return deskGroup;
}


// Create the desks sign, i.e. "Projects"
async function createDeskLabel(i, callback, deskGroup) {

  // Add screen labels.
  let labelText = '';
  switch ( i ) {
    case 0:
      labelText = 'Case studies';  
      break;
    case 1:
      labelText = 'Services';      
      break;
    case 2:
      labelText = 'Portfolio';
      break;
    case 3:
      labelText = 'Contact us';
      break;
  }
  
  const loader = new FontLoader();

  await loader.load('./assets/fonts/VeraMono.json', async (font) => {

    const textGeometry = new TextGeometry(labelText, {
      font: font,
      size: 1.1,
      height: 0.2
    });

    // Create the emissive material for the text
    var textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x00EEff, emissiveIntensity: 0.5 });

    // Create the "About Us" sign mesh
    var signMesh = new THREE.Mesh(textGeometry, textMaterial);

    signMesh.layers.enable(1);

    signMesh.name = "desk_label";

    // Add the sign to the scene
    callback(signMesh, i, deskGroup);

    window.virtual_office.loaders.stats.fonts.loaded ++;
    window.virtual_office.scene_objects.desk_labels.push({
      mesh: signMesh,
      originalPosition: signMesh.position.clone()
    });
  });
}

/**
 * Create an iFrame based screen that will sit on top of a monitor.
 * 
 * @returns [ HTMLObject, THREE.Mesh ];
 */
async function createScreen( i ){
  const screen = window.virtual_office.screens[ i ];
  const slug    = screen.slug;
  const url     = '../assets/images/pages/' + slug + '.jpg',
        pageUrl = '../iframes/' + slug + '.html';
  
  var material = new THREE.MeshPhongMaterial();
  await window.virtual_office.loaders.texture.load(url, async (screenTexture)=>{
    material.needsUpdate = true;
    material.map = screenTexture;
  });
  var geometry = new THREE.PlaneGeometry(i == 720 ? 19.2 : 6.4, i == 720 ? 10.8 : 4.8);
  var screenWebGL = new THREE.Mesh(geometry, brightenMaterial(material, ( i==720 ? 12 : 8 )));

  // @todo: move into settings.
  screenWebGL.pageUrl = pageUrl;
  screenWebGL.pageTitle = screen.title;
  screenWebGL.pageRealUrl = '../' + slug + '.html';;
  
  //mesh.scale.copy( domObject.scale );
  screenWebGL.castShadow = false;
  screenWebGL.receiveShadow = true;

  screenWebGL.name = "screenWebGL";
  window.virtual_office.loaders.stats.screens.loaded ++;

  window.virtual_office.screens[ i ].mesh = screenWebGL;
  screenWebGL.settings = window.virtual_office.screens[ i ];
  screenWebGL.getViewingCoords = function (  ) {
    let tempMesh = new THREE.Object3D();
    tempMesh.scale.copy(this.scale);
    tempMesh.position.copy(this.position);
    
    var targetRotation = this.rotation.clone();
  
    const fovVertical = window.virtual_office.camera.fov * (Math.PI / 180);
    const fovHorizontal = 2 * Math.atan(Math.tan(fovVertical / 2) * window.virtual_office.camera.aspect);
    const distanceHorizontal = window.innerWidth / (2 * Math.tan(fovHorizontal / 2));
    
    const distanceFactor = this.settings.type == 'monitor' ? 0.00625 : 0.015;
  
    const diffZ = distanceHorizontal * distanceFactor;
  
    if (this.settings.type == 'monitor') {
      const roomSide = tempMesh.position.x > 0 ? -1 : 1;
      tempMesh.translateX(roomSide * diffZ / 1.4);
    }
  
    tempMesh.translateZ(diffZ / 1.4);
  
    return [ tempMesh.position, targetRotation ];
  };
  
  
  return screenWebGL ;
}

