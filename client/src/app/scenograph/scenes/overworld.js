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
 * Scene objects
 */
import Bot from "@/scenograph/objects/bot";
import CargoShips from "@/scenograph/objects/cargo_ships";
import Extractors from "@/scenograph/objects/extractors";
import Ocean from "@/scenograph/objects/ocean";
import Platform from "@/scenograph/objects/platform";
import Refineries from "@/scenograph/objects/refineries";
import Sky from "@/scenograph/objects/sky";
import Sky2 from "@/scenograph/objects/sky2";
import Player from "@/scenograph/objects/player";


/**
 * Preloader objects
 */
import {
  createDoor,
  createOfficeRoom,
  doorHeight,
  doorWidth,
} from "@/scenograph/objects/office_room";

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

    this.objects.players = [];
  }

  async setup() {
    // Scene container.
    l.current_scene.scene = new THREE.Scene();
    l.current_scene.scene.visible = false;

    l.scenograph.effects.init();

    l.current_scene.objects.door = await createDoor();
    l.current_scene.objects.door.position.set(
      -doorWidth / 2,
      -5 + doorHeight / 2,
      -15 + l.current_scene.room_depth / 2
    );
    l.current_scene.scene.add( l.current_scene.objects.door );

    // Setup skybox
    l.current_scene.objects.sky = new Sky();
    l.current_scene.scene.add(
      l.current_scene.objects.sky.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.objects.sky.animate
    );

    // Setup skybox
    // l.current_scene.objects.sky = new Sky2();
    // l.current_scene.scene.add(
    //   l.current_scene.objects.sky.sky
    // );
    // l.current_scene.objects.sky.updateSettings();
    // l.current_scene.animation_queue.push(
    //   l.current_scene.objects.sky.animate
    // );

    // Setup Player
    l.current_scene.objects.player = new Player();
    await l.current_scene.objects.player.load();
    l.current_scene.scene.add(
      l.current_scene.objects.player.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.objects.player.animate
    );

    // let scale = 500;
    // let geometry = new THREE.BoxGeometry( scale, scale / 10, scale );
    // geometry.computeBoundingSphere();
    // let material = new THREE.MeshBasicMaterial( {
    //   color: 0xFF0000,
    //   visible: false
    // } );

    // l.current_scene.objects.boundaries = [];

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

		// 	l.current_scene.objects.boundaries.push( boundary );

    // }

    // Setup Bot
    // @todo: refactor to support more
    l.current_scene.objects.bot = new Bot();
    await l.current_scene.objects.bot.load();
    l.current_scene.scene.add(
      l.current_scene.objects.bot.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.objects.bot.animate
    );


    // Setup Platform
    l.current_scene.objects.platform = new Platform();
    await l.current_scene.objects.platform.load();
    l.current_scene.objects.platform.mesh.position.z = -65000;
    l.current_scene.objects.platform.mesh.position.x = -35000;
    l.current_scene.objects.platform.mesh.rotation.y = - Math.PI / 4;
    l.current_scene.scene.add(
      l.current_scene.objects.platform.mesh
    );
    l.current_scene.animation_queue.push(
      l.current_scene.objects.platform.animate
    );


    // Setup Extractors.
    let extractors = new Extractors();
    l.current_scene.objects.extractors = await extractors.getAll();

    l.current_scene.objects.extractors.forEach( async ( extractor, i ) => {
      l.current_scene.scene.add(
        extractor
      );
    } );

    l.current_scene.animation_queue.push(
      extractors.animate
    );

    // Setup Refineries.
    let refineries = new Refineries();
    l.current_scene.objects.refineries = await refineries.getAll();

    l.current_scene.objects.refineries.forEach( async ( refinery, i ) => {
      l.current_scene.scene.add(
        refinery
      );
    } );

    l.current_scene.animation_queue.push(
      refineries.animate
    );

    // Setup Cargo Ships.
    let cargo_ships = new CargoShips();
    await cargo_ships.getAll();
    l.current_scene.objects.cargo_ships = cargo_ships.instances;

    l.current_scene.objects.cargo_ships.forEach( async ( cargo_ship, i ) => {
      l.current_scene.scene.add(
        cargo_ship
      );
    } );
    // l.current_scene.scene.add(
    //   cargo_ships.pathLines
    // );

    l.current_scene.animation_queue.push(
      cargo_ships.animate
    );

    // Setup ocean
    l.current_scene.objects.ocean = new Ocean( extractors.extractorLocations );
    l.current_scene.scene.add(
      l.current_scene.objects.ocean.water
    );
    l.current_scene.animation_queue.push(
      l.current_scene.objects.ocean.animate
    );

    // Adjust ambient light intensity
    l.current_scene.objects.ambientLight = new THREE.AmbientLight(
      l.config.settings.fast ? 0x555555 : 0x444444
    ); // Dim ambient light color
    l.current_scene.objects.ambientLight.name = 'Main Light';
    l.current_scene.objects.ambientLight.intensity = Math.PI;
    l.current_scene.scene.add(
      l.current_scene.objects.ambientLight
    );

    l.current_scene.objects.screens_loaded = 0;
    l.current_scene.objects.room = await createOfficeRoom();
    l.current_scene.scene.add( l.current_scene.objects.room );

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
        l.current_scene.objects.door_sign
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
