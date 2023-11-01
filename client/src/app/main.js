import { getGPUTier } from 'detect-gpu';

import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

import { scaleEffects, setupEffects } from './effects.js';
import { handleInteractions, handleViewportChange, handleExitSign } from './events.js';
import { setupBackwall, setupDesks } from './furniture.js';
import { setupTriggers, updateTriggers } from './triggers.js';
import { setupTweens, updateTweens, startTweening } from './tweens.js';

let csgEvaluator;
let stats;

let materials, darkMaterial;

// Create an object to talk to the application.
window.virtual_office = {

  /**
   * Primary scene camera
   * 
   * @memberof THREE.Camera
   */
  camera: false,

  /**
   * Orbit Controls
   * 
   * @memberof THREE.OrbitControls
   */
  controls: false,
  /**
   * Debug mode.
   * 
   * @memberof Boolean
   */
  debug: false,

  /**
   * Effects composers and their layers.
   * 
   * @memberof Object { THREE.EffectsComposer , THREE.Layer }
   */
  effects: {
    main: false,
    bloom: false,
    bloomLayer: false,
    scaleDone: false
  },

  /**
   * Exit sign.
   * 
   * @todo: Consolidate scene rigs.
   * 
   * @memberOf function
   */
  exitSignClick: false,

  /**
   * Fast mode (bloom off, no shadows)
   * 
   * @memberof Boolean
   */
  fast: true,

  /**
   * Frames Per Second (FPS)
   * 
   * @memberof Integer
   */
  fps: 0,

  /**
   * Initialise.
   */
  init: init,

  /**
   * Reusable loaders for assets.
   */
  loaders: {
    gltf: false,
    texture: false,
    stats: {
      fonts: {
        target: 5, // @todo: Check if this affects double loads, shouldn't with caching.
        loaded: 0
      },
      gtlf: {
        target: 10, // @todo: Check if this affects double loads, shouldn't with caching.
        loaded: 0
      },
      screens: {
        target: 5,
        loaded: 0
      },
      svg: {
        target: 1,
        loaded: 0
      },
      textures: {
        target: 9,
        loaded: 0
      }
    }
  },

  /**
   * Camera is being moved by tweening.
   * 
   * @memberof Boolean
   */
  moving: false,

  /**
   * Current position of the users pointer.
   * 
   * @memberof THREE.Vector2
   */
  pointer: false,

  /**
   * Raycaster that projects into the scene from the users pointer and picks up collisions for interaction.
   * 
   * @memberof THREE.Raycaster
   */
  raycaster: false,

  /**
   * Ready to begin.
   */

  ready: false,

  /**
   * Renderers that create the scene.
   * 
   * @memberof Object { THREE.Renderer , ... }
   */
  renderers: {
    webgl: false
  },

  /**
   * Screens / iframe pages
   */
  screens: {
    720: {
      slug: 'about_us',
      title: 'About Us',
      mesh: false,
      type: 'tv',
    },
		0: {
      slug: 'case_studies',
      title: 'Case Studies',
      mesh: false,
      type: 'monitor',
    },
		3: {
      slug: 'contact_us',
      title: 'Contact Us',
      mesh: false,
      type: 'monitor',
    },
		2: {
      slug: 'portfolio',
      title: 'Portfolio',
      mesh: false,
      type: 'monitor',
    },
		1: {
      slug: 'services',
      title: 'Services',
      mesh: false,
      type: 'monitor',
    },
  },

  /**
   * Settings that controls the scene.
   * 
   * @memberof Object
   */
  settings: {
    adjusted_gap: false, // calculated value
    gap: 1.3, // depth(z axis) gap between desks
    light: {
      fast: {
        desk: {
          normal: 0.015, active: 0.05
        },
        neonSign: {
          normal: 0.35, active: 0.05
        }
      },
      highP: {
        desk: {
          normal: 0.015, active: 0.035
        },
        neonSign: {
          normal: 0.1, active: 0.05
        }
      }
      
    },
    room_depth: false, // calculated value
    scale: 11, // do not change, braeks css screen sizes
    startPosZ: - 10 // updated responsive eugene levy
  },

  /**
   * The main scene container.
   * 
   * @memberof THREE.Scene
   */
  scene: false,

  /**
   * Tracked meshes and mesh groups that compose the scene.
   * 
   * @memberof Object
   */
  scene_objects: { },
  
  /**
   * Currently selected object.
   * 
   * @memberof THREE.Object3d
   */
  selected: false,

  /**
   * If the main sequence has begun.
   * 
   * @memberof Boolean
   */
  started: false,

  /**
   * All scene triggers.
   * 
   * @memberof Object
   */
  triggers: {},
  
  /**
   * All scene tweens.
   * 
   * @memberof Object
   */
  tweens: {}
};


