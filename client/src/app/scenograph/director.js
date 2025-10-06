/**
 * Director.
 * 
 * Scene Management class.
 */

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers
 */
import l from '@/helpers/l.js';

/**
 * World Simulation 
 */
import World from '#/game/src/world';

/**
 * Scene controllers
 */
import { setupTriggers, updateTriggers } from "@/scenograph/triggers";
import {
  setupTweens,
  updateTweens,
  startTweening,
} from "@/scenograph/tweens";



export default class Director {
    constructor() {
      
      /**
       * Animation queue.
       */
      this.animation_queue = [];

      /**
       * Primary scene camera
       * 
       * @memberof THREE.Camera
       */
      this.camera = false;

      /**
       * Effects composers and their layers.
       * 
       * @memberof Object { postprocessing.EffectComposer }
       */
      this.effects = {
        particles: false,
        postprocessing: false
      };

      /**
       * Fast mode (bloom off, no shadows)
       * 
       * @memberof Boolean
       */
      this.fast = true;


      /**
       * Game world simulation.
       */
      this.world = false;

      /**
       * Reusable loaders for assets.
       */
      this.loaders = {
        gltf: false,
        object: false,
        texture: false,
        stats: {
          fonts: {
            target: 0, // @todo: Check if this affects double loads, shouldn't with caching.
            loaded: 0
          },
          gtlf: {
            target: 0, // @todo: Check if this affects double loads, shouldn't with caching.
            loaded: 0
          },
          screens: {
            target: 0,
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
        },

        /**
         * UI controller
         */
        ui: false
      };

      /**
       * Reusable materials for assets
       */
      this.materials = false;

      /**
       * Camera is being moved by tweening.
       * 
       * @memberof Boolean
       */
      this.moving = false;

      /**
       * Current position of the users pointer.
       * 
       * @memberof THREE.Vector2
       */
      this.pointer = false;

      /**
       * Raycaster that projects into the scene from the users pointer and picks up collisions for interaction.
       * 
       * @memberof THREE.Raycaster
       */
      this.raycaster = false;

      /**
       * Ready to begin.
       */

      this.ready = false;

      /**
       * Renderers that create the scene.
       * 
       * @memberof Object { THREE.Renderer , ... }
       */
      this.renderers = {
        webgl: false
      };

      /**
       * Settings that controls the scene.
       * 
       * @memberof Object
       */
      this.settings = {
        adjusted_gap: false, // calculated value
        game_controls: false, // show in-game control overlays.
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
      };

      
      /**
       * Currently selected object.
       * 
       * @memberof THREE.Object3d
       */
      this.selected = false;

      /**
       * Skip the intro sequence for this scene.
       */
      this.skipintro = false;

      /**
       * If the main sequence has begun.
       * 
       * @memberof Boolean
       */
      this.started = false;

      /**
       * Custom array of game performance stats.
       */
      this.stats = {
          /**
         * Frames Per Second (FPS)
         * 
         * @memberof Integer
         */
        currentTime: performance.now(),
        fps: 0,
        frameCount: 0,
        lastTime: performance.now(),
      };

      /**
       * All scene triggers.
       * 
       * @memberof Object
       */
      this.triggers = {};
      
      /**
       * All scene tweens.
       * 
       * @memberof Object
       */
      this.tweens = {};
    }

    // Load world instance from game classes.
    load( sceneName ) {
      this.world = new World( sceneName );
      
      return this;
    }

    // Load the objects in world instance to the current scene.
    async setup() {
      this.setupSceneDefaults();

      this.loadInstance();
  
      this.finishSetup();
    }

    async loadInstance() {
      this.world.instance.objects.forEach( async object => {
        if ( object.model == 'extractor' ) {
            l.scenograph.director.loadObject(
              object,
              await l.scenograph.objects.structures.extractor.get()
            );         
        }
      } );

      // this.world.instance.actors.forEach( actor => {
      //   if ( actor.class == 'cargoShip' ) {
          
      //   }
      //   console.log(actor);
      // } );

      //debugger;

      // Setup Player aircraft, used for the intro sequence.
      l.scenograph.actors.player.vehicle = new l.scenograph.objects.vehicles.valiant();
      await l.scenograph.actors.player.vehicle.load();
      l.current_scene.scene.add(
        l.scenograph.actors.player.vehicle.mesh
      );
      l.current_scene.animation_queue.push(
        l.scenograph.actors.player.vehicle.animate
      );

      // Setup Player person, used for the hangar scene.
      l.scenograph.actors.player.person = new l.scenograph.objects.vehicles.person();
      l.current_scene.scene.add(
        l.scenograph.actors.player.person.mesh
      );
      l.current_scene.animation_queue.push(
        l.scenograph.actors.player.person.animate
      );
      
    }

    async loadObject( config, object ) {
      object.position.x = config.position.x;
      object.position.y = config.position.y;
      object.position.z = config.position.z;

      object.name = config.name;

      // @todo: add to current_scene array relevant to object class.

      l.current_scene.scene.add(
        object
      );
    }

    /**
     * @todo: Make this dynamic and not hard codo
     */
    async temp_addPlayer() {

    }

    async setupSceneDefaults() {

      /**
       * Tracked meshes and mesh groups that compose the scene.
       * 
       * @memberof Object
       */
      l.current_scene.objects = {};

      /**
       * The main scene container.
       * 
       * @memberof THREE.Scene
       */
      l.current_scene.scene = new THREE.Scene();
      l.current_scene.scene.visible = false;

      l.scenograph.effects.init();

  
      l.current_scene.objects.door = await l.scenograph.objects.preloader.createDoor();
      l.current_scene.objects.door.position.set(
        -l.scenograph.objects.preloader.doorWidth / 2,
        -5 + l.scenograph.objects.preloader.doorHeight / 2,
        -15 + l.current_scene.room_depth / 2
      );
      l.current_scene.scene.add( l.current_scene.objects.door );
  
      // Setup skybox
      l.current_scene.objects.sky = new l.scenograph.objects.environment.sky();
      l.current_scene.scene.add(
        l.current_scene.objects.sky.mesh
      );
      l.current_scene.animation_queue.push(
        l.current_scene.objects.sky.animate
      );
  
      // Setup ocean
      //l.current_scene.objects.ocean = new Ocean( extractors.extractorLocations );
      l.current_scene.objects.ocean = new l.scenograph.objects.environment.ocean( [
          //new THREE.Vector3( 0, -500, this.size * 10 ),              // Test ship
          new THREE.Vector3( -35000, -2000, 10000 ),
          new THREE.Vector3( -36000, -1500, 10000 ),
          new THREE.Vector3( -34000, -1500, 10000 ),
      ] );
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
      l.current_scene.objects.room = await l.scenograph.objects.preloader.createOfficeRoom();
      l.current_scene.scene.add( l.current_scene.objects.room );
  

      // Setup triggers
      setupTriggers();

      // Setup Tweens.
      setupTweens();


    }

    finishSetup() {
      // Check if we've finished loading.
      let bootWaiter = setInterval( () => {
        if (
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
