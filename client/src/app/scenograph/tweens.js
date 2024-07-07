/**
 * Tweens
 *
 * Helpers for managing scene tweens.
 */

/**
 * Vendor libs
 */
import * as THREE from "three";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

/**
 * Initiator of tween sequences.
 */
export function startTweening() {
    setTimeout( () => {
        l.current_scene.started = true;

        let loadingSign = document.getElementById( "loadingSign" );
        if ( loadingSign ) {
            loadingSign.style.display = "none";
        }

        // Select intro sequence based on matrix entry type.
        if ( window.matrix_scene.type == "fullscreen" ) {
            flickerEffect();
        }

        if ( window.matrix_scene.type == "button" ) {
            // Check which page we came through so we can grab it's position.
            for ( var screen_id in l.current_scene.screens ) {
                const screen = l.current_scene.screens[ screen_id ];
                if ( location.pathname.indexOf( screen.slug ) >= 0 ) {
                    let [ targetPosition, targetRotation ] = screen.mesh.getViewingCoords();

                    l.scenograph.cameras.player.position.copy( targetPosition );
                    l.scenograph.cameras.player.rotation.copy( targetRotation );

                    updateFlickering( { emissiveIntensity: 1 } );
                }
            }
        }
    }, l.config.settings.skipintro ? 0 : 250 );
}

/**
 * Update tweens.
 *
 * Called by l.current_scene.animate()
 */
export function updateTweens( currentTime ) {
    for ( var tween in l.current_scene.tweens ) {
        l.current_scene.tweens[ tween ].update( currentTime );
    }
}

/**
 * Setup tweens.
 *
 * Called l.current_scene.setup()
 */
export function setupTweens() {
    /**
     * Slide back
     * Animation: Automatic, single use
     */
    l.current_scene.tweens.slideBack = slideBack();

    /**
     * Open the door
     * Animation: Automatic, single use
     */
    let doorRotation = -Math.PI / 2;
    l.current_scene.tweens.openDoor = openDoor( doorRotation );

    /**
     * Enter the office
     * Animation: Automatic, single use
     */
    l.current_scene.tweens.enterTheOffice = enterTheOffice();

    /**
     * Camera dolly up.
     * Animation: Automatic, single use
     */
    l.current_scene.tweens.dollyUp = dollyUp();

    /**
     * Sink the office.
     * Animation: Automatic, single use
     */

    resetReusables();
}

/**
 * Intro sequence composed of multiple tweens.
 * - flickerEffect() to make the office door's logo neon flash.
 * - enterTheOffice() to move the camera through the door threshold.
 * - slideBack() to move the camera back to see the door.
 * - openDoor() to open the office door.
 * - dollyUp() to move the camera up after moving through the door.
 *
 */

/**
 * Create the flickering effect with emissive intensity.
 */
function flickerEffect() {
    /**
     * Helper that runs several times to update sub object settings.
     */
    function updateFlickering( obj ) {
        l.current_scene.scene_objects.door_sign.traverse( ( mesh ) => {
            if ( mesh.isMesh ) {
                // console.log(mesh);
                // debugger;
                mesh.material.emissiveIntensity = obj.emissiveIntensity;
            }
        } );
    }
    const duration = 0.5; // Duration of the startup flickering (adjust as needed)
    const delay = 1; // Delay before the flickering starts (adjust as needed)

    // Use a sine wave function to generate flickering values
    const intensityValues = [];
    const numSteps = 30; // Number of steps in the flickering animation
    for ( let i = 0; i < numSteps; i++ ) {
        const t = i / ( numSteps - 1 ); // Normalize time from 0 to 1
        const intensity = Math.sin( t * Math.PI ) ** 2; // Sine wave function for flickering effect
        const randomVariation = Math.random() * 0.2 + 0.9; // Random variation between 0.9 and 1.1

        intensityValues.push( intensity * randomVariation );
    }

    let dummy = { emissiveIntensity: 0 };

    // Chain the tweens to create the flickering effect
    l.current_scene.tweens.doorSignFlickerA = new TWEEN.Tween( dummy )
        .easing( TWEEN.Easing.Quadratic.Out )
        .to( { emissiveIntensity: 0.8 }, l.config.settings.skipintro ? 0 : duration * 1000 ) // Start at 0 intensity
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } );
    l.current_scene.tweens.doorSignFlickerB = new TWEEN.Tween( dummy )
        .delay( duration * 1000 )
        .to( { emissiveIntensity: 0 }, l.config.settings.skipintro ? 0 : 0.1 * 1000 )
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } );
    l.current_scene.tweens.doorSignFlickerC = new TWEEN.Tween( dummy )
        .delay( ( duration + 0.1 ) * 1000 )
        .easing( TWEEN.Easing.Quadratic.Out )
        .to( { emissiveIntensity: 0.4 }, l.config.settings.skipintro ? 0 : 0.2 * 1000 )
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } );
    l.current_scene.tweens.doorSignFlickerD = new TWEEN.Tween( dummy )
        .delay( ( duration + 0.1 + 0.2 ) * 1000 )
        .to( { emissiveIntensity: 0 }, l.config.settings.skipintro ? 0 : 0.1 * 1000 )
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } );
    l.current_scene.tweens.doorSignFlickerE = new TWEEN.Tween( dummy )
        .easing( TWEEN.Easing.Quadratic.Out )
        .to( { emissiveIntensity: 0.4 }, l.config.settings.skipintro ? 0 : 0.2 * 1000 )
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } );
    l.current_scene.tweens.doorSignFlickerF = new TWEEN.Tween( dummy )
        .to( { emissiveIntensity: 0 }, l.config.settings.skipintro ? 0 : 0.1 * 1000 )
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } );
    l.current_scene.tweens.doorSignFlickerG = new TWEEN.Tween( dummy )
        .easing( TWEEN.Easing.Quadratic.Out )
        .to( { emissiveIntensity: 1 }, l.config.settings.skipintro ? 0 : 0.2 * 1000 )
        .onUpdate( ( obj ) => {
            updateFlickering( obj );
        } )
        .onComplete( () => {
            l.current_scene.tweens.shipEnterY.start();
            l.current_scene.tweens.shipEnterZ.start();
            l.current_scene.tweens.slideBack.start();
        } );

    l.current_scene.tweens.doorSignFlickerA.chain(
        l.current_scene.tweens.doorSignFlickerB
    );
    l.current_scene.tweens.doorSignFlickerB.chain(
        l.current_scene.tweens.doorSignFlickerC
    );
    l.current_scene.tweens.doorSignFlickerC.chain(
        l.current_scene.tweens.doorSignFlickerD
    );
    l.current_scene.tweens.doorSignFlickerD.chain(
        l.current_scene.tweens.doorSignFlickerE
    );
    l.current_scene.tweens.doorSignFlickerE.chain(
        l.current_scene.tweens.doorSignFlickerF
    );
    l.current_scene.tweens.doorSignFlickerF.chain(
        l.current_scene.tweens.doorSignFlickerG
    );

    l.current_scene.tweens.doorSignFlickerA.start();
}

