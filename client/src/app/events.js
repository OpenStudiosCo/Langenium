/**
 * Events
 * 
 * Handles user interaction with the scene.
 */
import * as THREE from 'three';

import { calculateAdjustedGapSize, createOfficeRoom, setCameraFOV, doorWidth, doorDepth, doorHeight } from './main.js';

import { updateDeskZ } from './furniture.js';
import { resetReusables } from './tweens.js';

export async function handleViewportChange() {
  window.test_scene.settings.adjusted_gap = calculateAdjustedGapSize();
  window.test_scene.room_depth = 8 * window.test_scene.settings.adjusted_gap;

  var width = window.innerWidth;
  var height = window.innerHeight;

  window.test_scene.renderers.webgl.setSize(width, height);

  if (window.test_scene.effects.main)
    window.test_scene.effects.main.setSize(width, height);

  if (window.test_scene.effects.bloom)
    window.test_scene.effects.bloom.setSize(width, height);


  window.test_scene.camera.aspect = width / height;

  window.test_scene.camera.fov = setCameraFOV(window.test_scene.camera.aspect);
  if (!window.test_scene.selected &&  ! window.test_scene.moving) {
    let posZ = -20;
    window.test_scene.camera.position.z = posZ + (window.test_scene.room_depth / 2);
    window.test_scene.camera.rotation.x = - (Math.PI / 30) * window.test_scene.camera.aspect;
  }
  window.test_scene.camera.updateProjectionMatrix();
  
  const newRoom = await createOfficeRoom();
  window.test_scene.scene_objects.room.geometry = newRoom.geometry;

  if ( ! window.test_scene.started ) {
    if (window.test_scene.camera.aspect < 0.88) {
      window.test_scene.settings.startPosZ = -5;
    }
    else {
      window.test_scene.settings.startPosZ = -10;
    }
  }
  else {
    
    // Adjust desk positions based on the aspect ratio
    window.test_scene.scene_objects.deskGroup.children.forEach(function (mesh, i) {
      if ( mesh.name == 'desk') {
        updateDeskZ(mesh, mesh.deskIndex);

        updateDeskZ(mesh.webGLScreen, mesh.deskIndex);

        mesh.webGLScreen.position.z += .175;

      }

      if ( mesh.name == 'chair') {
        updateDeskZ(mesh, mesh.deskIndex);
      }
    });
    window.test_scene.scene_objects.deskGroup.children.forEach(function (mesh, i) {
      if ( mesh.name == 'plant') {
        mesh.position.z = window.test_scene.settings.adjusted_gap;
      }
    });

    window.test_scene.scene_objects.door.position.z = - 15 + (window.test_scene.room_depth / 2);
    window.test_scene.scene_objects.door_frame.position.z = - 15 + (window.test_scene.room_depth / 2);
  }
}

export function handleInteractions( ) {
  // update the picking ray with the camera and pointer position
  window.test_scene.raycaster.setFromCamera(new THREE.Vector2(window.test_scene.pointer.x, window.test_scene.pointer.y), window.test_scene.camera);

  // calculate objects intersecting the picking ray
  const intersects = window.test_scene.raycaster.intersectObjects(window.test_scene.scene.children);

  if (intersects.length > 0) {  
    for (let i = 0; i < intersects.length; i++) {

      // If nothing is selected, allow hover effects.
      if (!window.test_scene.selected) {

        // Clear the hovered object.
        window.test_scene.hovered = intersects[i].object;
      
        document.documentElement.style.cursor = "default";

        if (intersects[i].object.name == "screen" || intersects[i].object.name == "desk_part" || intersects[i].object.name == "desk_label") {
          document.documentElement.style.cursor = "pointer";
    
          handleScreenClick(intersects[i].object.parent);
    
          break;
        }
    
        if (intersects[i].object.name == "neon_sign" || intersects[i].object.name == "tv") {
          document.documentElement.style.cursor = "pointer";

          handleScreenClick(intersects[i].object.parent);
    
          break;
        }
    
      }
      // Otherwise we're only tracking interaction with the exit sign.
      else {
        document.documentElement.style.cursor = "inherit";
        if ( ! window.test_scene.hovered ) {
          window.test_scene.hovered = window.test_scene.selected;
        }
      }
    }
  }
  else {
    window.test_scene.hovered = false;
  }
}

function handleScreenClick( screen ) {
  if (window.test_scene.pointer.z && !window.test_scene.moving) {
    if (!window.test_scene.selected) {
      window.test_scene.moving = true;
      window.test_scene.selected = screen;

      let [ targetPosition, targetRotation ] = screen.webGLScreen.getViewingCoords( );

      // Start loading the screen.
      document.getElementById('pageOverlay').src = window.test_scene.selected.webGLScreen.pageUrl;
      document.title =  window.test_scene.selected.webGLScreen.pageTitle + ' | Open Studios | Perth, Western Australia';

      history.pushState({}, "", window.test_scene.selected.webGLScreen.pageRealUrl);

      window.test_scene.tweens.rotateCamera.to({ x: targetRotation.x, y: targetRotation.y, z: targetRotation.z }, 1000).start();
      window.test_scene.tweens.moveCamera.to(targetPosition, 1000).onComplete(stretchSelectedScreen).start();

    }

  }
}


export function handleExitSign() {

  document.title =  'Open Studios | Perth, Western Australia';
  history.pushState({}, "", '/');
  
  window.test_scene.moving = true;
  var targetRotation = - (Math.PI / 30) * window.test_scene.camera.aspect;

  let cameraDefaultPosition = { x: 0, y: 18, z: -20 + (window.test_scene.room_depth / 2) },
    cameraDefaultRotation = { x: targetRotation, y: 0, z: 0 };

  // Animate the camera resetting from any other position.
  resetReusables();
  window.test_scene.tweens.resetCameraRotation.start();
  window.test_scene.tweens.resetCameraPosition.onStart(shrinkScreenBack).start();

  window.test_scene.selected = false;
  
  
}

/**
 * Helpers
 */

// Function to update the CSS object's size to fit the visible space
function stretchSelectedScreen() {

  document.getElementById('pageOverlay').style.display = 'block';
  
  document.getElementById('exitSign').style.display = 'block';
}

// Restore the CSS object to its original size.
function shrinkScreenBack() {
  
  // Reset scroll position of the iFrame
  document.getElementById('pageOverlay').contentWindow.scrollTo( 0 , 0 );

  document.getElementById('pageOverlay').style.display = 'none';

  document.getElementById('exitSign').style.display = 'none';  

}