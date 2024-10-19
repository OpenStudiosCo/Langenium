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

    updatePlayer( rY, tY, tZ ) {
        var radian = ( Math.PI / 180 );

        l.current_scene.objects.player.camera_distance = l.current_scene.objects.player.default_camera_distance + ( l.current_scene.room_depth / 2 );
        if ( l.current_scene.objects.player.state.airSpeed < 0 ) {
            l.current_scene.objects.player.camera_distance -= l.current_scene.objects.player.state.airSpeed * 4;
        }

        let xDiff = l.current_scene.objects.player.mesh.position.x;
        let zDiff = l.current_scene.objects.player.mesh.position.z;

        l.scenograph.cameras.player.position.x = xDiff + l.current_scene.objects.player.camera_distance * Math.sin( l.current_scene.objects.player.mesh.rotation.y );
        l.scenograph.cameras.player.position.z = zDiff + l.current_scene.objects.player.camera_distance * Math.cos( l.current_scene.objects.player.mesh.rotation.y );

        if ( rY != 0 ) {

            l.scenograph.cameras.player.rotation.y += rY;
        }
        else {
            // Check there is y difference and the rotation pad isn't being pressed.                   
            if (
                l.scenograph.cameras.player.rotation.y != l.current_scene.objects.player.mesh.rotation.y &&
                ( l.scenograph.controls.touch && !l.scenograph.controls.touch.controls.rotationPad.mouseDown )
            ) {

                // Get the difference in y rotation betwen the camera and ship
                let yDiff = l.current_scene.objects.player.mesh.rotation.y - l.scenograph.cameras.player.rotation.y;

                // Check the y difference is larger than 1/100th of a radian
                if (
                    Math.abs( yDiff ) > radian / 100
                ) {
                    // Add 1/60th of the difference in rotation, as FPS currently capped to 60.
                    l.scenograph.cameras.player.rotation.y += ( l.current_scene.objects.player.mesh.rotation.y - l.scenograph.cameras.player.rotation.y ) * 1 / 60;
                }
                else {
                    l.scenograph.cameras.player.rotation.y = l.current_scene.objects.player.mesh.rotation.y;
                }

            }

        }

        let xDiff2 = tZ * Math.sin( l.current_scene.objects.player.mesh.rotation.y ),
            zDiff2 = tZ * Math.cos( l.current_scene.objects.player.mesh.rotation.y );

        if ( l.current_scene.objects.player.mesh.position.y + tY >= 1 ) {
            l.scenograph.cameras.player.position.y += tY;
        }

        l.scenograph.cameras.player.position.x += xDiff2;
        l.scenograph.cameras.player.position.z += zDiff2;

        l.scenograph.cameras.player.updateProjectionMatrix();
    }

}