/**
 * Move the camera through the door.
 */
function enterTheOffice() {
    let coords = { x: 15 + l.current_scene.room_depth / 2 }; // Start at (0, 0)
    let targetZ = l.current_scene.scene_objects.ship.default_camera_distance + l.current_scene.room_depth / 2;
    return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
        .to( { x: targetZ }, l.config.settings.skipintro ? 0 : 1000 ) // Move to (300, 200) in 1 second.
        .easing( TWEEN.Easing.Quadratic.InOut ) // Use an easing function to make the animation smooth.
        .onUpdate( () => {
            // Turn off bloom from the other scene.
            if ( l.current_scene.effects.postprocessing && l.current_scene.effects.postprocessing.passes.length > 0 ) {
                l.current_scene.effects.postprocessing.passes.forEach( ( effectPass ) => {
                    if ( effectPass.name == 'EffectPass' ) {
                        effectPass.effects.forEach( ( effect ) => {
                            if ( effect.name == 'BloomEffect' ) {
                                effect.blendMode.setOpacity( Math.min( ( coords.x / targetZ ) - 1, 1 ) );
                            }
                        } );
                    }

                } );
            }

            // Called after tween.js updates 'coords'.
            // Move 'box' to the position described by 'coords' with a CSS translation.
            l.scenograph.cameras.player.position.z = coords.x;
            l.scenograph.cameras.player.updateProjectionMatrix();
        } )
        .onComplete( () => {
            l.current_scene.scene_objects.room.material.forEach(
                ( material, i ) => {
                    if (
                        material.opacity > 0 &&
                        material.name != "floor" &&
                        material.name != "ceiling"
                    ) {
                        l.current_scene.scene_objects.room.material.side =
                            THREE.BackSide;
                    }
                }
            );
            let loader_symbols = document.getElementById( "loader_symbols" );
            if ( loader_symbols ) loader_symbols.style.display = "none";
        } );
}

/**
 * Move the camera back to see the full door.
 */
function slideBack() {
    let coords = {
        x:
            l.current_scene.settings.startPosZ +
            l.current_scene.room_depth / 2,
    }; // Start at (0, 0)
    let targetZ = 15 + l.current_scene.room_depth / 2;
    return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
        .to( { x: targetZ }, l.config.settings.skipintro ? 0 : 1000 ) // Move to (300, 200) in 1 second.
        .easing( TWEEN.Easing.Quadratic.InOut ) // Use an easing function to make the animation smooth.
        .onUpdate( () => {

            // Called after tween.js updates 'coords'.
            // Move 'box' to the position described by 'coords' with a CSS translation.
            l.scenograph.cameras.player.position.z = coords.x;
            l.scenograph.cameras.player.updateProjectionMatrix();
        } )
        .onComplete( () => {
            l.current_scene.tweens.openDoor.start();

            let loader_symbols = document.getElementById( "loader_symbols" );
            if ( loader_symbols ) {
                loader_symbols.style.transition = "filter 5s";
                loader_symbols.style.filter = "blur(100px)";
            }
        } );
}

