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
     * @returns {TrailRenderer}
     */
    createTrail( mesh, trail_position_x, trail_position_y, trail_position_z ) {
        // specify points to create planar trail-head geometry
        const trailHeadGeometry = l.current_scene.effects.trail.createTrailCircle();

        const trail = new TrailRenderer( l.current_scene.scene, false );

        // set how often a new trail node will be added and existing nodes will be updated
        trail.setAdvanceFrequency( 30 );

        const trailMaterial = l.current_scene.effects.trail.createTrailMaterial();

        // specify length of trail
        const trailLength = 2;

        const trailContainer = new THREE.Object3D();
        trailContainer.position.set( trail_position_x, trail_position_y, trail_position_z );
        mesh.add( trailContainer );

        // initialize the trail
        trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, trailContainer );

        trail.mesh.name = mesh.name + ' Trail';

        trail.mesh.renderOrder = 999;

        // activate the trail
        trail.activate();

        return trail;
    }

    /**
     * Create the trails circular shape.
     * @returns {array}
     */
    createTrailCircle() {
        let circlePoints = [];
        const twoPI = Math.PI * 2;
        let index = 0;
        const scale = .25;
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

        trailMaterial.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, 1. ); // RGBA.
        trailMaterial.uniforms.tailColor.value.set( 132 / 255, 42 / 255, 36 / 255, 1. ); // RGBA.
        return trailMaterial;
    }


}
