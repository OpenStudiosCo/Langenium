/**
 * Vendor libs
 */
import { getGPUTier } from "detect-gpu";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Internal classes and helpers.
 */
import Controls from "./controls.js";
import Materials from "./materials.js";
import UI from "./ui.js";
import { handleViewportChange } from "./events.js";
import Multiplayer from "./multiplayer.js";
import Scenograph from "./scenograph.js";

/**
 * Custom materials.
 */
window.l.materials = new Materials();

/**
 * Multiplayer allows connecting to server.
 */
window.l.multiplayer = new Multiplayer();

/**
 * Scenograph controls the current scene
 */
window.l.scenograph = new Scenograph();

/**
 * Load up the overworld by default.
 */
window.l.current_scene = window.l.scenograph.load("Overworld");

window.l.select_box = function( object ) {
  // Remove any existing select boxes
  if (window.l.current_scene.scene_objects.select_box) {
    window.l.current_scene.scene.remove(window.l.current_scene.scene_objects.select_box);
    delete window.l.current_scene.scene_objects.select_box;
  }

  const box = new THREE.BoxHelper( object, 0xffff00 );
  window.l.current_scene.scene_objects.select_box = box;
  window.l.current_scene.scene.add(window.l.current_scene.scene_objects.select_box);

  window.l.current_scene.animation_queue.push(
    window.l.select_box_update
  );
}

window.l.select_box_update = function () {
  window.l.current_scene.scene_objects.select_box.position.copy( window.l.current_scene.scene_objects.select_box.object.position );
  window.l.current_scene.scene_objects.select_box.rotation.copy( window.l.current_scene.scene_objects.select_box.object.rotation );
  window.l.current_scene.scene_objects.select_box.update();
}

/**
 * Game client initialiser, called by window.l when it's finished loading.
 */
window.l.current_scene.init = async function () {
  window.l.current_scene.ui = new UI();

  let url = new URL(window.location.href);

  // Check if we should skip the logo title sequence.
  if (url.searchParams.has("skipintro")) {
    window.l.current_scene.skipintro = true;
  }

  // Check if we're in debug mode.
  if (url.searchParams.has("debug")) {
    window.l.current_scene.debug = true;
  }

  // Check if we're in fast mode.
  if (url.searchParams.has("fast")) {
    window.l.current_scene.fast = true;
  } else {
    // Run scaling
    const gpuTier = await getGPUTier();

    if (gpuTier && gpuTier.tier && gpuTier.tier >= 3) {
      // Enable effects
      window.l.current_scene.fast = false;
    }
  }

  window.l.current_scene.loaders.gtlf = new GLTFLoader();
  window.l.current_scene.loaders.object = new THREE.ObjectLoader();
  window.l.current_scene.loaders.texture = new THREE.TextureLoader();

  // Size
  window.l.current_scene.settings.adjusted_gap = calculateAdjustedGapSize();
  window.l.current_scene.room_depth =
    8 * window.l.current_scene.settings.adjusted_gap;

  // Setup renderers.
  setupRenderers();

  // Camera.
  var width = window.innerWidth;
  var height = window.innerHeight;
  var aspect = width / height;
  var fov = setCameraFOV(aspect);
  window.l.current_scene.camera = new THREE.PerspectiveCamera(
    fov,
    aspect,
    2.5,
    window.l.scale * 4
  );
  window.l.current_scene.camera.aspect = width / height;
  window.l.current_scene.camera.rotation.order = "YZX";

  if (aspect < 0.88) {
    window.l.current_scene.settings.startPosZ = -5;
  }
  window.l.current_scene.camera.position.set(
    0,
    10.775,
    window.l.current_scene.settings.startPosZ +
      window.l.current_scene.room_depth / 2
  );

  // Reusable pointer for tracking user interaction.
  window.l.current_scene.pointer = new THREE.Vector3();

  // Reusable raycaster for tracking what the user tried to hit.
  window.l.current_scene.raycaster = new THREE.Raycaster();

  // Scene Setup.
  window.l.current_scene.setup();

  // Bloom effect materials.
  window.l.current_scene.materials = {};

  // Activate controls
  window.l.controls = new Controls();
  
  window.addEventListener("orientationchange", handleViewportChange);
  window.addEventListener("resize", handleViewportChange);

  function onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    window.l.current_scene.pointer.x =
      (event.clientX / window.innerWidth) * 2 - 1;
    window.l.current_scene.pointer.y =
      -(event.clientY / window.innerHeight) * 2 + 1;
  }

  window.l.current_scene.renderers.webgl.domElement.addEventListener(
    "pointermove",
    onPointerMove
  );

  function onTouchStart(event) {
    if (!window.l.current_scene.selected) {
      event.preventDefault();

      window.l.current_scene.pointer.x =
        (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      window.l.current_scene.pointer.y =
        -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
      window.l.current_scene.pointer.z = 1; // previously mouseDown = true
    }
  }
  function onTouchEnd(event) {
    if (!window.l.current_scene.selected) {
      event.preventDefault();

      window.l.current_scene.pointer.x =
        (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      window.l.current_scene.pointer.y =
        -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
      window.l.current_scene.pointer.z = 0; // previously mouseDown = false
    }
  }

  window.l.current_scene.renderers.webgl.domElement.addEventListener(
    "touchstart",
    onTouchStart,
    false
  );
  window.l.current_scene.renderers.webgl.domElement.addEventListener(
    "touchend",
    onTouchEnd,
    false
  );

  function onMouseDown(event) {
    window.l.current_scene.pointer.z = 1; // previously mouseDown = true
  }

  function onMouseUp(event) {
    window.l.current_scene.pointer.z = 0; // previously mouseDown = false
  }

  // Attach the mouse down and up event listeners
  window.l.current_scene.renderers.webgl.domElement.addEventListener(
    "pointerdown",
    onMouseDown,
    false
  );
  window.l.current_scene.renderers.webgl.domElement.addEventListener(
    "pointerup",
    onMouseUp,
    false
  );
};

/**
 * Set camera FOV based on desired aspect ratio
 * 
 * @param {Float} aspect 
 * @returns {Float} fov
 */
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
      } else {
        if (aspect < 3) {
          fov = mapRange(aspect, 2.25, 5, 40, 90);
        } else {
          fov = 90;
        }
      }
    }
  }

  return fov;
}



/**
 * Function to map a value from one range to another
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Helper to calculate the desired gap size
 * 
 * Used to determine office room dimensions on different screen sizes/aspect ratios.
 */
export function calculateAdjustedGapSize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Adjust gap size based on the aspect ratio
  var adjustedGapSize =
    window.l.current_scene.settings.gap * window.l.current_scene.settings.scale;
  if (width < height) {
    adjustedGapSize *= height / width;
  }

  return adjustedGapSize;
}

/**
 * Setup 3D webgl renderer and configure it.
 */
function setupRenderers() {
  // Main 3D webGL Renderer.
  window.l.current_scene.renderers.webgl = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
    antialias: false,
    stencil: false,

    // disabled to prevent transparency issues on fast mode
    // depth: false
  });
  window.l.current_scene.renderers.webgl.setPixelRatio(window.devicePixelRatio);
  window.l.current_scene.renderers.webgl.setSize(
    window.innerWidth,
    window.innerHeight
  );
  document
    .querySelector("#webgl")
    .appendChild(window.l.current_scene.renderers.webgl.domElement);
}
