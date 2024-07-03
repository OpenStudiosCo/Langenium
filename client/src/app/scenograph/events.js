/**
 * Events
 * 
 * Handles user interaction with the scene.
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { createOfficeRoom } from '@/scenograph/scenes/assets/office_room';
import { calculateAdjustedGapSize, setCameraFOV } from '@/helpers/math.js';

export default class Events {

    constructor() { }

    init() {
        
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
    }

    async handleViewportChange () {
        l.current_scene.settings.adjusted_gap = calculateAdjustedGapSize();
        l.current_scene.room_depth = 8 * l.current_scene.settings.adjusted_gap;
    
        var width = window.innerWidth;
        var height = window.innerHeight;
    
        l.current_scene.renderers.webgl.setSize( width, height );
    
        if ( l.current_scene.effects.postprocessing && l.current_scene.effects.postprocessing.passes.length > 0 )
            l.current_scene.effects.postprocessing.setSize( width, height );
    
    
        l.current_scene.camera.aspect = width / height;
    
        l.current_scene.camera.fov = setCameraFOV( l.current_scene.camera.aspect );
        if ( !l.current_scene.selected && !l.current_scene.moving ) {
            let posZ = -20;
            //l.current_scene.camera.position.z = posZ + (l.current_scene.room_depth / 2);
            //l.current_scene.camera.rotation.x = - (Math.PI / 30) * l.current_scene.camera.aspect;
        }
        l.current_scene.camera.updateProjectionMatrix();
    
        const newRoom = await createOfficeRoom();
        l.current_scene.scene_objects.room.geometry = newRoom.geometry;
    
        if ( !l.current_scene.started ) {
            if ( l.current_scene.camera.aspect < 0.88 ) {
                l.current_scene.settings.startPosZ = -5;
            }
            else {
                l.current_scene.settings.startPosZ = -10;
            }
        }
        else {
    
            l.current_scene.scene_objects.door.position.z = - 15 + ( l.current_scene.room_depth / 2 );
            l.current_scene.scene_objects.door_frame.position.z = - 15 + ( l.current_scene.room_depth / 2 );
        }
    }
}


