/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers
 */
import l from '@/helpers/l.js';
import SceneBase from "@/scenograph/scenes/base";

/**
 * Scene assets
 */
import CargoShips from "@/scenograph/scenes/assets/cargo_ships";
import Extractors from "@/scenograph/scenes/assets/extractors";
import Ocean from "@/scenograph/scenes/assets/ocean";
import Platform from "@/scenograph/scenes/assets/platform";
import Refineries from "@/scenograph/scenes/assets/refineries";
import Sky from "@/scenograph/scenes/assets/sky";
import Ship from "@/scenograph/scenes/assets/ship";

/**
 * Preloader assets
 */
import {
  createDoor,
  createOfficeRoom,
  doorHeight,
  doorWidth,
} from "@/scenograph/scenes/assets/office_room";

/**
 * Scene controllers
 */
import { setupTriggers, updateTriggers } from "@/scenograph/triggers";
import {
  setupTweens,
  updateTweens,
  startTweening,
} from "@/scenograph/tweens";

/**
 * Main overworld
 */
export default class Overworld extends SceneBase {
  constructor() {
    super();

    this.scene_objects.ships = [];
  }

  animate( currentTime ) {
    updateFPS();

    if ( l.current_scene.started ) {
      if ( l.current_scene.animation_queue.length > 0 ) {
        for (
          var i = 0;
          i < l.current_scene.animation_queue.length;
          i++
        ) {
          l.current_scene.animation_queue[ i ]( currentTime );
        }
      }

      updateTriggers( currentTime );

      updateTweens( currentTime );
    }


    // Render the composer
    if (
      // Effects loaded.
      ( l.current_scene.effects.postprocessing.passes && l.current_scene.effects.postprocessing.passes.length > 0 ) &&
      // Not fast mode.
      ( !l.config.settings.fast )
    ) {
      l.current_scene.effects.postprocessing.render();
    } else {
      l.current_scene.renderers.webgl.render( l.current_scene.scene, l.scenograph.cameras.active ); // Render the scene without the effects
    }

    requestAnimationFrame( l.current_scene.animate );
  }

  async setup() {
    // Scene container.
    l.current_scene.scene = new THREE.Scene();
    l.current_scene.scene.visible = false;

    l.scenograph.effects.init();

    l.current_scene.scene_objects.door = await createDoor();
    l.current_scene.scene_objects.door.position.set(
      -doorWidth / 2,
      -5 + doorHeight / 2,
      -15 + l.current_scene.room_depth / 2
    );
    l.current_scene.scene.add( l.current_scene.scene_objects.door );

    // Setup skybox
    l.current_scene.scene_objects.sky = new Sky();
    l.current_scene.scene.add(
      l.current_scene.scene_objects.sky.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.scene_objects.sky.animate
    );

    // Setup Ship
    l.current_scene.scene_objects.ship = new Ship();
    await l.current_scene.scene_objects.ship.load();
    l.current_scene.scene.add(
      l.current_scene.scene_objects.ship.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.scene_objects.ship.animate
    );

    // Setup Platform
    l.current_scene.scene_objects.platform = new Platform();
    await l.current_scene.scene_objects.platform.load();
    l.current_scene.scene_objects.platform.mesh.position.z = -65000;
    l.current_scene.scene_objects.platform.mesh.position.x = -35000;
    l.current_scene.scene_objects.platform.mesh.rotation.y = - Math.PI / 4;
    l.current_scene.scene.add(
      l.current_scene.scene_objects.platform.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.scene_objects.platform.animate
    );


    // Setup Extractors.
    let extractors = new Extractors();
    l.current_scene.scene_objects.extractors = await extractors.getAll();

    l.current_scene.scene_objects.extractors.forEach( async ( extractor, i ) => {
      l.current_scene.scene.add(
        extractor
      );
    } );

    l.current_scene.animation_queue.push(
      extractors.animate
    );

    // Setup Refineries.
    let refineries = new Refineries();
    l.current_scene.scene_objects.refineries = await refineries.getAll();

    l.current_scene.scene_objects.refineries.forEach( async ( refinery, i ) => {
      l.current_scene.scene.add(
        refinery
      );
    } );

    l.current_scene.animation_queue.push(
      refineries.animate
    );

    // Setup Cargo Ships.
    let cargo_ships = new CargoShips();
    l.current_scene.scene_objects.cargo_ships = await cargo_ships.getAll();

    l.current_scene.scene_objects.cargo_ships.forEach( async ( cargo_ship, i ) => {
      l.current_scene.scene.add(
        cargo_ship
      );
    } );

    // Setup ocean
    l.current_scene.scene_objects.ocean = new Ocean( extractors.extractorLocations );
    l.current_scene.scene.add(
      l.current_scene.scene_objects.ocean.water
    );
    l.current_scene.animation_queue.push(
      l.current_scene.scene_objects.ocean.animate
    );

    // Adjust ambient light intensity
    l.current_scene.scene_objects.ambientLight = new THREE.AmbientLight(
      l.config.settings.fast ? 0x555555 : 0x444444
    ); // Dim ambient light color
    l.current_scene.scene_objects.ambientLight.name = 'Main Light';
    l.current_scene.scene_objects.ambientLight.intensity = Math.PI;
    l.current_scene.scene.add(
      l.current_scene.scene_objects.ambientLight
    );

    l.current_scene.scene_objects.screens_loaded = 0;
    l.current_scene.scene_objects.room = await createOfficeRoom();
    l.current_scene.scene.add( l.current_scene.scene_objects.room );

    // Setup triggers
    setupTriggers();

    // Setup Tweens.
    setupTweens();

    let loadersComplete = true;

    // Check if we've finished loading.
    let bootWaiter = setInterval( () => {
      // for ( var measure in l.current_scene.loaders.stats ) {
      //   if (l.current_scene.loaders.stats[measure].loaded != l.current_scene.loaders.stats[measure].target) {
      //     loadersComplete = false;
      //   }
      // }
      if (
        loadersComplete &&
        // Check door sign is loaded up.
        l.current_scene.scene_objects.door_sign
      ) {
        l.current_scene.ready = true;
        clearTimeout( bootWaiter );

        // Start tweens.
        startTweening();

        requestAnimationFrame( l.current_scene.animate );
      }
    }, 100 );
  }
}

function updateFPS() {
  // Calculate FPS
  l.current_scene.stats.currentTime = performance.now();
  const timeDiff =
    l.current_scene.stats.currentTime -
    l.current_scene.stats.lastTime;
  l.current_scene.stats.frameCount++;
  if ( timeDiff >= 1000 ) {
    l.current_scene.stats.fps = Math.round(
      ( l.current_scene.stats.frameCount * 1000 ) / timeDiff
    );
    l.current_scene.stats.frameCount = 0;
    l.current_scene.stats.lastTime =
      l.current_scene.stats.currentTime;
  }
}
