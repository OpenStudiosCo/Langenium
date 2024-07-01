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
import l from "./helpers/l.js";
import { calculateAdjustedGapSize, setCameraFOV } from './helpers/math.js';

import Controls from "./scenograph/controls.js";
import Effects from "./scenograph/effects";
import { handleViewportChange } from "./scenograph/events.js";
import Materials from "./scenograph/materials.js";

import Debugging from './scenograph/modes/debugging.js';
import Multiplayer from "./scenograph/modes/multiplayer.js";

/**
 * Scenes 
 */
import Overworld from './scenograph/scenes/overworld.js';

export default class Scenograph {

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
         * Controls.
         */
        this.controls = new Controls();

        /**
         * Effects.
         */
        this.effects = new Effects();

        /**
         * Custom materials.
         */
        this.materials = new Materials();

        /**
         * Setup the different game modes
         */

        /**
         * Debugging.
         */
        this.modes.debugging = new Debugging();

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

        l.current_scene.loaders.gtlf = new GLTFLoader();
        l.current_scene.loaders.object = new THREE.ObjectLoader();
        l.current_scene.loaders.texture = new THREE.TextureLoader();

        // Size
        l.current_scene.settings.adjusted_gap = calculateAdjustedGapSize();
        l.current_scene.room_depth = 8 * l.current_scene.settings.adjusted_gap;

        // Setup renderers.
        l.scenograph.setupRenderers();

        // Camera.
        var width = window.innerWidth;
        var height = window.innerHeight;
        var aspect = width / height;
        var fov = setCameraFOV( aspect );
        l.current_scene.camera = new THREE.PerspectiveCamera(
            fov,
            aspect,
            2.5,
            l.scale * 4
        );
        l.current_scene.camera.aspect = width / height;
        l.current_scene.camera.rotation.order = "YZX";

        if ( aspect < 0.88 ) {
            l.current_scene.settings.startPosZ = -5;
        }
        l.current_scene.camera.position.set(
            0,
            10.775,
            l.current_scene.settings.startPosZ +
            l.current_scene.room_depth / 2
        );

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

        window.addEventListener( "orientationchange", handleViewportChange );
        window.addEventListener( "resize", handleViewportChange );

        function onPointerMove( event ) {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components

            l.current_scene.pointer.x =
                ( event.clientX / window.innerWidth ) * 2 - 1;
            l.current_scene.pointer.y =
                -( event.clientY / window.innerHeight ) * 2 + 1;
        }

        l.current_scene.renderers.webgl.domElement.addEventListener(
            "pointermove",
            onPointerMove
        );

        function onTouchStart( event ) {
            if ( !l.current_scene.selected ) {
                event.preventDefault();

                l.current_scene.pointer.x =
                    ( event.changedTouches[ 0 ].clientX / window.innerWidth ) * 2 - 1;
                l.current_scene.pointer.y =
                    -( event.changedTouches[ 0 ].clientY / window.innerHeight ) * 2 + 1;
                l.current_scene.pointer.z = 1; // previously mouseDown = true
            }
        }
        function onTouchEnd( event ) {
            if ( !l.current_scene.selected ) {
                event.preventDefault();

                l.current_scene.pointer.x =
                    ( event.changedTouches[ 0 ].clientX / window.innerWidth ) * 2 - 1;
                l.current_scene.pointer.y =
                    -( event.changedTouches[ 0 ].clientY / window.innerHeight ) * 2 + 1;
                l.current_scene.pointer.z = 0; // previously mouseDown = false
            }
        }

        l.current_scene.renderers.webgl.domElement.addEventListener(
            "touchstart",
            onTouchStart,
            false
        );
        l.current_scene.renderers.webgl.domElement.addEventListener(
            "touchend",
            onTouchEnd,
            false
        );

        function onMouseDown( event ) {
            l.current_scene.pointer.z = 1; // previously mouseDown = true
        }

        function onMouseUp( event ) {
            l.current_scene.pointer.z = 0; // previously mouseDown = false
        }

        // Attach the mouse down and up event listeners
        l.current_scene.renderers.webgl.domElement.addEventListener(
            "pointerdown",
            onMouseDown,
            false
        );
        l.current_scene.renderers.webgl.domElement.addEventListener(
            "pointerup",
            onMouseUp,
            false
        );

    };


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
