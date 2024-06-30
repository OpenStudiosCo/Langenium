/**
 * Events
 * 
 * Handles user interaction with the scene.
 */
import * as THREE from 'three';

import { createOfficeRoom } from './scene_assets/office_room';
import { calculateAdjustedGapSize, setCameraFOV } from './helpers/math.js';

import { resetReusables } from './scene_assets/tweens.js';

export default class Events {
    constructor() {

    }
}

export async function handleViewportChange() {
    window.l.current_scene.settings.adjusted_gap = calculateAdjustedGapSize();
    window.l.current_scene.room_depth = 8 * window.l.current_scene.settings.adjusted_gap;

    var width = window.innerWidth;
    var height = window.innerHeight;

    window.l.current_scene.renderers.webgl.setSize( width, height );

    if ( window.l.current_scene.effects.postprocessing && window.l.current_scene.effects.postprocessing.passes.length > 0 )
        window.l.current_scene.effects.postprocessing.setSize( width, height );


    window.l.current_scene.camera.aspect = width / height;

    window.l.current_scene.camera.fov = setCameraFOV( window.l.current_scene.camera.aspect );
    if ( !window.l.current_scene.selected && !window.l.current_scene.moving ) {
        let posZ = -20;
        //window.l.current_scene.camera.position.z = posZ + (window.l.current_scene.room_depth / 2);
        //window.l.current_scene.camera.rotation.x = - (Math.PI / 30) * window.l.current_scene.camera.aspect;
    }
    window.l.current_scene.camera.updateProjectionMatrix();

    const newRoom = await createOfficeRoom();
    window.l.current_scene.scene_objects.room.geometry = newRoom.geometry;

    if ( !window.l.current_scene.started ) {
        if ( window.l.current_scene.camera.aspect < 0.88 ) {
            window.l.current_scene.settings.startPosZ = -5;
        }
        else {
            window.l.current_scene.settings.startPosZ = -10;
        }
    }
    else {

        window.l.current_scene.scene_objects.door.position.z = - 15 + ( window.l.current_scene.room_depth / 2 );
        window.l.current_scene.scene_objects.door_frame.position.z = - 15 + ( window.l.current_scene.room_depth / 2 );
    }
}
