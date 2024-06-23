/**
 * Vendor libs and base class.
 */
import * as THREE from "three";
import SceneBase from "./base";

/**
 * Scene assets
 */
import Extractor from "../scene_assets/extractor";
import Ocean from "../scene_assets/ocean";
import Platform from "../scene_assets/platform";
import Sky from "../scene_assets/sky";
import Ship from "../scene_assets/ship";

/**
 * Preloader assets
 */
import {
  createDoor,
  createOfficeRoom,
  doorHeight,
  doorWidth,
} from "../scene_assets/office_room";

/**
 * Scene controllers
 */
import { setupEffects } from "../effects";
import { setupTriggers, updateTriggers } from "../scene_assets/triggers";
import {
  setupTweens,
  updateTweens,
  startTweening,
} from "../scene_assets/tweens";

/**
 * Main overworld
 */
export default class Overworld extends SceneBase {
  constructor() {
    super();

    this.scene_objects.ships = [];
  }

  animate(currentTime) {
    updateFPS();

    if (window.l.current_scene.started) {
      if (window.l.current_scene.animation_queue.length > 0) {
        for (
          var i = 0;
          i < window.l.current_scene.animation_queue.length;
          i++
        ) {
          window.l.current_scene.animation_queue[i](currentTime);
        }
      }

      updateTriggers(currentTime);

      updateTweens(currentTime);
    }


    // Render the composer
    if (
      // Effects loaded.
      (window.l.current_scene.effects.postprocessing.passes && window.l.current_scene.effects.postprocessing.passes.length > 0) &&
      // Not fast mode.
      (!window.l.current_scene.fast)
    ) {
      window.l.current_scene.effects.postprocessing.render();
    } else {
      window.l.current_scene.renderers.webgl.render(window.l.current_scene.scene, window.l.current_scene.camera); // Render the scene without the effects
    }

    requestAnimationFrame(window.l.current_scene.animate);
  }

  async setup() {
    // Scene container.
    window.l.current_scene.scene = new THREE.Scene();
    window.l.current_scene.scene.visible = false;

    setupEffects();

    // Enable the effects layer, default of 11 for postprocessing bloom
    window.l.current_scene.camera.layers.enable(11);

    window.l.current_scene.scene_objects.door = await createDoor();
    window.l.current_scene.scene_objects.door.position.set(
      -doorWidth / 2,
      -5 + doorHeight / 2,
      -15 + window.l.current_scene.room_depth / 2
    );
    window.l.current_scene.scene.add(window.l.current_scene.scene_objects.door);

    // Setup skybox
    window.l.current_scene.scene_objects.sky = new Sky();
    window.l.current_scene.scene.add(
      window.l.current_scene.scene_objects.sky.mesh
    );
    window.l.current_scene.animation_queue.push(
      window.l.current_scene.scene_objects.sky.animate
    );

    // Setup ocean
    window.l.current_scene.scene_objects.ocean = new Ocean();
    window.l.current_scene.scene.add(
      window.l.current_scene.scene_objects.ocean.water
    );
    window.l.current_scene.animation_queue.push(
      window.l.current_scene.scene_objects.ocean.animate
    );

    // Setup Ship
    window.l.current_scene.scene_objects.ship = new Ship();
    await window.l.current_scene.scene_objects.ship.load();
    window.l.current_scene.scene.add(
      window.l.current_scene.scene_objects.ship.mesh
    );
    window.l.current_scene.animation_queue.push(
      window.l.current_scene.scene_objects.ship.animate
    );

    // Setup Platform
    window.l.current_scene.scene_objects.platform = new Platform();
    await window.l.current_scene.scene_objects.platform.load();
    window.l.current_scene.scene_objects.platform.mesh.position.y = 250;
    window.l.current_scene.scene_objects.platform.mesh.position.z = -25000;
    window.l.current_scene.scene_objects.platform.mesh.position.x = -25000;
    window.l.current_scene.scene_objects.platform.mesh.rotation.y = - Math.PI / 4;
    window.l.current_scene.scene.add(
      window.l.current_scene.scene_objects.platform.mesh
    );
    window.l.current_scene.animation_queue.push(
      window.l.current_scene.scene_objects.platform.animate
    );

    // Setup extractor
    window.l.current_scene.scene_objects.extractor = new Extractor();
    await window.l.current_scene.scene_objects.extractor.load();

    window.l.current_scene.scene_objects.extractor.mesh.rotation.y = Math.PI / 8;
    window.l.current_scene.scene_objects.extractor.mesh.position.y = -500;
    //window.l.current_scene.scene_objects.extractor.mesh.position.z = -1250;
    window.l.current_scene.scene.add(
      window.l.current_scene.scene_objects.extractor.mesh
    );

    // Update clipping plane positions to match parent object.
    // window.l.current_scene.scene_objects.extractor.clippingPlanes.forEach((element) => {
    //   element.translate( new THREE.Vector3( 0, -125, -1250 ));
    // });

    

    // // Enable clipping of the extractor out of the ocean water material.
    // window.l.current_scene.renderers.webgl.localClippingEnabled = true; // Needed to activate local clipping
    // window.l.current_scene.scene_objects.ocean.water.material.clippingPlanes =  window.l.current_scene.scene_objects.extractor.clippingPlanes;
    // console.log(window.l.current_scene.scene_objects.ocean.water.material.clippingPlanes);

    // // Create helpers to visualize clipping planes
    // const helpers = window.l.current_scene.scene_objects.ocean.water.material.clippingPlanes.map(plane => new THREE.PlaneHelper(plane, 2000, 0xff0000));
    // helpers.forEach(helper => window.l.current_scene.scene.add(helper));

    // Adjust ambient light intensity
    window.l.current_scene.scene_objects.ambientLight = new THREE.AmbientLight(
      window.l.current_scene.fast ? 0x555555 : 0x444444
    ); // Dim ambient light color
    window.l.current_scene.scene_objects.ambientLight.intensity = Math.PI;
    window.l.current_scene.scene.add(
      window.l.current_scene.scene_objects.ambientLight
    );

    window.l.current_scene.scene_objects.screens_loaded = 0;
    window.l.current_scene.scene_objects.room = await createOfficeRoom();
    window.l.current_scene.scene.add(window.l.current_scene.scene_objects.room);

    // Setup triggers
    setupTriggers();

    // Setup Tweens.
    setupTweens();

    let loadersComplete = true;

    // Check if we've finished loading.
    let bootWaiter = setInterval(() => {
      // for ( var measure in window.l.current_scene.loaders.stats ) {
      //   if (window.l.current_scene.loaders.stats[measure].loaded != window.l.current_scene.loaders.stats[measure].target) {
      //     loadersComplete = false;
      //   }
      // }
      if (
        loadersComplete &&
        // Check door sign is loaded up.
        window.l.current_scene.scene_objects.door_sign
      ) {
        window.l.current_scene.ready = true;
        clearTimeout(bootWaiter);

        // Start tweens.
        startTweening();

        requestAnimationFrame(window.l.current_scene.animate);
      }
    }, 100);
  }
}

