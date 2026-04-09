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
import World from '#/game/ecs/world';

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
        this.world = new World(sceneName);

        return this;
    }

    // Load the objects in world instance to the current scene.
    async setup() {
      this.setupSceneDefaults();

      this.loadInstance();

      this.finishSetup();
    }

    async loadInstance() {
        console.log(this.world);
        await this.world.entities.forEach(async entity => {

            if ( entity.config.components.Renderable.object == 'extractor' ) {
                l.scenograph.director.loadObject(
                entity,
                await l.scenograph.objects.structures.extractor.get()
                );
            }
            if ( entity.config.components.Renderable.object == 'platform' ) {
                l.scenograph.director.loadObject(
                entity,
                await l.scenograph.objects.structures.platform.get()
                );
            }
            if ( entity.config.components.Renderable.object == 'refinery' ) {
                l.scenograph.director.loadObject(
                entity,
                await l.scenograph.objects.structures.refinery.get()
                );
            }

            if ( entity.config.components.Renderable.object == 'cargoShip' ) {
                l.scenograph.director.loadObject(
                entity,
                await l.scenograph.objects.vehicles.cargoShip.get()
                );
            }
            if ( entity.config.components.Renderable.object == 'pirate' ) {
                l.scenograph.director.loadObject(
                entity,
                await l.scenograph.objects.vehicles.raven.get()
                );
            }

            if (entity.config.components.Renderable.object == 'valiant' || entity.config.components.Renderable.object == 'person') {
                await l.scenograph.actors.registerActor( entity );
            }
        });

    }

    async loadObject(entity, scenographObject) {
        console.log(entity, scenographObject);
      scenographObject.position.x = entity.components.Transform.position.x;
      scenographObject.position.y = entity.components.Transform.position.y;
      scenographObject.position.z = entity.components.Transform.position.z;

      if ( entity.rotation ) {
        scenographObject.rotation.x = entity.components.Transform.rotation.x;
        scenographObject.rotation.y = entity.components.Transform.rotation.y;
        scenographObject.rotation.z = entity.components.Transform.rotation.z;
      }

      scenographObject.name = entity.components.Name;
      scenographObject.userData.entity = entity;

      // @todo: add to current_scene array relevant to scenographObject class.

      l.current_scene.scene.add(
          scenographObject
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

      l.current_scene.objects.demoShip = new l.scenograph.objects.vehicles.valiant();
      await l.current_scene.objects.demoShip.load();
      l.current_scene.scene.add(
        l.current_scene.objects.demoShip.mesh
      );
      l.current_scene.animation_queue.push(
        delta => l.current_scene.objects.demoShip.animate(delta)
      );
      l.current_scene.tweens.shipEnterY = l.current_scene.objects.demoShip.shipEnterY();
      l.current_scene.tweens.shipEnterZ = l.current_scene.objects.demoShip.shipEnterZ();

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
      l.current_scene.objects.ocean = new l.scenograph.objects.environment.ocean(
        l.scenograph.objects.structures.extractor.extractorLocations
       );
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
      // Add objects to animation queue.
      l.current_scene.animation_queue.push(
        l.scenograph.objects.animate
      );
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
