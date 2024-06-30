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
 * Initiator of tween sequences.
 */
export function startTweening() {
  setTimeout( () => {
    window.l.current_scene.started = true;

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
      for ( var screen_id in window.l.current_scene.screens ) {
        const screen = window.l.current_scene.screens[ screen_id ];
        if ( window.location.pathname.indexOf( screen.slug ) >= 0 ) {
          let [ targetPosition, targetRotation ] = screen.mesh.getViewingCoords();

          window.l.current_scene.camera.position.copy( targetPosition );
          window.l.current_scene.camera.rotation.copy( targetRotation );

          updateFlickering( { emissiveIntensity: 1 } );
        }
      }
    }
  }, window.l.config.skipintro ? 0 : 250 );
}

/**
 * Update tweens.
 *
 * Called by window.l.current_scene.animate()
 */
export function updateTweens( currentTime ) {
  for ( var tween in window.l.current_scene.tweens ) {
    window.l.current_scene.tweens[ tween ].update( currentTime );
  }
}

/**
 * Setup tweens.
 *
 * Called window.l.current_scene.setup()
 */
export function setupTweens() {
  /**
   * Slide back
   * Animation: Automatic, single use
   */
  window.l.current_scene.tweens.slideBack = slideBack();

  /**
   * Open the door
   * Animation: Automatic, single use
   */
  let doorRotation = -Math.PI / 2;
  window.l.current_scene.tweens.openDoor = openDoor( doorRotation );

  /**
   * Enter the office
   * Animation: Automatic, single use
   */
  window.l.current_scene.tweens.enterTheOffice = enterTheOffice();

  /**
   * Camera dolly up.
   * Animation: Automatic, single use
   */
  window.l.current_scene.tweens.dollyUp = dollyUp();

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
    window.l.current_scene.scene_objects.door_sign.traverse( ( mesh ) => {
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
  window.l.current_scene.tweens.doorSignFlickerA = new TWEEN.Tween( dummy )
    .easing( TWEEN.Easing.Quadratic.Out )
    .to( { emissiveIntensity: 0.8 }, window.l.config.skipintro ? 0 : duration * 1000 ) // Start at 0 intensity
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } );
  window.l.current_scene.tweens.doorSignFlickerB = new TWEEN.Tween( dummy )
    .delay( duration * 1000 )
    .to( { emissiveIntensity: 0 }, window.l.config.skipintro ? 0 : 0.1 * 1000 )
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } );
  window.l.current_scene.tweens.doorSignFlickerC = new TWEEN.Tween( dummy )
    .delay( ( duration + 0.1 ) * 1000 )
    .easing( TWEEN.Easing.Quadratic.Out )
    .to( { emissiveIntensity: 0.4 }, window.l.config.skipintro ? 0 : 0.2 * 1000 )
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } );
  window.l.current_scene.tweens.doorSignFlickerD = new TWEEN.Tween( dummy )
    .delay( ( duration + 0.1 + 0.2 ) * 1000 )
    .to( { emissiveIntensity: 0 }, window.l.config.skipintro ? 0 : 0.1 * 1000 )
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } );
  window.l.current_scene.tweens.doorSignFlickerE = new TWEEN.Tween( dummy )
    .easing( TWEEN.Easing.Quadratic.Out )
    .to( { emissiveIntensity: 0.4 }, window.l.config.skipintro ? 0 : 0.2 * 1000 )
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } );
  window.l.current_scene.tweens.doorSignFlickerF = new TWEEN.Tween( dummy )
    .to( { emissiveIntensity: 0 }, window.l.config.skipintro ? 0 : 0.1 * 1000 )
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } );
  window.l.current_scene.tweens.doorSignFlickerG = new TWEEN.Tween( dummy )
    .easing( TWEEN.Easing.Quadratic.Out )
    .to( { emissiveIntensity: 1 }, window.l.config.skipintro ? 0 : 0.2 * 1000 )
    .onUpdate( ( obj ) => {
      updateFlickering( obj );
    } )
    .onComplete( () => {
      window.l.current_scene.tweens.shipEnterY.start();
      window.l.current_scene.tweens.shipEnterZ.start();
      window.l.current_scene.tweens.slideBack.start();
    } );

  window.l.current_scene.tweens.doorSignFlickerA.chain(
    window.l.current_scene.tweens.doorSignFlickerB
  );
  window.l.current_scene.tweens.doorSignFlickerB.chain(
    window.l.current_scene.tweens.doorSignFlickerC
  );
  window.l.current_scene.tweens.doorSignFlickerC.chain(
    window.l.current_scene.tweens.doorSignFlickerD
  );
  window.l.current_scene.tweens.doorSignFlickerD.chain(
    window.l.current_scene.tweens.doorSignFlickerE
  );
  window.l.current_scene.tweens.doorSignFlickerE.chain(
    window.l.current_scene.tweens.doorSignFlickerF
  );
  window.l.current_scene.tweens.doorSignFlickerF.chain(
    window.l.current_scene.tweens.doorSignFlickerG
  );

  window.l.current_scene.tweens.doorSignFlickerA.start();
}

