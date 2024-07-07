/***
 * Scenograph class
 * 
 * Controls which scene composition is being played in the game client
 * 
 * e.g. scene objects, sky box, lighting, effects.
 */

/**
 * Vendor libs
 */
import * as THREE from "three";
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


export default class Scenograph {

    cameras;

    /**
     * @instance Controls;
     */
    controls;

    effects;

    materials;

    modes;

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