/**
 * Screen lookups
 */
window.virtual_office.screen_ids =  {
  0: window.virtual_office.screens.services,
  1: window.virtual_office.screens.services,
  2: window.virtual_office.screens.services,
  3: window.virtual_office.screens.services,
  720: window.virtual_office.screens.about_us,
};

export default async function init() {

  let pane;

  let url = new URL(window.location.href);

  // Check if we're in debug mode.
  if (url.searchParams.has('debug')) {
    window.virtual_office.debug = true;

    // Start the UI.
    pane = debug_ui();
  }

  // Check if we're in fast mode.
  if (url.searchParams.has('fast')) {
    window.virtual_office.fast = true;
  }
  else {
    // Run scaling
    const gpuTier = await getGPUTier();

    if (gpuTier && gpuTier.tier && gpuTier.tier >= 3) {
      // Enable effects
      window.virtual_office.fast = false;
    }
  }

  window.virtual_office.loaders.gtlf = new GLTFLoader();
  window.virtual_office.loaders.texture =  new THREE.TextureLoader();

  // Constructive Solid Geometry (csg) Evaluator.
  csgEvaluator = new Evaluator();
  csgEvaluator.useGroups = true;

  // Size
  window.virtual_office.settings.adjusted_gap = calculateAdjustedGapSize();
  window.virtual_office.room_depth = 8 * window.virtual_office.settings.adjusted_gap;

  // Setup renderers.
  setupRenderers();

  // Camera.
  var width = window.innerWidth;
  var height = window.innerHeight;
  var aspect = width / height;
  var fov = setCameraFOV(aspect);
  window.virtual_office.camera = new THREE.PerspectiveCamera(fov, aspect, 1, 1000);
  window.virtual_office.camera.aspect = width / height;
  
  if (aspect < 0.88) {
    window.virtual_office.settings.startPosZ = -5;
  }
  window.virtual_office.camera.position.set(0, 10.775, window.virtual_office.settings.startPosZ + (window.virtual_office.room_depth / 2));
  
  // Reusable pointer for tracking user interaction.
  window.virtual_office.pointer = new THREE.Vector3(); 

  // Reusable raycaster for tracking what the user tried to hit.
  window.virtual_office.raycaster = new THREE.Raycaster();

  // Scene Setup. 
  setupScene();


  if (window.virtual_office.debug) {
    const helper = new THREE.CameraHelper(window.virtual_office.camera);

    window.virtual_office.scene.add(helper);
  }

  // Bloom effect materials.
  darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
  materials = {};

  window.virtual_office.controls = new OrbitControls(window.virtual_office.camera, window.virtual_office.renderers.webgl.domElement);
  window.virtual_office.controls.enabled = window.virtual_office.debug;
  window.virtual_office.controls.target.set(0, 10, 0);
  window.virtual_office.controls.update();

  if (window.virtual_office.debug) {
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  
  window.addEventListener('orientationchange', handleViewportChange);
  window.addEventListener('resize', handleViewportChange);

  document.getElementById('exitSign').addEventListener('click', handleExitSign);
  document.getElementById('exitSign').addEventListener('touchend', handleExitSign);

  function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    window.virtual_office.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    window.virtual_office.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

  }

  window.virtual_office.renderers.webgl.domElement.addEventListener('pointermove', onPointerMove);

  function onTouchStart(event) {
    if (!window.virtual_office.selected) {
      event.preventDefault();

      window.virtual_office.pointer.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      window.virtual_office.pointer.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
      window.virtual_office.pointer.z = 1; // previously mouseDown = true
    }
  }
  function onTouchEnd(event) {
    if (!window.virtual_office.selected) {
      event.preventDefault();

      window.virtual_office.pointer.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      window.virtual_office.pointer.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
      window.virtual_office.pointer.z = 0; // previously mouseDown = false
    }
  }

  window.virtual_office.renderers.webgl.domElement.addEventListener('touchstart', onTouchStart, false);
  window.virtual_office.renderers.webgl.domElement.addEventListener('touchend', onTouchEnd, false);

  function onMouseDown(event) {
    window.virtual_office.pointer.z = 1; // previously mouseDown = true
  }

  function onMouseUp(event) {
    window.virtual_office.pointer.z = 0; // previously mouseDown = false
  }

  // Attach the mouse down and up event listeners
  window.virtual_office.renderers.webgl.domElement.addEventListener("pointerdown", onMouseDown, false);
  window.virtual_office.renderers.webgl.domElement.addEventListener("pointerup", onMouseUp, false);

}

