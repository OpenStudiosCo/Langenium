import * as THREE from 'three';

export function startTweening() {
  setTimeout(() => {
    window.test_scene.started = true;
    let loadingSign = document.getElementById('loadingSign');
    if (loadingSign) {
      loadingSign.style.display = 'none';
    }

    // Select intro sequence based on matrix entry type.
    if (window.matrix_scene.type == 'fullscreen') {
      flickerEffect();
    }

    if (window.matrix_scene.type == 'button') {
      // Check which page we came through so we can grab it's position.
      for ( var screen_id in window.test_scene.screens) {
        const screen = window.test_scene.screens[screen_id];
        if (window.location.pathname.indexOf( screen.slug ) >= 0 ) {
          let [ targetPosition, targetRotation ] = screen.mesh.getViewingCoords( );

          window.test_scene.camera.position.copy(targetPosition);
          window.test_scene.camera.rotation.copy(targetRotation);

          updateFlickering( { emissiveIntensity: 1 } );
        }
      }
    }
    
  }, 250);
  
}

export function updateTweens(currentTime) {
  for (var tween in window.test_scene.tweens) {
    window.test_scene.tweens[tween].update(currentTime);
  }
  //TWEEN.update(currentTime);
}

export function setupTweens( ) {

  /**
   * Slide back
   * Animation: Automatic, single use
   */
   window.test_scene.tweens.slideBack = slideBack( );

  /**
   * Open the door
   * Animation: Automatic, single use
   */
  let doorRotation = - Math.PI / 2;
  window.test_scene.tweens.openDoor = openDoor( doorRotation );

  /**
   * Enter the office
   * Animation: Automatic, single use
   */
  window.test_scene.tweens.enterTheOffice = enterTheOffice( );

  /**
   * Camera dolly up.
   * Animation: Automatic, single use
   */  
  window.test_scene.tweens.dollyUp = dollyUp();

  /**
   * Camera pan down.
   * Animation: Automatic, single use
   */
  window.test_scene.tweens.panDown = panDown( );

  resetReusables();

}

// Intro sequence.


