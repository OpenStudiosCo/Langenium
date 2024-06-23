/**
 * Union Extractor
 * 
 * 
 */
import * as THREE from 'three';

import { proceduralBuilding, proceduralMetalMaterial2, proceduralSolarPanel } from '../materials.js';

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

        const geometry = new THREE.CylinderGeometry( 5, 5, 5, 8 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent: true, opacity: 0.5, side: THREE.DoubleSide} ); 

        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.scale.setScalar(this.size);

        this.clippingPlanes = this.getClippingPlanes ( this.size  * 4);
    }

    getClippingPlanes ( size ) {

        const side_factor = 1.45;
        const plane_size = 1.1;

        const planes = [
          new THREE.Plane(new THREE.Vector3(plane_size, 0, 0), size),  // Right plane
          new THREE.Plane(new THREE.Vector3(-plane_size, 0, 0), size), // Left plane
          new THREE.Plane(new THREE.Vector3(0, 0, plane_size), size),  // Front plane
          new THREE.Plane(new THREE.Vector3(plane_size /side_factor, 0 , plane_size /side_factor ), size ),  // Front right plane
          new THREE.Plane(new THREE.Vector3(-plane_size /side_factor, 0 , plane_size /side_factor ), size ),  // Front left plane
          new THREE.Plane(new THREE.Vector3(0, 0, -plane_size), size),  // Back plane
          new THREE.Plane(new THREE.Vector3(plane_size /side_factor, 0 , -plane_size /side_factor ), size ),  // Back right plane
          new THREE.Plane(new THREE.Vector3(-plane_size /side_factor, 0 , -plane_size /side_factor ), size ),  // Back left plane
        ];

        return planes;

    }

}



 // Define a function to create clipping planes for a cylinder
 const createCylinderClippingPlanes = (radius, height, segments, position) => {
    const planes = [];
    const angleStep = (Math.PI * 2) / segments;
    
    // Create radial clipping planes
    for (let i = 0; i < segments; i++) {
        const angle = i * angleStep;
        const normal = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
        const plane = new THREE.Plane(normal, -radius).translate(position);
        planes.push(plane);
    }
    
    // Create top and bottom clipping planes
    planes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), height / 2).translate(position));
    planes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), height / 2).translate(position));
    
    return planes;
};

// Function to update clipping planes dynamically
const updateClippingPlanes = (radius, height, segments, position) => {
 clippingPlanes = createCylinderClippingPlanes(radius, height, segments, position);
 renderer.clippingPlanes = clippingPlanes;
 
 // Remove old helpers
 helpers.forEach(helper => scene.remove(helper));
 
 // Add new helpers
 const newHelpers = clippingPlanes.map(plane => new THREE.PlaneHelper(plane, 10, 0xff0000));
 newHelpers.forEach(helper => scene.add(helper));
};