export function setCameraFOV(aspect) {
  var fov;

  var threshold = 0.88;

  if (aspect < threshold) {
    // Portrait or square orientation
    fov = mapRange(aspect, 0.5, threshold, 60, 60);
  } else {
    // Widescreen orientation
    if (aspect < 2) {
      // Tolerance for square to widescreen transition
      fov = mapRange(aspect, threshold, 2, 60, 45);
    } else {
      if (aspect < 2.25) {
        fov = mapRange(aspect, 2, 2.25, 45, 40);
      }
      else {
        if (aspect < 3) {
          fov = mapRange(aspect, 2.25, 5, 40, 90);
        }
        else {
          fov = 90;
        }

      }
    }
  }

  return fov;
}

export function animate(currentTime) {

  updateFPS();

  requestAnimationFrame(animate);

  if (window.virtual_office.started) {

    updateTriggers(currentTime);

    updateTweens(currentTime);

    if (!window.virtual_office.debug && window.matrix_scene.complete ) {
      handleInteractions( );
    }

    window.virtual_office.scene_objects.desk_labels.forEach( (desk_label, index) => {
      const phaseShift = index * (Math.PI / 2); // Adjust the phase shift as needed
      const yOffset = Math.sin(currentTime * 0.0025 + phaseShift) * .010; // Adjust the amplitude (10 in this case)

      // Update the label's position based on the calculated yOffset
      desk_label.mesh.position.y = desk_label.originalPosition.y + yOffset;
    } );

  }

  if (window.virtual_office.debug) {
    stats.update();
  }

  // Render the composer
  if (
    // Effects loaded.
    window.virtual_office.effects.bloomLayer.test &&
    (window.virtual_office.effects.bloom && window.virtual_office.effects.bloom.passes && window.virtual_office.effects.bloom.passes.length > 0 ) &&
    (window.virtual_office.effects.main && window.virtual_office.effects.main.passes && window.virtual_office.effects.main.passes.length > 0 ) &&
    // Not fast mode.
    (!window.virtual_office.fast)
  ) {
    window.virtual_office.scene.traverse(darkenNonBloomed);
    window.virtual_office.effects.bloom.render();
    window.virtual_office.scene.traverse(restoreMaterial);
    window.virtual_office.effects.main.render();
  } else {
    window.virtual_office.renderers.webgl.render(window.virtual_office.scene, window.virtual_office.camera); // Render the scene without the effects
  }

}

function debug_ui() {
  const PARAMS = {
    factor: 123,
    title: 'hello',
    color: '#ff0055',
  };
  
  const pane = new Tweakpane.Pane();
  
  pane.addInput(PARAMS, 'factor');
  pane.addInput(PARAMS, 'title');
  pane.addInput(PARAMS, 'color');

  return pane;
}

// Function to map a value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

let frameCount = 0;
let lastTime = performance.now();