// Create the flickering effect with emissive intensity
function flickerEffect() {
  const duration = 0.5; // Duration of the startup flickering (adjust as needed)
  const delay = 1; // Delay before the flickering starts (adjust as needed)

  // Use a sine wave function to generate flickering values
  const intensityValues = [];
  const numSteps = 30; // Number of steps in the flickering animation
  for (let i = 0; i < numSteps; i++) {
    const t = i / (numSteps - 1); // Normalize time from 0 to 1
    const intensity = Math.sin(t * Math.PI) ** 2; // Sine wave function for flickering effect
    const randomVariation = Math.random() * 0.2 + 0.9; // Random variation between 0.9 and 1.1

    intensityValues.push(intensity * randomVariation);
  }

  let dummy = { emissiveIntensity: 0 };

  // Chain the tweens to create the flickering effect
  window.test_scene.tweens.doorSignFlickerA = new TWEEN.Tween( dummy )
    .easing(TWEEN.Easing.Quadratic.Out)
    .to({ emissiveIntensity: 0.8 }, duration * 1000) // Start at 0 intensity
    .onUpdate((obj) => { updateFlickering(obj) });
  window.test_scene.tweens.doorSignFlickerB = new TWEEN.Tween( dummy )
    .delay( duration * 1000)
    .to({ emissiveIntensity: 0 }, 0.1 * 1000)
    .onUpdate((obj) => { updateFlickering(obj) });
  window.test_scene.tweens.doorSignFlickerC = new TWEEN.Tween( dummy )
    .delay( (duration + 0.1 ) * 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .to({ emissiveIntensity: 0.4 }, 0.2 * 1000)
    .onUpdate((obj) => { updateFlickering(obj) });
  window.test_scene.tweens.doorSignFlickerD = new TWEEN.Tween( dummy )
    .delay( (duration + 0.1 + 0.2 ) * 1000)
    .to({ emissiveIntensity: 0 }, 0.1 * 1000)
    .onUpdate((obj) => { updateFlickering(obj) });
  window.test_scene.tweens.doorSignFlickerE = new TWEEN.Tween( dummy )
    .easing(TWEEN.Easing.Quadratic.Out)
    .to({ emissiveIntensity: 0.4 }, 0.2 * 1000)
    .onUpdate((obj) => { updateFlickering(obj) });
  window.test_scene.tweens.doorSignFlickerF = new TWEEN.Tween( dummy )
    .to({ emissiveIntensity: 0 }, 0.1 * 1000)
    .onUpdate((obj) => { updateFlickering(obj) });
  window.test_scene.tweens.doorSignFlickerG = new TWEEN.Tween( dummy )
    .easing(TWEEN.Easing.Quadratic.Out)
    .to({ emissiveIntensity: 1 }, 0.2 * 1000)
    .onUpdate((obj) => { updateFlickering(obj) })
    .onComplete(()=>{
      window.test_scene.tweens.slideBack.start();
    });

  window.test_scene.tweens.doorSignFlickerA.chain( window.test_scene.tweens.doorSignFlickerB );
  window.test_scene.tweens.doorSignFlickerB.chain( window.test_scene.tweens.doorSignFlickerC );
  window.test_scene.tweens.doorSignFlickerC.chain( window.test_scene.tweens.doorSignFlickerD );
  window.test_scene.tweens.doorSignFlickerD.chain( window.test_scene.tweens.doorSignFlickerE );
  window.test_scene.tweens.doorSignFlickerE.chain( window.test_scene.tweens.doorSignFlickerF );
  window.test_scene.tweens.doorSignFlickerF.chain( window.test_scene.tweens.doorSignFlickerG );

  window.test_scene.tweens.doorSignFlickerA.start();
}

function updateFlickering(obj) {
  window.test_scene.scene_objects.door_sign.traverse((mesh) => {
    if (mesh.isMesh) {
      // console.log(mesh);
      // debugger;
      mesh.material.emissiveIntensity = obj.emissiveIntensity;
    }
  });
}

function enterTheOffice ( ) {
  let coords = { x: 15 + ( window.test_scene.room_depth / 2 ) }; // Start at (0, 0)
  let targetZ = - 20 + (window.test_scene.room_depth / 2);
  return new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
  .to({ x: targetZ }, 1000) // Move to (300, 200) in 1 second.
  .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
  .onUpdate(() => {
    // Called after tween.js updates 'coords'.
    // Move 'box' to the position described by 'coords' with a CSS translation.
    window.test_scene.camera.position.z = coords.x;
    window.test_scene.camera.updateProjectionMatrix();
  })
  .onComplete(() => {
    window.test_scene.scene_objects.room.material.forEach((material, i) => {
      if (material.opacity > 0 && material.name != 'floor' && material.name != 'ceiling') {
        window.test_scene.scene_objects.room.material.side = THREE.BackSide;
      }
    });
    let loader_symbols = document.getElementById('loader_symbols');
    if (loader_symbols)
      loader_symbols.style.display = 'none';
  });
}

function slideBack ( ) {
  let coords = { x: window.test_scene.settings.startPosZ + ( window.test_scene.room_depth / 2 ) }; // Start at (0, 0)
  let targetZ = 15 + (window.test_scene.room_depth / 2);
  return new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
  .to({ x: targetZ }, 1000) // Move to (300, 200) in 1 second.
  .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
  .onUpdate(() => {
    // Called after tween.js updates 'coords'.
    // Move 'box' to the position described by 'coords' with a CSS translation.
    window.test_scene.camera.position.z = coords.x;
    window.test_scene.camera.updateProjectionMatrix();
  })
  .onComplete(() => {
    window.test_scene.tweens.openDoor.start();

    let loader_symbols = document.getElementById('loader_symbols');
    if (loader_symbols) {
      loader_symbols.style.transition = 'filter 5s';
      loader_symbols.style.filter = "blur(100px)";
    }
  })
}

function openDoor ( doorRotation ) {
  return new TWEEN.Tween(window.test_scene.scene_objects.door.rotation)
  .to({ y: doorRotation }, 500) // Set the duration of the animation
  .onComplete(() => {
    window.test_scene.tweens.enterTheOffice.start();
    window.test_scene.tweens.panDown.delay(500).start();
    window.test_scene.tweens.dollyUp.delay(500).start();
  })
  ;
}

function dollyUp ( ) {
  return new TWEEN.Tween(window.test_scene.camera.position)
  .to({ y: 18 }, 500) // Set the duration of the animation
  .onUpdate(() => {
    window.test_scene.camera.updateProjectionMatrix();
  });
}

function panDown ( ) {
  let cameraRotationX = - (Math.PI / 30) * window.test_scene.camera.aspect;
  return new TWEEN.Tween(window.test_scene.camera.rotation)
  .to({ x: cameraRotationX }, 500) // Set the duration of the animation
  .onUpdate(() => {
    window.test_scene.camera.updateProjectionMatrix();
  });

}

// Reusable
export function resetReusables( ) {
  /**
     * Move camera to "x"
     * Animation: Manual, reusable
     */
  window.test_scene.tweens.moveCamera = moveCamera();

  /**
    * Rotate camera to "x"
    * Animation: Manual, reusable
    */
  window.test_scene.tweens.rotateCamera = rotateCamera();

  /**
    * Reset the camera to original position and rotation.
    */
  let cameraRotationX = - (Math.PI / 30) * window.test_scene.camera.aspect;
  let cameraDefaultPosition = { x: 0, y: 18, z: -20 + (window.test_scene.room_depth / 2) },
      cameraDefaultRotation = { x: cameraRotationX, y: 0, z: 0 };
  window.test_scene.tweens.resetCameraPosition = resetCameraPosition( cameraDefaultPosition );
  window.test_scene.tweens.resetCameraRotation = resetCameraRotation( cameraDefaultRotation );
}

function moveCamera( ) {
  return new TWEEN.Tween(window.test_scene.camera.position)
    .easing(TWEEN.Easing.Quadratic.InOut) // Use desired easing function
    .onUpdate(() => {
      window.test_scene.camera.updateProjectionMatrix();
    })
    .onComplete(() => {
      window.test_scene.moving = false;
    });
  ;
}

function rotateCamera( ) {
  return new TWEEN.Tween(window.test_scene.camera.rotation)
  .easing(TWEEN.Easing.Quadratic.InOut) // Easing function
  .onUpdate(() => {
    window.test_scene.camera.updateProjectionMatrix();
  })
  .onComplete(() => {
    window.test_scene.moving = false;
  });
}

// Resets 

function resetCameraPosition( cameraDefaultPosition ) {
  return new TWEEN.Tween(window.test_scene.camera.position)
  .to(cameraDefaultPosition, 1000)
  .easing(TWEEN.Easing.Quadratic.InOut) // Use desired easing function
  .onUpdate(() => {
    window.test_scene.camera.updateProjectionMatrix();
  })
  .onComplete(() => {
    window.test_scene.moving = false;
  })
  ;
}


function resetCameraRotation( cameraDefaultRotation ) {
  return new TWEEN.Tween(window.test_scene.camera.rotation)
  .to(cameraDefaultRotation, 1000)
  .easing(TWEEN.Easing.Quadratic.InOut) // Use desired easing function
  .onUpdate(() => {
    window.test_scene.camera.updateProjectionMatrix();
  })
  ;
}
