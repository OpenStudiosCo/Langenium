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
import Player from "@/scenograph/scenes/assets/player";
import Bot from "@/scenograph/scenes/assets/bot";

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

    this.scene_objects.players = [];
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

    // Setup Player
    l.current_scene.scene_objects.player = new Player();
    await l.current_scene.scene_objects.player.load();
    l.current_scene.scene.add(
      l.current_scene.scene_objects.player.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.scene_objects.player.animate
    );

    // let scale = 500;
    // let geometry = new THREE.BoxGeometry( scale, scale / 10, scale );
    // geometry.computeBoundingSphere();
    // let material = new THREE.MeshBasicMaterial( {
    //   color: 0xFF0000,
    //   visible: false
    // } );

    // l.current_scene.scene_objects.boundaries = [];

    // for (var i = 0; i < 4; i++) {
    //   let boundary = new THREE.Mesh( geometry, material.clone() );
    //   boundary.name = "Boundary";
    //   switch(i) {
    //     case 0:
    //       boundary.position.z = -scale;
    //       boundary.name += " ( North )";
    //       break;
    //     case 1:
    //       boundary.position.z = scale;
    //       boundary.name += " ( South )";
    //       boundary.material.color = new THREE.Color( 0x0000FF );
    //       break;
    //     case 2:
    //       boundary.position.x = -scale;
    //       boundary.name += " ( West )";
    //       boundary.material.color =  new THREE.Color( 0x00FF00 );
    //       break;
    //     case 3:
    //       boundary.position.x = scale;
    //       boundary.name += " ( East )";
    //       boundary.material.color = new THREE.Color( 0xFF00FF );
    //       break;
    //   }

    //   let boxHelper = new THREE.BoxHelper( boundary );
  
    //   l.current_scene.scene.add(
    //     boundary
    //   );
    //   l.current_scene.scene.add(
    //     boxHelper
    //   );

		// 	l.current_scene.scene_objects.boundaries.push( boundary );

    // }

    // Setup Bot
    // @todo: refactor to support more
    l.current_scene.scene_objects.bot = new Bot();
    await l.current_scene.scene_objects.bot.load();
    l.current_scene.scene.add(
      l.current_scene.scene_objects.bot.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.scene_objects.bot.animate
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
    l.current_scene.scene.add(
      cargo_ships.pathLines
    );

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

        requestAnimationFrame( l.scenograph.animate );
      }
    }, 100 );
  }
}