/**
 * Opens the door.
 */
function openDoor( doorRotation ) {
    return new TWEEN.Tween( l.current_scene.scene_objects.door.rotation )
        .to( { y: doorRotation }, l.config.settings.skipintro ? 0 : 500 ) // Set the duration of the animation
        .onComplete( () => {
            l.current_scene.tweens.enterTheOffice.start();
            l.current_scene.tweens.dollyUp.delay( 500 ).start();

        } );
}

/**
 * Moves the camera up to see the scene.
 */
function dollyUp() {
    return new TWEEN.Tween( l.scenograph.cameras.player.position )
        .to( { y: 10.775 }, l.config.settings.skipintro ? 0 : 500 ) // Set the duration of the animation
        .onUpdate( () => {
            //l.scenograph.cameras.player.lookAt(l.current_scene.scene_objects.ship.mesh.position);
            l.scenograph.cameras.player.updateProjectionMatrix();
        } )
        .onComplete( () => {
            l.ui.show_menus();
            // Activate debugging if requested.
            if ( l.config.settings.debug ) {
                l.scenograph.modes.debugging.activate();
            }
            l.current_scene.tweens.sinkOffice = sinkOffice();
            l.current_scene.tweens.sinkOffice.delay( 500 ).start();
        } )
}

/**
 * Sinks the office room the player exits from
 */
function sinkOffice() {
    let coords = {
        y: l.current_scene.scene_objects.room.position.y
    };
    return new TWEEN.Tween( coords )
        .to( { y: -50 }, l.config.settings.skipintro ? 0 : 10000 ) // Set the duration of the animation
        .onUpdate( () => {
            l.current_scene.scene_objects.room.position.y = coords.y;
            l.current_scene.scene_objects.door.position.y = coords.y;
            l.current_scene.scene_objects.door_frame.position.y = coords.y;
        } )
        .onComplete( () => {
            l.current_scene.scene.remove( l.current_scene.scene_objects.room );
            l.current_scene.scene.remove( l.current_scene.scene_objects.door );
            l.current_scene.scene.remove( l.current_scene.scene_objects.door_frame );
        } )
}

/**
 * Reset all reusable tweens to their default states.
 */
export function resetReusables() {
    /**
     * Move camera to "x"
     * Animation: Manual, reusable
     */
    l.current_scene.tweens.moveCamera = moveCamera();

    /**
     * Rotate camera to "x"
     * Animation: Manual, reusable
     */
    l.current_scene.tweens.rotateCamera = rotateCamera();

    /**
     * Reset the camera to original position and rotation.
     */
    let cameraRotationX = -( Math.PI / 30 ) * l.scenograph.cameras.player.aspect;
    let cameraDefaultPosition = {
        x: 0,
        y: 18,
        z: -20 + l.current_scene.room_depth / 2,
    },
        cameraDefaultRotation = { x: cameraRotationX, y: 0, z: 0 };
    l.current_scene.tweens.resetCameraPosition = resetCameraPosition(
        cameraDefaultPosition
    );
    l.current_scene.tweens.resetCameraRotation = resetCameraRotation(
        cameraDefaultRotation
    );
}

/**
 * A reusable tween that can pan the camera.
 */
function moveCamera() {
    return new TWEEN.Tween( l.scenograph.cameras.player.position )
        .easing( TWEEN.Easing.Quadratic.InOut ) // Use desired easing function
        .onUpdate( () => {
            l.scenograph.cameras.player.updateProjectionMatrix();
        } )
        .onComplete( () => {
            l.current_scene.moving = false;
        } );
}

/**
 * A reusable tween that can rotate the camera.
 */
function rotateCamera() {
    return new TWEEN.Tween( l.scenograph.cameras.player.rotation )
        .easing( TWEEN.Easing.Quadratic.InOut ) // Easing function
        .onUpdate( () => {
            l.scenograph.cameras.player.updateProjectionMatrix();
        } )
        .onComplete( () => {
            l.current_scene.moving = false;
        } );
}

/**
 * A reusable tween that resets the camera to default position.
 */
function resetCameraPosition( cameraDefaultPosition ) {
    return new TWEEN.Tween( l.scenograph.cameras.player.position )
        .to( cameraDefaultPosition, l.config.settings.skipintro ? 0 : 1000 )
        .easing( TWEEN.Easing.Quadratic.InOut ) // Use desired easing function
        .onUpdate( () => {
            l.scenograph.cameras.player.updateProjectionMatrix();
        } )
        .onComplete( () => {
            l.current_scene.moving = false;
        } );
}

/**
 * A reusable tween that resets the camera to default rotation.
 */
function resetCameraRotation( cameraDefaultRotation ) {
    return new TWEEN.Tween( l.scenograph.cameras.player.rotation )
        .to( cameraDefaultRotation, l.config.settings.skipintro ? 0 : 1000 )
        .easing( TWEEN.Easing.Quadratic.InOut ) // Use desired easing function
        .onUpdate( () => {
            l.scenograph.cameras.player.updateProjectionMatrix();
        } );
}
