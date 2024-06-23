/**
 * Union Extractor
 * 
 * 
 */
import * as THREE from 'three';

import { proceduralBuilding, proceduralMetalMaterial2, proceduralSolarPanel } from '../materials.js';
import { HOLLOW_SUBTRACTION    , Brush, Evaluator } from 'three-bvh-csg';

export default class Extractor {

    // THREE.Planes for clipping this out of the water material.
    clippingPlanes;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;
        this.size = 250;
    }

    async load() {

        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} ); 

        const transparentMaterial = new THREE.MeshLambertMaterial({
            opacity: 0,
            transparent: true
          });

        const material = proceduralBuilding({
            uniforms: {
                time: 			    { value: 0.0 },
                scale:              { value: .01 },                                        // Scale
                lacunarity:         { value: 2.0 },                                         // Lacunarity
                randomness:         { value: 1.0 },                                       // Randomness
                diffuseColour1:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40) },  // Diffuse gradient colour 1
                diffuseColour2:     { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43) },     // Diffuse gradient colour 2
                diffuseColour3:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44) },  // Diffuse gradient colour 3
                //emitColour1:        { value: new THREE.Vector4( 0.005, 0.051, 0.624, 0.25) },  // Emission gradient colour 1
                emitColour1:        { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25) },  // Emission gradient colour 1
                emitColour2:        { value: new THREE.Vector4( 0.158, 1., 1., .9) },     // Emission gradient colour 2
            }
        });

        material.transparent = true;
        material.side = THREE.DoubleSide;

        window.extractor = {};
        window.extractor.outer = material;

        // this.mesh = new THREE.Object3D();

        // let outerMesh = new THREE.Mesh( new THREE.CylinderGeometry( 5, 5, 5, 8, 1, true ), material );
        // let innerMesh = new THREE.Mesh( new THREE.CylinderGeometry( 4, 4, 4, 8, 1, true ), material );
        // innerMesh.position.y = 1.;

        // this.mesh.add(outerMesh);
        // this.mesh.add(innerMesh);
        // this.mesh.scale.setScalar(this.size);

        let outerMesh = new Brush( new THREE.CylinderGeometry( 5, 5, 5, 12, 1, false ), material );
        outerMesh.scale.setScalar(this.size);
        outerMesh.updateMatrixWorld();

        let innerMesh = new Brush( new THREE.CylinderGeometry( 4, 4, 4, 12, 1, false ), material );
        innerMesh.position.y = 1000;
        innerMesh.scale.setScalar(this.size);
        innerMesh.updateMatrixWorld();

        // this.mesh.add(outerMesh);
        // this.mesh.add(innerMesh);

        let result = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial()
          );
        
        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        csgEvaluator.evaluate(outerMesh, innerMesh, HOLLOW_SUBTRACTION    , result);
        result.receiveShadow = true;
        result.layers.set(11);

        let innerMesh2 = new THREE.Mesh( new THREE.CylinderGeometry( 4, 4, 5, 12, 1, true ), material.clone() );
        window.extractor.inner = innerMesh2.material;
        innerMesh2.material.uniforms.scale.value = 1.33;
        innerMesh2.position.y = 0;
        innerMesh2.scale.setScalar(this.size);
        innerMesh2.updateMatrixWorld();

        this.mesh = new THREE.Object3D();
        this.mesh.add(result);
        this.mesh.add(innerMesh2);
        this.mesh.add(this.getStorageTanks());

        let phatTank1 = this.getPhatTank();
        phatTank1.position.x = 350;
        phatTank1.position.y = -600;
        phatTank1.position.z = -400;
        this.mesh.add(phatTank1);

        let phatTank2 = this.getPhatTank();
        phatTank2.position.x = 350;
        phatTank2.position.y = -600;
        phatTank2.position.z = 400;
        this.mesh.add(phatTank2);
        
    }

    getPhatTank() {
        const geometry = new THREE.SphereGeometry( 3, 32, 16 ); 
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
        const material = proceduralMetalMaterial2({
            uniforms: {
                scale:              { value: 1.5 },                                        // Scale
                lacunarity:         { value: 2.0 },                                         // Lacunarity
                randomness:         { value: .5 },                                       // Randomness
                diffuseColour1:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40) },  // Diffuse gradient colour 1
                diffuseColour2:     { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43) },     // Diffuse gradient colour 2
                diffuseColour3:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44) },  // Diffuse gradient colour 3
                emitColour1:        { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61) },  // Emission gradient colour 1
                emitColour2:        { value: new THREE.Vector4( 0.3, 0.3, 0.3, 0.63) },     // Emission gradient colour 2
            }
        });
        const sphere = new THREE.Mesh( geometry, material );
        sphere.scale.setScalar(100);
        return sphere;
    }

    getStorageTanks() {
        const offset = 250;
        const tankArray = [
            { x: -offset, z: -offset },
            { x: -offset * 1.75, z: 0.00 },
            { x: -offset * 2, z: offset },
            { x: -offset * 2, z: offset * 2 },
            { x: -offset * 1.75, z: offset * 3 },
            { x: -offset , z: offset * 4 },
            { x: 0.00, z: -offset },
            { x: -offset * .75, z: 0.00 },
            { x: -offset * 1.0, z: offset },
            { x: -offset * 1.0, z: offset * 2 },
            { x: -offset * 0.75, z: offset * 3 },
            { x: 0.00, z: offset * 4 },
            
        ];

        let tankMeshes = new THREE.Object3D();

        tankArray.forEach( ( coord, i ) => {
            let tank = this.getStorageTank();
            tank.position.x = coord.x - offset ;
            tank.position.z = coord.z - offset * 1.5;
            tank.rotation.y = i;
            tankMeshes.add(tank);
        });

        tankMeshes.position.y = -400;
        return tankMeshes;
    }

    getStorageTank() {
        const geometry = new THREE.CapsuleGeometry( 1, 14, 8, 16 ); 
        // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        const material = proceduralMetalMaterial2({
            uniforms: {
                scale:              { value: .75 },                                        // Scale
                lacunarity:         { value: 2.0 },                                         // Lacunarity
                randomness:         { value: .5 },                                       // Randomness
                diffuseColour1:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40) },  // Diffuse gradient colour 1
                diffuseColour2:     { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43) },     // Diffuse gradient colour 2
                diffuseColour3:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44) },  // Diffuse gradient colour 3
                emitColour1:        { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61) },  // Emission gradient colour 1
                emitColour2:        { value: new THREE.Vector4( 0.3, 0.3, 0.3, 0.63) },     // Emission gradient colour 2
            }
        });
        const capsule = new THREE.Mesh( geometry, material );
        capsule.scale.setScalar(100);

        return capsule;
    }

    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        window.extractor.inner.uniforms.time.value += 0.0125;
        window.extractor.outer.uniforms.time.value += 0.0125;
    }

}