function updateFPS() {
  // Calculate FPS
  const currentTime = performance.now();
  const timeDiff = currentTime - lastTime;
  frameCount++;
  if (timeDiff >= 1000) {
    window.virtual_office.fps = Math.round((frameCount * 1000) / timeDiff);
    frameCount = 0;
    lastTime = currentTime;
  }
}

function darkenNonBloomed(obj) {

  if (obj.isMesh && window.virtual_office.effects.bloomLayer.test(obj.layers) === false) {

    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;

  }

}

function restoreMaterial(obj) {

  if (materials[obj.uuid]) {

    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];

  }

}

export function calculateAdjustedGapSize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Adjust gap size based on the aspect ratio
  var adjustedGapSize = window.virtual_office.settings.gap * window.virtual_office.settings.scale;
  if (width < height) {
    adjustedGapSize *= height / width;
  }

  return adjustedGapSize;
}

// Create door geometry
export var doorWidth = 8.2;
export var doorHeight = 20.4;
export var doorDepth = 0.2;
async function createDoor( ) {
  var doorParent = new THREE.Object3D();

  await window.virtual_office.loaders.texture.load('./assets/models/desk-diffuse.jpg', async (doorTexture) => {
    doorTexture.wrapS = THREE.RepeatWrapping;
    doorTexture.wrapT = THREE.RepeatWrapping;
    doorTexture.repeat.set( doorWidth / 8, doorHeight / 8 );

    var doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);

    // Create door material
    var doorMaterial = new THREE.MeshLambertMaterial({ map: doorTexture, name: 'door' });

    // Create door mesh
    var door = new THREE.Mesh(doorGeometry, doorMaterial);
    // Set initial position and rotation of the door
    door.position.set(doorWidth / 2, 0, 0);
    door.updateMatrixWorld();

    doorParent.add(door);

    const frameGroup = new THREE.Group();
    frameGroup.name = "doorFrame";
    frameGroup.position.z = - 15 + (window.virtual_office.room_depth / 2);

    var frameWidth = 0.4;
    var frameDepth = 0.4;

    // Create the top of the door frame geometry
    var topFrameGeometry = new THREE.BoxGeometry(doorWidth + 2 * frameWidth, frameWidth, frameDepth);

    // Create the top of the door frame mesh
    var topFrame = new THREE.Mesh(topFrameGeometry, doorMaterial);

    // Position the top of the door frame above the door
    topFrame.position.set(0 ,  5 + (doorHeight / 2) + frameWidth, 0);
    frameGroup.add(topFrame);

    // Create the sides of the door frame geometry
    var sideFrameGeometry = new THREE.BoxGeometry(frameWidth, doorHeight + frameWidth, frameDepth);

    // Create the door frame material (you can change the color or add a texture here)
    var doorFrameMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

    // Create the left side of the door frame mesh
    var leftSideFrame = new THREE.Mesh(sideFrameGeometry, doorMaterial);

    // Position the left side of the door frame to the left of the door
    leftSideFrame.position.set(-(doorWidth / 2)  - frameWidth /2, - 5 + (doorHeight / 2) - frameWidth/2, 0);
    frameGroup.add(leftSideFrame);

    // Create the right side of the door frame mesh
    var rightSideFrame = new THREE.Mesh(sideFrameGeometry, doorMaterial);

    // Position the right side of the door frame to the right of the door
    rightSideFrame.position.set((doorWidth / 2) + frameWidth /2, - 5 + (doorHeight / 2) - frameWidth/2, 0);
    frameGroup.add(rightSideFrame);

    window.virtual_office.scene_objects.door_frame = frameGroup;
    
    window.virtual_office.scene.add(window.virtual_office.scene_objects.door_frame);

    window.virtual_office.loaders.stats.textures.loaded ++;
    window.virtual_office.scene.visible = true;

  });

  // instantiate a loader
  const loader = new SVGLoader();

  await loader.load("./assets/logo.svg", async function (data) {

    const group = new THREE.Group();
    group.scale.multiplyScalar(0.0025);
    group.position.x = 1.35;
    group.position.y = 7.5;
    group.position.z = 0.15;
    group.scale.y *= - 1;

    let renderOrder = 0;

    for (const path of data.paths) {

      // Grab the desired color from the SVG fill.
      const fillColor = path.userData.style.fill;

      if ( fillColor !== undefined && fillColor !== 'none') {

        const material = new THREE.MeshLambertMaterial({
          emissiveIntensity: 0,
          emissive: new THREE.Color().setStyle(fillColor)
        });

        const shapes = SVGLoader.createShapes(path);

        for (const shape of shapes) {

          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.renderOrder = renderOrder++;
          mesh.layers.enable(1);

          group.add(mesh);
        }

      }

      const strokeColor = path.userData.style.stroke;

      if ( strokeColor !== undefined && strokeColor !== 'none') {

        const material = new THREE.MeshLambertMaterial({
          emissiveIntensity: 0,
          emissive: new THREE.Color().setStyle(strokeColor)
        });
        path.userData.style.strokeWidth *= 2;
        for (const subPath of path.subPaths) {
          const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
          
          if (geometry) {

            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = renderOrder++;
            mesh.layers.enable(1);

            group.add(mesh);

          }

        }

      }

    }
    window.virtual_office.scene_objects.door_sign = group;

    doorParent.add(group);
    let backWallLogo = group.clone();
    backWallLogo.scale.multiplyScalar(2.5);
    backWallLogo.position.x = -6.85;
    backWallLogo.position.y = 28.5;
    backWallLogo.position.z = 1.5;
    backWallLogo.name = 'backWallLogo';

    window.virtual_office.scene_objects.wallGroup.add(backWallLogo);

    window.virtual_office.loaders.stats.svg.loaded ++;
  });


  // Add the door to the scene
  return doorParent;
}

