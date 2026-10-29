/**
 * Trail
 * 
 * Provides helpers for creating thruster trails.
 * 
 * @uses https://github.com/mkkellogg/TrailRendererJS
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

export default class Trail {

    constructor() {

    }

    /**
     * Create a thruster trail mesh.
     *
     * @param {THREE.Mesh} mesh 
     * @param {float} trail_position_x 
     * @param {float} trail_position_y 
     * @param {float} trail_position_z 
     * @param {object} options Optional trailLength, advanceFrequency, headScale, nameSuffix.
     * @returns {TrailRenderer}
     */
    createTrail( mesh, trail_position_x, trail_position_y, trail_position_z, options = {} ) {
        let trailLength = options.trailLength !== undefined ? options.trailLength : 2,
            advanceFrequency = options.advanceFrequency !== undefined ? options.advanceFrequency : 30,
            headScale = options.headScale !== undefined ? options.headScale : 0.25,
            nameSuffix = options.nameSuffix !== undefined ? options.nameSuffix : ' Trail';

        // Specify points to create planar trail-head geometry.
        const trailHeadGeometry = l.current_scene.effects.trail.createTrailCircle( headScale );

        const trail = new TrailRenderer( l.current_scene.scene, false );

        // Set how often a new trail node will be added and existing nodes will be updated.
        trail.setAdvanceFrequency( advanceFrequency );

        const trailMaterial = l.current_scene.effects.trail.createTrailMaterial();

        const trailContainer = new THREE.Object3D();
        trailContainer.position.set( trail_position_x, trail_position_y, trail_position_z );
        mesh.add( trailContainer );

        // Initialize the trail.
        trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, trailContainer );

        trail.mesh.name = mesh.name + nameSuffix;

        trail.mesh.renderOrder = 999;

        // Activate the trail.
        trail.activate();

        return trail;
    }

    /**
     * Create the trails circular shape.
     * @param {float} scale Head radius. Defaults to the original flame size.
     * @returns {array}
     */
    createTrailCircle( scale = 0.25 ) {
        let circlePoints = [];
        const twoPI = Math.PI * 2;
        let index = 0;
        const inc = twoPI / 32.0;

        for ( let i = 0; i <= twoPI + inc; i += inc ) {
            const vector = new THREE.Vector3();
            vector.set( Math.cos( i ) * scale, Math.sin( i ) * scale, 0 );
            circlePoints[ index ] = vector;
            index++;
        }
        return circlePoints;
    }

    createTrailMaterial(){
        // create material for the trail renderer
        const trailMaterial = TrailRenderer.createBaseMaterial();

        trailMaterial.side = THREE.DoubleSide;

        trailMaterial.transparent = true;
        trailMaterial.depthWrite = false;
        // Soft tip fade (base material alphaTest 0.5 hard-cuts).
        trailMaterial.alphaTest = 0.01;
        trailMaterial.blending = THREE.AdditiveBlending;

        // Hot core at the nozzle → cool, transparent tip.
        trailMaterial.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0.95 );
        trailMaterial.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 0.0 );
        return trailMaterial;
    }


}
