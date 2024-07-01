/**
 * Union Platform
 * 
 * 
 */
import * as THREE from 'three';

import { proceduralBuilding, proceduralMetalMaterial2, proceduralSolarPanel } from '../../materials.js';

export default class Platform {

    // THREE.Mesh
    mesh;

    // Platform Model (gltf)
    model;

    constructor() {
        this.ready = false;
    }

    // Loads the ship model inc built-in animations
    async load() {

        this.model = await l.current_scene.loaders.gtlf.loadAsync( './assets/models/union-platform6.1.glb' );

        let amount = l.config.settings.fast ? 5 : 2.5;

        this.model.scene.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;

                child.original_material = child.material.clone();

                if ( child.material.name == 'Buildings' ) {

                    child.material = proceduralBuilding( {
                        uniforms: {
                            time        :  { value: 0.0 },
                            scale       :  { value: 3.3 },                                          // Scale
                            lacunarity  :  { value: 2.0 },                                          // Lacunarity
                            randomness  :  { value: 1.0 },                                          // Randomness
                            emitColour1 :  { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25 ) },     // Emission gradient colour 1
                            emitColour2 :  { value: new THREE.Vector4( 0.158, 1., 1., .9 ) },       // Emission gradient colour 2
                            shadowFactor:  { value: 0.15 },
                            shadowOffset:  { value: 0.5 },
                        }
                    } );

                    window.buildings = child.material;

                }
                if ( child.material.name == 'Pole Cover' ) {
                    // @todo: turn this red.
                    child.material = proceduralMetalMaterial2( {
                        uniforms: {
                            scale         :  { value: 2.55 },                                            // Scale
                            lacunarity    :  { value: 2.0 },                                             // Lacunarity
                            randomness    :  { value: 1. },                                              // Randomness
                        }
                    } );
                }
                if ( child.material.name == 'City Cradle' ) {
                    child.material = proceduralMetalMaterial2( {
                        uniforms: {
                            scale         :  { value: 5.55 },                                            // Scale
                            lacunarity    :  { value: 2.0 },                                             // Lacunarity
                            randomness    :  { value: 1. },                                              // Randomness
                        }
                    } );
                }

                if ( child.material.name == 'Pole' || child.material.name == 'Solar Panel Arms' ) {
                    child.material = proceduralMetalMaterial2( {
                        uniforms: {
                            scale         :  { value: 3.55 },                                            // Scale
                            lacunarity    :  { value: 2.0 },                                             // Lacunarity
                            randomness    :  { value: 1. },                                              // Randomness
                        }
                    } );
                }

                if ( child.material.name == 'Solar Panels' ) {

                    child.material = proceduralSolarPanel( {
                        uniforms: {
                            scale         :  { value: .55 },                                             // Scale
                            lacunarity    :  { value: 2.0 },                                             // Lacunarity
                            randomness    :  { value: 1.0 },                                             // Randomness
                        }
                    } );

                }

            }

        } );

        this.mesh = this.model.scene;
        this.mesh.scale.multiplyScalar( 2000 );
        this.mesh.rotation.order = 'YXZ';
        this.ready = true;
    }

    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        window.buildings.uniforms.time.value += 0.025;
    }

}
