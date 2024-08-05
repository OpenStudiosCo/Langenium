/***
 * Scenograph class
 * 
 * Controls which scene composition is being played in the game client
 * 
 * e.g. entities, scenery objects, sky box, lighting, effects.
 */

/**
 * Vendor libs
 */
import * as THREE from "three";
import * as YUKA from 'yuka';
import { getGPUTier } from "detect-gpu";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Internal libs and helpers.
 */
import l from "@/helpers/l.js";
import { calculateAdjustedGapSize } from '@/helpers/math.js';

import Cameras from "@/scenograph/cameras.js";
import Controls from "@/scenograph/controls.js";
import Effects from "@/scenograph/effects";
import Events from "./scenograph/events";
import Materials from "@/scenograph/materials.js";

import Debugging from '@/scenograph/modes/debugging.js';
import Fast from '@/scenograph/modes/fast.js';
import Multiplayer from "@/scenograph/modes/multiplayer.js";

/**
 * Scenes 
 */
import Overworld from '@/scenograph/scenes/overworld.js';

/**
 * Scene controllers
 */
import { updateTriggers } from "@/scenograph/triggers";
import {
  updateTweens,
} from "@/scenograph/tweens";

export default class Scenograph {

    cameras;

    /**
     * @instance Controls;
     */
    controls;

    effects;

    materials;

    modes;

    /**
     * @instance YUKA.EntityManager;
     */
    entityManager;
    
    /**
     * @instance YUKA.Time;
     */
    time;

    constructor() {

        this.modes = {};

        /**
         * Cameras.
         */
        this.cameras = new Cameras();

        /**
         * Controls.
         */
        this.controls = new Controls();

        /**
         * Effects.
         */
        this.effects = new Effects();

        /**
         * Events
         */
        this.events = new Events();

        /**
         * Custom materials.
         */
        this.materials = new Materials();

        /**
         * Setup the different game modes (controllers)
         */

        /**
         * Debugging.
         */
        this.modes.debugging = new Debugging();

        /**
         * Fast mode.
         */
        this.modes.fast = new Fast();

        /**
         * Multiplayer allows connecting to server.
         */
        this.modes.multiplayer = new Multiplayer();

        /**
         * YUKA modules
         */
        this.entityManager = new YUKA.EntityManager();
        this.time = new YUKA.Time();

    }

    load( sceneName ) {
        let scene = false;

        if ( sceneName == 'Overworld' ) {
            scene = new Overworld();
        }
        return scene;
    }

    /**
     * Game 3D initialiser, called by l when it's finished loading.
     */
    async init() {

        // Check the GPU capability.
        await this.checkGPUTier();

        // Setup asset loaders.
        this.setupLoaders();

        // Size
        l.current_scene.settings.adjusted_gap = calculateAdjustedGapSize();
        l.current_scene.room_depth = 8 * l.current_scene.settings.adjusted_gap;

        // Setup renderers.
        l.scenograph.setupRenderers();

        // Setup the cameras.
        this.cameras.init();

        // Reusable pointer for tracking user interaction.
        l.current_scene.pointer = new THREE.Vector3();

        // Reusable raycaster for tracking what the user tried to hit.
        l.current_scene.raycaster = new THREE.Raycaster();

        // Scene Setup.
        l.current_scene.setup();

        // Bloom effect materials.
        l.current_scene.materials = {};

        // Activate controls
        this.controls.init();

        // Activate Event listeners.
        this.events.init();

    };

    async checkGPUTier() {
        // Check the GPU tier to allow advanced effects if 3 or greater.
        const gpuTier = await getGPUTier();
        l.config.client_info.gpu = gpuTier;

        if ( !l.config.settings.fast ) {
            if (
                l.config.client_info.gpu &&
                l.config.client_info.gpu.tier &&
                l.config.client_info.gpu.tier >= 3
            ) {
                // Enable effects
                l.config.settings.fast = false;
            }
        }
    }

    /**
     * Main animation loop for the current scene.
     */
    animate( currentTime ) {
        updateFPS();

        const delta = l.scenograph.time.update().getDelta();

        if ( l.current_scene.started ) {
            if ( l.current_scene.animation_queue.length > 0 ) {
                for (
                    var i = 0;
                    i < l.current_scene.animation_queue.length;
                    i++
                ) {
                    l.current_scene.animation_queue[ i ]( delta );
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

        requestAnimationFrame( l.scenograph.animate );
    }

    setupLoaders() {
        l.current_scene.loaders.gtlf = new GLTFLoader();
        l.current_scene.loaders.object = new THREE.ObjectLoader();
        l.current_scene.loaders.texture = new THREE.TextureLoader();
    }


    /**
     * Setup 3D webgl renderer and configure it.
     */
    setupRenderers() {
        // Main 3D webGL Renderer.
        l.current_scene.renderers.webgl = new THREE.WebGLRenderer( {
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,

            // disabled to prevent transparency issues on fast mode
            // depth: false
        } );
        l.current_scene.renderers.webgl.setPixelRatio( window.devicePixelRatio );
        l.current_scene.renderers.webgl.setSize(
            window.innerWidth,
            window.innerHeight
        );
        document
            .querySelector( "#webgl" )
            .appendChild( l.current_scene.renderers.webgl.domElement );
    }


}

/**
 * @todo: move to helpers file or into class above
 */
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
