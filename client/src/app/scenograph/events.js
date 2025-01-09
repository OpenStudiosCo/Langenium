/**
 * Events
 * 
 * Handles user interaction with the scene.
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { createOfficeRoom } from '@/scenograph/objects/office_room';
import { calculateAdjustedGapSize, setCameraFOV } from '@/helpers/math.js';

export default class Events {

    constructor() { }

    init() {
        
        window.addEventListener( "orientationchange", this.handleViewportChange );
        window.addEventListener( "resize", this.handleViewportChange );

        function onPointerMove( event ) {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components

            l.current_scene.pointer.x =
                ( event.clientX / l.scenograph.width ) * 2 - 1;
            l.current_scene.pointer.y =
                -( event.clientY / l.scenograph.height ) * 2 + 1;
        }

        l.current_scene.renderers.webgl.domElement.addEventListener(
            "pointermove",
            onPointerMove
        );

        function onTouchStart( event ) {
            if ( !l.current_scene.selected ) {
                event.preventDefault();

                l.current_scene.pointer.x =
                    ( event.changedTouches[ 0 ].clientX / l.scenograph.width ) * 2 - 1;
                l.current_scene.pointer.y =
                    -( event.changedTouches[ 0 ].clientY / l.scenograph.height ) * 2 + 1;
                l.current_scene.pointer.z = 1; // previously mouseDown = true
            }
        }
        function onTouchEnd( event ) {
            if ( !l.current_scene.selected ) {
                event.preventDefault();

                l.current_scene.pointer.x =
                    ( event.changedTouches[ 0 ].clientX / l.scenograph.width ) * 2 - 1;
                l.current_scene.pointer.y =
                    -( event.changedTouches[ 0 ].clientY / l.scenograph.height ) * 2 + 1;
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

        l.scenograph.setViewportSize();

        // Determine the new room gap size.
        l.current_scene.settings.adjusted_gap = calculateAdjustedGapSize();
        l.current_scene.room_depth = 8 * l.current_scene.settings.adjusted_gap;
    
        // Grab the new width and height.
        var width = l.scenograph.width;
        var height = l.scenograph.height;
    
        // Update the renderer dimensions.
        l.current_scene.renderers.webgl.setSize( width, height );
        if ( l.current_scene.effects.postprocessing && l.current_scene.effects.postprocessing.passes.length > 0 ) {
            l.current_scene.effects.postprocessing.setSize( width, height );
        }

        // Update cameras.
        l.scenograph.cameras.orbit.aspect = width / height;
        l.scenograph.cameras.player.aspect = width / height;
    
        l.scenograph.cameras.orbit.fov = setCameraFOV( l.scenograph.cameras.orbit.aspect );
        l.scenograph.cameras.player.fov = setCameraFOV( l.scenograph.cameras.player.aspect );

        l.scenograph.cameras.orbit.updateProjectionMatrix();
        l.scenograph.cameras.player.updateProjectionMatrix();
    
        const newRoom = await createOfficeRoom();
        l.current_scene.objects.room.geometry = newRoom.geometry;
    
        if ( !l.current_scene.started ) {
            if ( l.scenograph.cameras.player.aspect < 0.88 ) {
                l.current_scene.settings.startPosZ = -5;
            }
            else {
                l.current_scene.settings.startPosZ = -10;
            }
        }
        else {
    
            l.current_scene.objects.door.position.z = - 15 + ( l.current_scene.room_depth / 2 );
            l.current_scene.objects.door_frame.position.z = - 15 + ( l.current_scene.room_depth / 2 );
        }
    }
}


