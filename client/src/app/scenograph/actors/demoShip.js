/**
 * @name            DemoShip
 * @description     Provides a demo screen experience before selecting a game mode.
 * @memberof        l.scenograph.actors
 * @global
 */

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class DemoShip {

    // Tween for the ship intro sequence.
    shipEnterY() {
        let coords = { y: 60 }; // Start at (0, 0)
        let target = { y: 8.5 };
        return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
            .to( target, l.config.settings.skipintro ? 0 : 2000 ) // Move to (300, 200) in 1 second.
            .easing( TWEEN.Easing.Circular.Out ) // Use an easing function to make the animation smooth.
            .onUpdate( () => {
                l.current_scene.objects.demoShip.mesh.position.y = coords.y;
            } )
            .onComplete( () => {
                //console.log('ready');
            } );
    }
    // Tween for the ship intro sequence.
    shipEnterZ() {
        let coords = { x: l.current_scene.room_depth }; // Start at (0, 0)
        let target = { x: 0 };
        return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
            .delay( l.config.settings.skipintro ? 0 : 1000 )
            .to( target, l.config.settings.skipintro ? 0 : 2000 ) // Move to (300, 200) in 1 second.
            .easing( TWEEN.Easing.Circular.Out ) // Use an easing function to make the animation smooth.
            .onUpdate( () => {

                // Called after tween.js updates 'coords'.
                // Move 'box' to the position described by 'coords' with a CSS translation.
                l.current_scene.objects.demoShip.mesh.position.z = coords.x;

            } )
            .onComplete( () => {

                // Turn off bloom from the other scene.
                if ( l.current_scene.effects.postprocessing && l.current_scene.effects.postprocessing.passes.length > 0 ) {
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

                // Set the ship as ready.
                l.current_scene.objects.demoShip.ready = true;
                l.current_scene.objects.demoShip.camera_distance = l.current_scene.objects.demoShip.default_camera_distance + ( l.current_scene.room_depth / 2 );
                l.current_scene.objects.demoShip.mesh.userData.object.position.x = l.current_scene.objects.demoShip.mesh.position.x;
                l.current_scene.objects.demoShip.mesh.userData.object.position.y = l.current_scene.objects.demoShip.mesh.position.y;
                l.current_scene.objects.demoShip.mesh.userData.object.position.z = l.current_scene.objects.demoShip.mesh.position.z;
            } );
    }
}