export async function createOfficeRoom() {

  var doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
  const transparentMaterial = new THREE.MeshLambertMaterial({
    opacity: 0,
    transparent: true
  });

  const doorBrush = new Brush(doorGeometry, transparentMaterial);
  doorBrush.position.set(-doorWidth / 2, - 5 + (doorHeight / 2), - 15 + (window.virtual_office.room_depth / 2));
  doorBrush.position.x += 4.1;
  doorBrush.updateMatrixWorld();

  const roomWidth = 80;
  const roomHeight = 37.5;
  const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, window.virtual_office.room_depth);

  // Create two materials: one for the floor face and one for the other faces
  const floorMaterial = new THREE.MeshPhongMaterial({
    shininess: 5,
    side: THREE.DoubleSide
  });
  floorMaterial.name = 'floor';

  await window.virtual_office.loaders.texture.load('./assets/textures/EAK309.png', async (floorTexture) => {
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 8, 8 );
    floorMaterial.map = floorTexture;
    floorMaterial.needsUpdate = true;
    window.virtual_office.loaders.stats.textures.loaded ++;

    const geometry = new THREE.PlaneGeometry( roomWidth, roomWidth );
    const plane = new THREE.Mesh( geometry, floorMaterial );
    plane.position.z = window.virtual_office.room_depth / 2;
    plane.position.y = -5.1;
    plane.rotation.x = Math.PI / 2;
    window.virtual_office.scene.add( plane );

  });

  // Create two materials: one for the floor face and one for the other faces
  const ceilMaterial = new THREE.MeshLambertMaterial({
    aoMapIntensity: 1.5,
    //map: ceilTexture,
    //normalMap: ceilNormal,
    normalScale: new THREE.Vector2(7.5, 7.5),
    side: THREE.DoubleSide
  });
  ceilMaterial.name = 'ceiling';

  await window.virtual_office.loaders.texture.load('./assets/textures/Ceiling_Drop_Tiles_001_height.png', async (ceilHeight) => {
    ceilHeight.wrapS = THREE.RepeatWrapping;
    ceilHeight.wrapT = THREE.RepeatWrapping;
    ceilHeight.repeat.set( 4, 4 );
    ceilMaterial.displacementMap = ceilHeight;
    ceilMaterial.needsUpdate = true;
    window.virtual_office.loaders.stats.textures.loaded ++;
  });

  await window.virtual_office.loaders.texture.load('./assets/textures/Ceiling_Drop_Tiles_001_ambientOcclusion.jpg', async (ceilAO) => {
    ceilAO.wrapS = THREE.RepeatWrapping;
    ceilAO.wrapT = THREE.RepeatWrapping;
    ceilAO.repeat.set( 4, 4 );
    ceilMaterial.aoMap = ceilAO;
    ceilMaterial.needsUpdate = true;
    window.virtual_office.loaders.stats.textures.loaded ++;
  } );

  await window.virtual_office.loaders.texture.load('./assets/textures/Ceiling_Drop_Tiles_001_basecolor.jpg', async (ceilTexture) => {
    ceilTexture.wrapS = THREE.RepeatWrapping;
    ceilTexture.wrapT = THREE.RepeatWrapping;
    ceilTexture.repeat.set( 4, 4 );
    ceilMaterial.map = ceilTexture;
    ceilMaterial.needsUpdate = true;
    window.virtual_office.loaders.stats.textures.loaded ++;
  } );
  

  await window.virtual_office.loaders.texture.load('./assets/textures/Ceiling_Drop_Tiles_001_normal.jpg', async (ceilNormal) => {
    ceilNormal.wrapS = THREE.RepeatWrapping;
    ceilNormal.wrapT = THREE.RepeatWrapping;
    ceilNormal.repeat.set( 4, 4 );
    ceilMaterial.normalMap = ceilNormal;
    ceilMaterial.needsUpdate = true;
    window.virtual_office.loaders.stats.textures.loaded ++;
  });

  const backwallMaterial = new THREE.MeshStandardMaterial({
    alphaTest: 0.99,
    aoMapIntensity: .5,
    color: 0xa0adaf,
    displacementScale: 0.001,
    name: 'backwall',
    opacity: 1,
    side: THREE.DoubleSide,
    transparent: true
  });
  
  const sidewallMaterial = backwallMaterial.clone();  
  sidewallMaterial.name = 'sidewall';

  await window.virtual_office.loaders.texture.load('./assets/textures/brick_wall_001_displacement_4k.jpg', async ( backwallHeight ) => {
    backwallHeight.wrapS = THREE.RepeatWrapping;
    backwallHeight.wrapT = THREE.RepeatWrapping;
    backwallHeight.repeat.set( roomWidth / 10, roomHeight / 10 );
    backwallMaterial.aoMap = backwallHeight;
    backwallMaterial.displacementMap = backwallHeight;
    backwallMaterial.needsUpdate = true;

    const sideWallHeight = backwallHeight.clone();
    sideWallHeight.repeat.set( window.virtual_office.room_depth / 10, roomHeight / 10  );  
    sidewallMaterial.aoMap = sideWallHeight;
    sidewallMaterial.displacementMap = sideWallHeight;

    sidewallMaterial.needsUpdate = true;

    window.virtual_office.loaders.stats.textures.loaded ++;
  });

  await window.virtual_office.loaders.texture.load('./assets/textures/brick_wall_001_nor_gl_4k.jpg', async ( backwallNormal ) => {
    backwallNormal.wrapS = THREE.RepeatWrapping;
    backwallNormal.wrapT = THREE.RepeatWrapping;
    backwallNormal.repeat.set( roomWidth / 10, roomHeight / 10 );
    backwallMaterial.normalMap = backwallNormal;
    backwallMaterial.needsUpdate = true;

    const sideWallNormal = backwallNormal.clone();
    sideWallNormal.repeat.set( window.virtual_office.room_depth / 10, roomHeight / 10  );
    sidewallMaterial.normalMap = sideWallNormal;
    sidewallMaterial.needsUpdate = true;

    window.virtual_office.loaders.stats.textures.loaded ++;
  });

  await window.virtual_office.loaders.texture.load('./assets/textures/brick_wall_001_rough_4k.jpg', async ( backwallRough ) => {
    backwallRough.wrapS = THREE.RepeatWrapping;
    backwallRough.wrapT = THREE.RepeatWrapping;
    backwallRough.repeat.set( roomWidth / 10, roomHeight / 10 );
    backwallMaterial.roughnessMap = backwallRough;
    backwallMaterial.needsUpdate = true;

    const sideWallRough = backwallRough.clone();
    sideWallRough.repeat.set( window.virtual_office.room_depth / 10, roomHeight / 10  );
    sidewallMaterial.roughnessMap = sideWallRough;
    sidewallMaterial.needsUpdate = true;

    window.virtual_office.loaders.stats.textures.loaded ++;
  
  });

  const materials = [
    // Right
    sidewallMaterial,
    // Left
    sidewallMaterial,
    // Ceiling
    ceilMaterial,
    // Floor
    floorMaterial,
    // Front
    backwallMaterial,
    // Back
    backwallMaterial
  ];

  const roomBrush = new Brush(roomGeometry, materials);
  roomBrush.position.y = 13.75;
  roomBrush.position.z = -15;

  roomBrush.updateMatrixWorld();

  let result = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial()
  );

  csgEvaluator.evaluate(roomBrush, doorBrush, SUBTRACTION, result);
  result.receiveShadow = true;
  result.layers.enable(1);

  return result;
}

