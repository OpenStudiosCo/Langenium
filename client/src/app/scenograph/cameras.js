/**
 * Cameras controller.
 * 
 * Manages 3D engine cameras.
 */

/**
 * Vendor libs
 */
import * as THREE from "three";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { setCameraFOV } from '@/helpers/math.js';
import setupPostProcessing from '@/scenograph/effects/postprocessing.js';


export default class Cameras {
    /**
     * Determines which camera is active.
     */
    active;

    /**
     * Allows orbitcontrol viewing of an object in the scene, for debugging and dev.
     */
    orbit;

    /**
     * Follows the player and contains special behaviours for gameplay simulation.
     */
    player;

    init() {
        // Setup cameras.
        this.orbit = this.createCamera( 'orbit' );
        this.player = this.createCamera( 'player' );

        this.playerY = 14;

        // Check if we're in debug mode and set the active camera accordingly.
        this.active = l.config.settings.debug ? this.orbit : this.player;
    }

    setActive( cameraName ) {
        // Set the active camera for the renderer.
        this.active = this[ cameraName ];

        // Rebuild postprocessing effects as they're camera specific.
        if ( !l.config.settings.fast ) {
            l.current_scene.effects.postprocessing = setupPostProcessing();
            l.current_scene.effects.postprocessing.passes.forEach( ( effectPass ) => {
                if ( effectPass.name == 'EffectPass' ) {
                    effectPass.effects.forEach( ( effect ) => {
                        if ( effect.name == 'BloomEffect' ) {
                            effect.blendMode.setOpacity( 0 );
                        }
                    } );
                }

            } );
        }
    }

    createCamera( cameraName ) {

        var width = l.scenograph.width;
        var height = l.scenograph.height;
        var aspect = width / height;
        var fov = setCameraFOV( aspect );

        var camera = new THREE.PerspectiveCamera(
            fov,
            aspect,
            2.5,
            l.scale * 4
        );

        camera.name = cameraName;

        // Enable the effects layer, default of 11 for postprocessing bloom
        camera.layers.enable( 11 );

        camera.aspect = width / height;
        camera.rotation.order = "YZX";

        if ( aspect < 0.88 ) {
            l.current_scene.settings.startPosZ = -5;
        }
        camera.position.set(
            0,
            10.775,
            l.current_scene.settings.startPosZ +
            l.current_scene.room_depth / 2
        );

        return camera;
    }

}
