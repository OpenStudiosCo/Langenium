/**
 * Missile
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';
import { TrailRenderer } from '@/../vendor/TrailRenderer.js';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralBuilding, proceduralMetalMaterial2 } from '@/scenograph/materials.js';

import MissileProjectile from '#/game/src/objects/projectiles/missile';

export default class Missile {

    // Array of active missiles on the scene
    active;

    // Array of active explosions on the scene
    explosions;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;

        this.size = 10;

        // Setup active missile array.
        this.active = [];

        // Track active explosions.
        this.explosions = [];

    }

    async load() {

        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} ); 

        const material = proceduralBuilding( {
            uniforms: {
                time        :  { value: 0.0 },
                scale       :  { value: .005 },                                         // Scale
                lacunarity  :  { value: 2.0 },                                          // Lacunarity
                randomness  :  { value: 1.0 },                                          // Randomness
                emitColour1 :  { value: new THREE.Vector4( 0.2, 0.2, 0.2, 0.25 ) },     // Emission gradient colour 1
                emitColour2 :  { value: new THREE.Vector4( 0.158, 1., 1., .9 ) },       // Emission gradient colour 2
                shadowFactor:  { value: 0.03 },
                shadowOffset:  { value: 0.1 },
            }
        } );

        window.missile = {};
        window.missile.outer = material;

        this.mesh = new THREE.Object3D();
        this.mesh.name = 'Missile';
        this.mesh.userData.targetable = false; // @todo: allow shooting at them when guns are introduced
        this.mesh.userData.objectClass = 'missiles';

        this.mesh.add(this.getMissileBody());

    }

    async loadExplosion( position ) {
        const explosionVideo = document.getElementById( 'explosion' ).cloneNode(true);
        explosionVideo.play();
        explosionVideo.playbackRate = 1.5;

        const texture = new THREE.VideoTexture( explosionVideo );
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 16/9, 1 );

        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                color: { value: new THREE.Color(0xffffff) },
                threshold: { value: 0.55 },
                smoothness: { value: 0.05 },
                rotation: { value: Math.random() * Math.PI - Math.PI * 0.5 }
            },
            vertexShader: `
                uniform float rotation;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    // Center the rotation
                    vec3 pos = position;
                    float s = sin(rotation);
                    float c = cos(rotation);

                    pos.xy = vec2(
                        c * position.x - s * position.y,
                        s * position.x + c * position.y
                    );

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                }
            `,
            fragmentShader: `
                uniform sampler2D map;
                uniform vec3 color;
                uniform float threshold;
                uniform float smoothness;
                varying vec2 vUv;

                void main() {
                    vec4 tex = texture2D(map, vUv);
                    float brightness = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

                    // Create smooth alpha edge
                    float alpha = smoothstep(threshold, threshold + smoothness, brightness);

                    vec4 finalColor = vec4(tex.rgb * color, alpha * tex.a);

                    if (finalColor.r < threshold) discard;
                    
                    gl_FragColor = finalColor;
                }
            `,
            transparent: true,
            depthWrite: false
        });

        const mesh = new THREE.Sprite( material );

        mesh.renderOrder = 999;

        mesh.scale.set( 30, 30, 30 );

        mesh.userData.created = l.current_scene.stats.currentTime;
        mesh.userData.texture = texture;
        mesh.userData.video = explosionVideo;

        mesh.position.copy( position );

        l.current_scene.scene.add( mesh );

        l.current_scene.objects.projectiles.missile.explosions.push( mesh );
    }

    /**
     * Fires a missile at a target.
     *
     * @param {*} originMesh Missile origin mesh
     * @param {*} originCoords Missile origin coordinates (at time of firing)
     * @param {*} destMesh Missile destination mesh (for collision detection)
     * @param {*} destCoords Destination coordinates for flight path
     */
    async fireMissile( originMesh, originCoords, destMesh, destCoords ) {
        let newMissile = l.current_scene.objects.projectiles.missile.mesh.clone();

        // Attach metas.
        newMissile.userData.created = l.current_scene.stats.currentTime;
        newMissile.userData.originMesh = originMesh;
        newMissile.userData.originCoords = originCoords;
        newMissile.userData.destMesh = destMesh;
        newMissile.userData.destCoords = destCoords;
        newMissile.userData.object = new MissileProjectile( newMissile );
        
        // Set starting position
        newMissile.position.x = originCoords.x;
        newMissile.position.y = originCoords.y;
        newMissile.position.z = originCoords.z;

        newMissile.lookAt( destCoords );

        // Add missile to the scene
        l.current_scene.scene.add(newMissile);

        // Add missile to the active missiles array (for animation etc)
        l.current_scene.objects.projectiles.missile.active.push( newMissile );

        // Add a trail to the missile.
        newMissile.userData.trail = l.current_scene.effects.trail.createTrail( newMissile, 0, 0, -1.5 );
    }

    // getMissileHead
    // getMissileTail
    getMissileBody() {
        const geometry = new THREE.CapsuleGeometry( 1, 40, 8, 16 );
        // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        const material = proceduralMetalMaterial2( {
            uniforms: {
                scale         :  { value: .75 },                                             // Scale
                lacunarity    :  { value: 2.0 },                                             // Lacunarity
                randomness    :  { value: .5 },                                              // Randomness
            }
        } );
        const capsule = new THREE.Mesh( geometry, material );
        capsule.scale.setScalar( 0.05 );

        capsule.rotation.x = Math.PI / 2;

        return capsule;
    }

    // @todo: This has to be simulated on the server somehow..
    animate( currentTime ) {
        l.current_scene.objects.projectiles.missile.active.forEach( ( missile, index ) => {
            
            if (
                // Check if
                // - it's been 10 seconds OR
                // - the missile has collided
                // since the missile was fired, explode if so
                ( parseFloat( l.current_scene.stats.currentTime ) >= parseFloat( missile.userData.created ) + 10000 ) ||
                ( missile.userData.object.hit() )
            ) {
                l.current_scene.objects.projectiles.missile.active.splice( index, 1 );
                l.current_scene.scene.remove( missile );
                missile.userData.trail.destroyMesh();
                missile.userData.trail.deactivate();
                l.current_scene.objects.projectiles.missile.loadExplosion( missile.userData.destMesh.position );
            }
            // Otherwise keep flying forward.
            else {
                
                let missileAge = parseFloat( missile.userData.created ) - parseFloat(l.current_scene.stats.currentTime );
                let missileSpeed = 1 + 4 * Math.min( ( missileAge / 2000 ), 1 );
                missile.lookAt( missile.userData.destMesh.position );
                missile.translateZ(-missileSpeed); // 5 meters per frame at 60fps is approx 432km per hour
                missile.userData.trail.update();
            }
        } );

        l.current_scene.objects.projectiles.missile.explosions.forEach( ( explosion, index ) => {
            // Check if it's been 2 seconds since the explosion started, remove if so
            if ( parseFloat( l.current_scene.stats.currentTime ) >= parseFloat( explosion.userData.created ) + 2000 ) {               
                // Remove the explosion from the scene.
                l.current_scene.scene.remove( explosion );
                explosion.geometry.dispose();
                explosion.material.uniforms.map.value.dispose();
                explosion.userData.texture.dispose();
                explosion.material.dispose();
                l.current_scene.renderers.webgl.renderLists.dispose();

                // Tidy up the explosion video element.
                explosion.userData.video.pause();
                explosion.userData.video.src = '';
                explosion.userData.video.removeAttribute('src'); // Sometimes needed for Safari
                explosion.userData.video.load();                 // Ensures src is cleared

                if (explosion.userData.video.parentNode) explosion.userData.video.parentNode.removeChild(explosion.userData.video);

                explosion = null;

                // Remove from the tracking array.
                l.current_scene.objects.projectiles.missile.explosions.splice( index, 1 );
            }
            else {
                explosion.lookAt( l.scenograph.cameras.active.position );

                explosion.material.uniforms.rotation.value *= 0.996;

                if ( parseFloat( l.current_scene.stats.currentTime ) >= parseFloat( explosion.userData.created ) + 500 ) {
                    explosion.scale.x *= 0.996;
                    explosion.scale.y *= 0.996;
                    explosion.scale.z *= 0.996;
                }
            }
        } );
    }

}
