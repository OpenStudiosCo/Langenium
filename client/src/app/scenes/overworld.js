import SceneBase from './base';
import * as THREE from 'three';

import Ocean from '../scene_assets/ocean';
import Sky from '../scene_assets/sky';
import Ship from '../scene_assets/ship';

import {
    createDoor,
    createOfficeRoom,
    doorHeight,
    doorWidth
} from '../scene_assets/office_room';
import {
    scaleEffects,
    setupEffects
} from '../effects';
import {
    setupTriggers,
    updateTriggers
} from '../scene_assets/triggers';
import {
    setupTweens,
    updateTweens,
    startTweening
} from '../scene_assets/tweens';

export default class Overworld extends SceneBase {

    constructor() {
        super();
    }

    animate(currentTime) {

        updateFPS();

        if (window.l.current_scene.started) {

            if (window.l.current_scene.animation_queue.length > 0) {
                for (var i = 0; i < window.l.current_scene.animation_queue.length; i++) {
                    window.l.current_scene.animation_queue[i](currentTime)
                }
            }

            updateTriggers(currentTime);

            updateTweens(currentTime);
        }

        if (window.l.current_scene.debug) {
            stats.update();
        }

        // Render the composer
        if (
            // Effects loaded.
            window.l.current_scene.effects.bloomLayer.test &&
            (window.l.current_scene.effects.bloom && window.l.current_scene.effects.bloom.passes && window.l.current_scene.effects.bloom.passes.length > 0) &&
            (window.l.current_scene.effects.main && window.l.current_scene.effects.main.passes && window.l.current_scene.effects.main.passes.length > 0) &&
            // Not fast mode.
            (!window.l.current_scene.fast)
        ) {
            window.l.current_scene.scene.traverse(darkenNonBloomed);
            window.l.current_scene.effects.bloom.render();
            window.l.current_scene.scene.traverse(restoreMaterial);
            window.l.current_scene.effects.main.render();
        } else {
            window.l.current_scene.renderers.webgl.render(window.l.current_scene.scene, window.l.current_scene.camera); // Render the scene without the effects
        }

        requestAnimationFrame(window.l.current_scene.animate);

    }

    async setup() {

        // Scene container.
        window.l.current_scene.scene = new THREE.Scene();
        window.l.current_scene.scene.visible = false;

        if (!window.l.current_scene.fast) {
            window.l.current_scene.renderers.webgl.shadowMap.enabled = true;
            setupEffects();
        }

        window.l.current_scene.scene_objects.door = await createDoor();
        window.l.current_scene.scene_objects.door.position.set(-doorWidth / 2, -5 + (doorHeight / 2), -15 + (window.l.current_scene.room_depth / 2));
        window.l.current_scene.scene.add(window.l.current_scene.scene_objects.door);

        // Setup skybox
        window.l.current_scene.scene_objects.sky = new Sky();
        window.l.current_scene.scene.add(window.l.current_scene.scene_objects.sky.mesh);
        window.l.current_scene.animation_queue.push(window.l.current_scene.scene_objects.sky.animate);

        // Setup ocean
        window.l.current_scene.scene_objects.ocean = new Ocean();
        window.l.current_scene.scene.add(window.l.current_scene.scene_objects.ocean.water);
        window.l.current_scene.animation_queue.push(window.l.current_scene.scene_objects.ocean.animate);

        // Setup Ship
        window.l.current_scene.scene_objects.ship = new Ship();
        await window.l.current_scene.scene_objects.ship.load();
        window.l.current_scene.scene.add(window.l.current_scene.scene_objects.ship.mesh);
        window.l.current_scene.animation_queue.push(window.l.current_scene.scene_objects.ship.animate);

        // Adjust ambient light intensity
        window.l.current_scene.scene_objects.ambientLight = new THREE.AmbientLight(window.l.current_scene.fast ? 0x555555 : 0x444444); // Dim ambient light color
        window.l.current_scene.scene.add(window.l.current_scene.scene_objects.ambientLight);

        window.l.current_scene.scene_objects.screens_loaded = 0;
        window.l.current_scene.scene_objects.room = await createOfficeRoom();
        window.l.current_scene.scene.add(window.l.current_scene.scene_objects.room);

        // Setup triggers
        setupTriggers();

        // Setup Tweens.
        setupTweens();

        let loadersComplete = true;

        // Check if we've finished loading.
        let bootWaiter = setInterval(() => {

            // for ( var measure in window.l.current_scene.loaders.stats ) {
            //   if (window.l.current_scene.loaders.stats[measure].loaded != window.l.current_scene.loaders.stats[measure].target) {
            //     loadersComplete = false;
            //   }
            // }
            if (
                loadersComplete &&
                // Check door sign is loaded up.
                window.l.current_scene.scene_objects.door_sign
            ) {
                window.l.current_scene.ready = true;
                clearTimeout(bootWaiter);

                // Start tweens.
                startTweening();

                requestAnimationFrame(window.l.current_scene.animate);
            }
        }, 100);

    }
}


function updateFPS() {
    // Calculate FPS
    window.l.current_scene.stats.currentTime = performance.now();
    const timeDiff = window.l.current_scene.stats.currentTime - window.l.current_scene.stats.lastTime;
    window.l.current_scene.stats.frameCount++;
    if (timeDiff >= 1000) {
        window.l.current_scene.stats.fps = Math.round((window.l.current_scene.stats.frameCount * 1000) / timeDiff);
        window.l.current_scene.stats.frameCount = 0;
        window.l.current_scene.stats.lastTime = window.l.current_scene.stats.currentTime;
    }
}
let darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
function darkenNonBloomed(obj) {

    if (obj.isMesh && window.l.current_scene.effects.bloomLayer.test(obj.layers) === false) {

        window.l.current_scene.materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;

    }

}

function restoreMaterial(obj) {

    if (window.l.current_scene.materials[obj.uuid]) {

        obj.material = window.l.current_scene.materials[obj.uuid];
        delete window.l.current_scene.materials[obj.uuid];

    }

}