async function setupScene() {
  
  // Scene container.
  window.virtual_office.scene = new THREE.Scene();
  window.virtual_office.scene.visible = false;

  if  (! window.virtual_office.fast) {
    window.virtual_office.renderers.webgl.shadowMap.enabled = true;
    setupEffects( );
  }

  window.virtual_office.scene_objects.wallGroup = await setupBackwall( );
  window.virtual_office.scene_objects.wallGroup.position.z = - 15 - window.virtual_office.room_depth / 2;
  window.virtual_office.scene.add(window.virtual_office.scene_objects.wallGroup);
  window.virtual_office.scene.add(window.virtual_office.scene_objects.tvWebGL);


  window.virtual_office.scene_objects.door = await createDoor( );
  window.virtual_office.scene_objects.door.position.set(-doorWidth / 2, - 5 + (doorHeight / 2), - 15 + (window.virtual_office.room_depth / 2));
  window.virtual_office.scene.add(window.virtual_office.scene_objects.door);


  window.virtual_office.scene_objects.deskGroup = await setupDesks(window.virtual_office.settings.gap, window.virtual_office.settings.scale);
  window.virtual_office.scene.add(window.virtual_office.scene_objects.deskGroup);

  // Adjust ambient light intensity
  window.virtual_office.scene_objects.ambientLight = new THREE.AmbientLight(window.virtual_office.fast ? 0x555555 : 0x444444); // Dim ambient light color
  window.virtual_office.scene.add(window.virtual_office.scene_objects.ambientLight);

  window.virtual_office.scene_objects.screens_loaded = 0;
  window.virtual_office.scene_objects.room = await createOfficeRoom( );
  window.virtual_office.scene.add(window.virtual_office.scene_objects.room);    

  // Setup triggers
  setupTriggers( );

  // Setup Tweens.
  setupTweens( );

  let loadersComplete = true;

  // Check if we've finished loading.
  let bootWaiter = setInterval( () => {
    
    // for ( var measure in window.virtual_office.loaders.stats ) {
    //   if (window.virtual_office.loaders.stats[measure].loaded != window.virtual_office.loaders.stats[measure].target) {
    //     loadersComplete = false;
    //   }
    // }
    if ( 
      loadersComplete &&
      // Check door sign is loaded up.
      window.virtual_office.scene_objects.door_sign
    ) {
      window.virtual_office.ready = true;
      clearTimeout(bootWaiter);

      // Start tweens.
      startTweening();

      requestAnimationFrame (animate);
    }
  }, 100 );

}

function setupRenderers() {

  // Main 3D webGL Renderer.
  window.virtual_office.renderers.webgl = new THREE.WebGLRenderer({ antialias: window.virtual_office.fast });
  window.virtual_office.renderers.webgl.setPixelRatio(window.devicePixelRatio);
  window.virtual_office.renderers.webgl.setSize(window.innerWidth, window.innerHeight);
  document.querySelector("#webgl").appendChild(window.virtual_office.renderers.webgl.domElement);

}
