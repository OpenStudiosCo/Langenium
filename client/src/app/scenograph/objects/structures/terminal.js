/**
 * Indoor computer terminal.
 *
 * Freestanding pedestal + slanted screen. Placed by the hangar route
 * against a hangar wall; local +Z faces the player. Storage access
 * intents live on the game Terminal objectClass.
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralBuilding } from '@/scenograph/materials.js';
import TerminalObject from '#/game/src/objects/structures/terminal';

export default class Terminal {

    // Materials for body (procedural) and screen (emissive).
    materials;

    // Game object: storage access between location and aircraft bags.
    objectClass;

    // THREE.Object3D
    mesh;

    constructor() {

        this.materials = {};

        this.ready = false;

        this.objectClass = new TerminalObject();

    }

    /**
     * Open transfer UI for the player's location bag and aircraft cargo.
     */
    openStorage() {
        if ( ! l.ui || ! l.ui.inventory ) {
            return;
        }
        l.ui.inventory.openLocationTransfer();
    }

    /**
     * Load terminal mesh
     * @returns
     */
    async loadMesh( ) {

        const metal = this.materials.metal;
        const panel = this.materials.panel;

        let mesh = new THREE.Object3D();

        const box = ( w, h, d, material ) => new THREE.Mesh(
            new THREE.BoxGeometry( w, h, d ),
            material
        );

        // Pedestal
        let base = box( 0.78, 0.1, 0.52, metal );
        base.position.y = -0.62;

        // Column
        let column = box( 0.42, 0.58, 0.3, metal );
        column.position.y = -0.28;

        // Keyboard shelf
        let shelf = box( 0.72, 0.06, 0.28, metal );
        shelf.position.set( 0, 0.04, 0.14 );

        let shelfGlow = box( 0.5, 0.02, 0.02, panel );
        shelfGlow.position.set( 0, 0.08, 0.27 );

        // Slanted head (faces +Z)
        let head = new THREE.Object3D();
        head.position.set( 0, 0.42, -0.02 );
        head.rotation.x = -0.4;

        let bezel = box( 0.82, 0.58, 0.12, metal );
        let screen = box( 0.68, 0.44, 0.03, panel );
        screen.position.z = 0.075;

        let chin = box( 0.82, 0.08, 0.14, metal );
        chin.position.set( 0, -0.33, 0.04 );

        head.add( bezel );
        head.add( screen );
        head.add( chin );

        mesh.add( base );
        mesh.add( column );
        mesh.add( shelf );
        mesh.add( shelfGlow );
        mesh.add( head );

        mesh.scale.setScalar( 2.5 );
        mesh.userData.targetable = false;
        mesh.userData.objectClass = 'terminal';

        return mesh;
    }

    /**
     * Setup terminal materials
     */
    async loadMaterials( ) {
        this.materials.metal = proceduralBuilding( {
            uniforms: {
                time: { value: 0.0 },
                scale: { value: 0.8 },                                              // Scale
                lacunarity: { value: 2.0 },                                          // Lacunarity
                randomness: { value: 1.0 },                                          // Randomness
                emitColour1: { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25 ) },     // Emission gradient colour 1
                emitColour2: { value: new THREE.Vector4( 0.158, 1., 1., .9 ) },       // Emission gradient colour 2
                shadowFactor: { value: 0.03 },
                shadowOffset: { value: 0.1 },
            }
        } );

        this.materials.panel = new THREE.MeshStandardMaterial( {
            color: 0x0a0d0e,
            emissive: new THREE.Color( 0x0a8f8f ),
            emissiveIntensity: 1.2,
            metalness: 0.2,
            roughness: 0.3,
            name: 'terminal-panel',
        } );
    }

    async load( ) {

        // Setup materials.
        await this.loadMaterials();

        this.mesh = await this.loadMesh();

    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof Terminal
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( currentTime ) {
        l.scenograph.objects.structures.terminal.materials.metal.uniforms.time.value += 0.0000025;
        l.scenograph.objects.structures.terminal.materials.panel.emissiveIntensity =
            1.1 + Math.sin( currentTime * 0.002 ) * 0.15;
    }

}