function updateFPS() {
  // Calculate FPS
  window.l.current_scene.stats.currentTime = performance.now();
  const timeDiff =
    window.l.current_scene.stats.currentTime -
    window.l.current_scene.stats.lastTime;
  window.l.current_scene.stats.frameCount++;
  if (timeDiff >= 1000) {
    window.l.current_scene.stats.fps = Math.round(
      (window.l.current_scene.stats.frameCount * 1000) / timeDiff
    );
    window.l.current_scene.stats.frameCount = 0;
    window.l.current_scene.stats.lastTime =
      window.l.current_scene.stats.currentTime;
  }
}


function planesFromMesh( vertices, indices ) {

  // creates a clipping volume from a convex triangular mesh
  // specified by the arrays 'vertices' and 'indices'

  const n = indices.length / 3,
    result = new Array( n );

  for ( let i = 0, j = 0; i < n; ++ i, j += 3 ) {

    const a = vertices[ indices[ j ] ],
      b = vertices[ indices[ j + 1 ] ],
      c = vertices[ indices[ j + 2 ] ];

    result[ i ] = new THREE.Plane().
      setFromCoplanarPoints( a, b, c );

  }

  return result;

}

function createPlanes( n ) {

  // creates an array of n uninitialized plane objects

  const result = new Array( n );

  for ( let i = 0; i !== n; ++ i )
    result[ i ] = new THREE.Plane();

  return result;

}

function assignTransformedPlanes( planesOut, planesIn, matrix ) {

  // sets an array of existing planes to transformed 'planesIn'

  for ( let i = 0, n = planesIn.length; i !== n; ++ i )
    planesOut[ i ].copy( planesIn[ i ] ).applyMatrix4( matrix );

}

function cylindricalPlanes( n, innerRadius ) {

  const result = createPlanes( n );

  for ( let i = 0; i !== n; ++ i ) {

    const plane = result[ i ],
      angle = i * Math.PI * 2 / n;

    plane.normal.set(
      Math.cos( angle ), 0, Math.sin( angle ) );

    plane.constant = innerRadius;

  }

  return result;

}

const planeToMatrix = ( function () {

  // creates a matrix that aligns X/Y to a given plane

  // temporaries:
  const xAxis = new THREE.Vector3(),
    yAxis = new THREE.Vector3(),
    trans = new THREE.Vector3();

  return function planeToMatrix( plane ) {

    const zAxis = plane.normal,
      matrix = new THREE.Matrix4();

    // Hughes & Moeller '99
    // "Building an Orthonormal Basis from a Unit Vector."

    if ( Math.abs( zAxis.x ) > Math.abs( zAxis.z ) ) {

      yAxis.set( - zAxis.y, zAxis.x, 0 );

    } else {

      yAxis.set( 0, - zAxis.z, zAxis.y );

    }

    xAxis.crossVectors( yAxis.normalize(), zAxis );

    plane.coplanarPoint( trans );
    return matrix.set(
      xAxis.x, yAxis.x, zAxis.x, trans.x,
      xAxis.y, yAxis.y, zAxis.y, trans.y,
      xAxis.z, yAxis.z, zAxis.z, trans.z,
      0,	 0, 0, 1 );

  };

} )();


// A regular tetrahedron for the clipping volume:

const Vertices = [
    new THREE.Vector3( + 1, 0, + Math.SQRT1_2 ),
    new THREE.Vector3( - 1, 0, + Math.SQRT1_2 ),
    new THREE.Vector3( 0, + 1, - Math.SQRT1_2 ),
    new THREE.Vector3( 0, - 1, - Math.SQRT1_2 )
  ],

  Indices = [
    0, 1, 2,	0, 2, 3,	0, 3, 1,	1, 3, 2
  ],

  Planes = planesFromMesh( Vertices, Indices ),
  PlaneMatrices = Planes.map( planeToMatrix ),

  GlobalClippingPlanes = cylindricalPlanes( 5, 2.5 ),

  Empty = Object.freeze( [] );
