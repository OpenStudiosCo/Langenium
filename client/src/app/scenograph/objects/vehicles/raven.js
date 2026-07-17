/**
 * Enemy bot.
 *
 * Currently hardcoded to use the Raven aircraft.
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { brightenMaterial, proceduralMetalMaterial } from '@/scenograph/materials.js';
import PirateActor from '#/game/src/actors/pirate';
import RavenObject from '#/game/src/objects/vehicles/raven';

export default class Raven {


    // An actor containing AI behaviours.
    actor;

    // THREE.Mesh clones
    instances;

    // Ship Model (gltf)
    model;

    // The ship mesh.
    mesh;

    // Model is loaded and the Bot is ready to be used.
    ready;

    // Aircraft flight sim data like airspeed.
    state;

    constructor() {

        this.instances = [];
        this.default_camera_distance = l.scenograph.width < l.scenograph.height ? -70 : -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;

        this.ready = false;

    }

    // Loads the ship model inc built-in animations
    async load() {


        this.model = await l.current_scene.loaders.gtlf.loadAsync( './assets/models/pirate2.1.glb' );

        let amount = l.config.settings.fast ? 5 : 2.5;

        this.model.scene.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;

                child.original_material = child.material.clone();

                let scale = 0.35;

                if ( child.name == 'Chassis' ) {
                    scale = 1.05;
                }

                if ( child.material.name != 'Glass' ) {

                    child.material = proceduralMetalMaterial( {
                        uniforms: {
                            scale: { value: scale },                                           // Scale
                            lacunarity: { value: 2.0 },                                             // Lacunarity
                            randomness: { value: 1.0 },                                             // Randomness
                            diffuseColour1: { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40 ) },     // Diffuse gradient colour 1
                            diffuseColour2: { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43 ) },        // Diffuse gradient colour 2
                            diffuseColour3: { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44 ) },     // Diffuse gradient colour 3
                            emitColour1: { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61 ) },     // Emission gradient colour 1
                            emitColour2: { value: new THREE.Vector4( 1.0, 0.0, 0.0, 0.63 ) },        // Emission gradient colour 2
                        }
                    } );

                }
                else {
                    child.material = new THREE.MeshPhysicalMaterial( {
                        color: 0xf6ee04,
                        flatShading: true,
                        metalness: 0.5,
                        reflectivity: 1,
                        roughness: 0
                    } );
                }

            }

        } );

        this.mesh = this.model.scene;
        this.mesh.name = 'Bot Ship';
        this.mesh.userData.targetable = true;
        this.mesh.userData.objectClass = 'bot';
        this.mesh.position.z = -1500;
        this.mesh.position.y = 200;
        this.mesh.children[0].rotation.y = Math.PI;
        this.mesh.rotation.order = 'YXZ';

        // const vehicleGeometry = new THREE.ConeGeometry( 5, 20, 32 );
        // vehicleGeometry.rotateX( Math.PI * 0.5 );
        // const vehicleMaterial = new THREE.MeshNormalMaterial();

        // this.mesh = new THREE.Mesh( vehicleGeometry, vehicleMaterial );
        // this.mesh.scale.set(100,100,100);
        this.mesh.matrixAutoUpdate = false;



    }

    async get() {
        let mesh = this.mesh.clone();

        // mesh.userData.object = new RavenObject( mesh );
        // mesh.userData.object.standing = -1;
        // Set the object start position based on the path.
        // @todo: pluck it dynamically from path.
        // mesh.userData.object.startPosition.x = -2000;
        // mesh.userData.object.startPosition.y = this.mesh.position.y;
        // mesh.userData.object.startPosition.z = -1000;

        this.instances.push( mesh );

        return mesh;
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof Raven
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {

        // @todo: #31: remove?
        // if ( l.current_scene.settings.game_controls ) {
        //     l.scenograph.objects.vehicles.raven.instances.forEach( raven => {
        //         raven.userData.actor.animate( delta );
        //     } );
        // }
    }


}
