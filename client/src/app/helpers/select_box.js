import l from './l.js';

l.select_box = function ( object ) {
    // Remove any existing select boxes
    if ( l.current_scene.scene_objects.select_box ) {
        l.current_scene.scene.remove( l.current_scene.scene_objects.select_box );
        delete l.current_scene.scene_objects.select_box;
    }

    const box = new THREE.BoxHelper( object, 0xffff00 );
    l.current_scene.scene_objects.select_box = box;
    l.current_scene.scene.add( l.current_scene.scene_objects.select_box );

    l.current_scene.animation_queue.push(
        l.select_box_update
    );
}

l.select_box_update = function () {
    l.current_scene.scene_objects.select_box.position.copy( l.current_scene.scene_objects.select_box.object.position );
    l.current_scene.scene_objects.select_box.rotation.copy( l.current_scene.scene_objects.select_box.object.rotation );
    l.current_scene.scene_objects.select_box.update();
}