/**
 * Move the camera through the door.
 */
function enterTheOffice() {
  let coords = { x: 15 + window.l.current_scene.room_depth / 2 }; // Start at (0, 0)
  let targetZ = window.l.current_scene.scene_objects.ship.default_camera_distance + window.l.current_scene.room_depth / 2;
  return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
    .to( { x: targetZ }, window.l.config.skipintro ? 0 : 1000 ) // Move to (300, 200) in 1 second.
    .easing( TWEEN.Easing.Quadratic.InOut ) // Use an easing function to make the animation smooth.
    .onUpdate( () => {
      // Turn off bloom from the other scene.
      if ( window.l.current_scene.effects.postprocessing && window.l.current_scene.effects.postprocessing.passes.length > 0 ) {
        window.l.current_scene.effects.postprocessing.passes.forEach( ( effectPass ) => {
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
      window.l.current_scene.camera.position.z = coords.x;
      window.l.current_scene.camera.updateProjectionMatrix();
    } )
    .onComplete( () => {
      window.l.current_scene.scene_objects.room.material.forEach(
        ( material, i ) => {
          if (
            material.opacity > 0 &&
            material.name != "floor" &&
            material.name != "ceiling"
          ) {
            window.l.current_scene.scene_objects.room.material.side =
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
      window.l.current_scene.settings.startPosZ +
      window.l.current_scene.room_depth / 2,
  }; // Start at (0, 0)
  let targetZ = 15 + window.l.current_scene.room_depth / 2;
  return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
    .to( { x: targetZ }, window.l.config.skipintro ? 0 : 1000 ) // Move to (300, 200) in 1 second.
    .easing( TWEEN.Easing.Quadratic.InOut ) // Use an easing function to make the animation smooth.
    .onUpdate( () => {

      // Called after tween.js updates 'coords'.
      // Move 'box' to the position described by 'coords' with a CSS translation.
      window.l.current_scene.camera.position.z = coords.x;
      window.l.current_scene.camera.updateProjectionMatrix();
    } )
    .onComplete( () => {
      window.l.current_scene.tweens.openDoor.start();

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
  return new TWEEN.Tween( window.l.current_scene.scene_objects.door.rotation )
    .to( { y: doorRotation }, window.l.config.skipintro ? 0 : 500 ) // Set the duration of the animation
    .onComplete( () => {
      window.l.current_scene.tweens.enterTheOffice.start();
      window.l.current_scene.tweens.dollyUp.delay( 500 ).start();

    } );
}

/**
 * Moves the camera up to see the scene.
 */
function dollyUp() {
  return new TWEEN.Tween( window.l.current_scene.camera.position )
    .to( { y: 10.775 }, window.l.config.skipintro ? 0 : 500 ) // Set the duration of the animation
    .onUpdate( () => {
      //window.l.current_scene.camera.lookAt(window.l.current_scene.scene_objects.ship.mesh.position);
      window.l.current_scene.camera.updateProjectionMatrix();
    } )
    .onComplete( () => {
      window.l.current_scene.ui.show_menus();
      window.l.current_scene.tweens.sinkOffice = sinkOffice();
      window.l.current_scene.tweens.sinkOffice.delay( 500 ).start();
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
    .to( { y: -50 }, window.l.config.skipintro ? 0 : 10000 ) // Set the duration of the animation
    .onUpdate( () => {
      window.l.current_scene.scene_objects.room.position.y = coords.y;
      window.l.current_scene.scene_objects.door.position.y = coords.y;
      window.l.current_scene.scene_objects.door_frame.position.y = coords.y;
    } )
    .onComplete( () => {
      window.l.current_scene.scene.remove( window.l.current_scene.scene_objects.room );
      window.l.current_scene.scene.remove( window.l.current_scene.scene_objects.door );
      window.l.current_scene.scene.remove( window.l.current_scene.scene_objects.door_frame );
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
  window.l.current_scene.tweens.moveCamera = moveCamera();

  /**
   * Rotate camera to "x"
   * Animation: Manual, reusable
   */
  window.l.current_scene.tweens.rotateCamera = rotateCamera();

  /**
   * Reset the camera to original position and rotation.
   */
  let cameraRotationX = -( Math.PI / 30 ) * window.l.current_scene.camera.aspect;
  let cameraDefaultPosition = {
    x: 0,
    y: 18,
    z: -20 + window.l.current_scene.room_depth / 2,
  },
    cameraDefaultRotation = { x: cameraRotationX, y: 0, z: 0 };
  window.l.current_scene.tweens.resetCameraPosition = resetCameraPosition(
    cameraDefaultPosition
  );
  window.l.current_scene.tweens.resetCameraRotation = resetCameraRotation(
    cameraDefaultRotation
  );
}

/**
 * A reusable tween that can pan the camera.
 */
function moveCamera() {
  return new TWEEN.Tween( window.l.current_scene.camera.position )
    .easing( TWEEN.Easing.Quadratic.InOut ) // Use desired easing function
    .onUpdate( () => {
      window.l.current_scene.camera.updateProjectionMatrix();
    } )
    .onComplete( () => {
      window.l.current_scene.moving = false;
    } );
}

/**
 * A reusable tween that can rotate the camera.
 */
function rotateCamera() {
  return new TWEEN.Tween( window.l.current_scene.camera.rotation )
    .easing( TWEEN.Easing.Quadratic.InOut ) // Easing function
    .onUpdate( () => {
      window.l.current_scene.camera.updateProjectionMatrix();
    } )
    .onComplete( () => {
      window.l.current_scene.moving = false;
    } );
}

/**
 * A reusable tween that resets the camera to default position.
 */
function resetCameraPosition( cameraDefaultPosition ) {
  return new TWEEN.Tween( window.l.current_scene.camera.position )
    .to( cameraDefaultPosition, window.l.config.skipintro ? 0 : 1000 )
    .easing( TWEEN.Easing.Quadratic.InOut ) // Use desired easing function
    .onUpdate( () => {
      window.l.current_scene.camera.updateProjectionMatrix();
    } )
    .onComplete( () => {
      window.l.current_scene.moving = false;
    } );
}

/**
 * A reusable tween that resets the camera to default rotation.
 */
function resetCameraRotation( cameraDefaultRotation ) {
  return new TWEEN.Tween( window.l.current_scene.camera.rotation )
    .to( cameraDefaultRotation, window.l.config.skipintro ? 0 : 1000 )
    .easing( TWEEN.Easing.Quadratic.InOut ) // Use desired easing function
    .onUpdate( () => {
      window.l.current_scene.camera.updateProjectionMatrix();
    } );
}
