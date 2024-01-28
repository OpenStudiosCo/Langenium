/**
 * Scene base
 */

export default class SceneBase {
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
       * Multi input controls
       */
      this.controls = false;
      /**
       * Debug mode.
       * 
       * @memberof Boolean
       */
      this.debug = false;

      /**
       * Effects composers and their layers.
       * 
       * @memberof Object { THREE.EffectsComposer , THREE.Layer }
       */
      this.effects = {
        main: false,
        bloom: false,
        bloomLayer: false,
        scaleDone: false
      };

      /**
       * Exit sign.
       * 
       * @todo: Consolidate scene rigs.
       * 
       * @memberOf function
       */
      this.exitSignClick = false;

      /**
       * Fast mode (bloom off, no shadows)
       * 
       * @memberof Boolean
       */
      this.fast = true;

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
       * The main scene container.
       * 
       * @memberof THREE.Scene
       */
      this.scene = false;

      /**
       * Tracked meshes and mesh groups that compose the scene.
       * 
       * @memberof Object
       */
      this.scene_objects = { };
      
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
}
