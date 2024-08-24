/**
 * Enemy bot.
 * 
 * Currently hardcoded to use the Pirate aircraft.
 */
import * as THREE from 'three';
import * as YUKA from 'yuka';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { brightenMaterial, proceduralMetalMaterial } from '@/scenograph/materials.js';
import Raven from '#/game/src/objects/aircraft/raven.js';

export default class Bot {
    // AI seeing distance.
    sight_radius;

    // Ship Model (gltf)
    model;

    // The ship mesh.
    mesh;

    // Model is loaded and the Bot is ready to be used.
    ready;

    // Aircraft flight sim data like airspeed.
    state;

    // YUKA.Vehicle instance.
    vehicle;

    constructor() {
        this.default_camera_distance = window.innerWidth < window.innerHeight ? -70 : -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;

        this.ready = false;

        this.state = new Raven();

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
        this.mesh.position.z = - l.current_scene.room_depth * 2;
        this.mesh.position.y = 20;
        this.mesh.rotation.order = 'YXZ';

        // const vehicleGeometry = new THREE.ConeGeometry( 5, 20, 32 );
        // vehicleGeometry.rotateX( Math.PI * 0.5 );
        // const vehicleMaterial = new THREE.MeshNormalMaterial();

        // this.mesh = new THREE.Mesh( vehicleGeometry, vehicleMaterial );
        // this.mesh.scale.set(100,100,100);
        this.mesh.matrixAutoUpdate = false;

        this.vehicle = new YUKA.Vehicle();
        this.vehicle.position.z = this.mesh.position.z;
        this.vehicle.position.y = this.mesh.position.y;
        this.vehicle.maxSpeed = 500;
        this.vehicle.setRenderComponent( this.mesh, this.sync );
        this.vehicle.boundingRadius = 20;
        this.vehicle.smoother = new YUKA.Smoother( 20 );
        this.vehicle.rotation.order = 'XYZ';

        l.scenograph.entityManager.add( this.vehicle );

        let obstacles = [];
 
        // const boundaryHandler = new YUKA.ObstacleAvoidanceBehavior(
        //     obstacles
        // )
        // this.vehicle.steering.add( boundaryHandler );


        const loopDistance = 1500;
        const path = new YUKA.Path();
			path.loop = true;
			path.add( new YUKA.Vector3( loopDistance, 20, loopDistance ) );
			path.add( new YUKA.Vector3( loopDistance, 20, - loopDistance ) );
			path.add( new YUKA.Vector3( - loopDistance, 20, - loopDistance ) );
			path.add( new YUKA.Vector3( - loopDistance, 20, loopDistance ) );

        // const wanderBehavior = new YUKA.WanderBehavior();
        // // wanderBehavior.distance = 100;
        // // wanderBehavior.jitter = 100;
        // // wanderBehavior.radius = 1.5;
        // this.vehicle.steering.add( wanderBehavior );

        const followPathBehavior = new YUKA.FollowPathBehavior( path );
        this.vehicle.steering.add( followPathBehavior );

        // l.current_scene.objects.boundaries.forEach( ( boundaryMesh ) => {
        //     const obstacle1 = new YUKA.GameEntity();
        //     obstacle1.position.copy( boundaryMesh.position );
            
        //     obstacle1.boundingRadius = boundaryMesh.geometry.boundingSphere.radius;
            
        //     l.scenograph.entityManager.add( obstacle1 );
        //     obstacles.push(obstacle1);
        // } );


    }

    // Runs on the main animation loop
    animate( delta ) {

        l.scenograph.entityManager.update( delta );
    }

    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );

    }
}

