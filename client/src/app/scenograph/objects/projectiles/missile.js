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

export default class Missile {

    // Array of active missiles on the scene
    active;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;

        this.size = 10;

        // Setup active missile array.
        this.active = [];
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
        this.mesh.userData.targetable = true;
        this.mesh.userData.objectClass = 'missiles';

        this.mesh.add(this.getMissileBody());

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
        
        // Set starting position
        newMissile.position.x = originCoords.x;
        newMissile.position.y = originCoords.y;
        newMissile.position.z = originCoords.z;

        newMissile.lookAt( destCoords );

        // Add missile to the scene
        l.current_scene.scene.add(newMissile);

        // Add missile to the active missiles array (for animation etc)
        l.current_scene.objects.projectiles.missile.active.push( newMissile );

        // specify points to create planar trail-head geometry
        const trailHeadGeometry = l.current_scene.effects.trail.createTrailCircle();

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
            // Check if it's been 10 seconds since the missile was fired, self destruct if so
            if ( parseFloat(l.current_scene.stats.currentTime ) >= parseFloat( missile.userData.created ) + 10000 ) {
                l.current_scene.objects.projectiles.missile.active.splice( index, 1 );
                l.current_scene.scene.remove( missile );
                missile.userData.trail.destroyMesh();
                missile.userData.trail.deactivate();
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
    }

}
