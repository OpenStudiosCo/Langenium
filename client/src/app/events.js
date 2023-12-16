/**
 * Events
 * 
 * Handles user interaction with the scene.
 */
import * as THREE from 'three';

import { calculateAdjustedGapSize, createOfficeRoom, setCameraFOV, doorWidth, doorDepth, doorHeight } from './main.js';

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
    //window.test_scene.camera.position.z = posZ + (window.test_scene.room_depth / 2);
    //window.test_scene.camera.rotation.x = - (Math.PI / 30) * window.test_scene.camera.aspect;
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
    
    window.test_scene.scene_objects.door.position.z = - 15 + (window.test_scene.room_depth / 2);
    window.test_scene.scene_objects.door_frame.position.z = - 15 + (window.test_scene.room_depth / 2);
  }
}
