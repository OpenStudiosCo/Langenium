/**
 * Actor Base
 * 
 * Provides an instance of an actor that can be attached to game objects.
 * 
 * Behaviours such as bot AI, path finding and combat are attached to the entity of actors.
 */

import * as YUKA from 'yuka';

export default class BaseActor {

    entity;
    mesh;
    type;

    constructor( mesh, type = 'vehicle' ) {
        /**
         * The Actor's Mesh/3D Object
         * @type {THREE.Object3D}
         * @public
         */
        this.mesh = mesh;
        
        /**
         * The Actor Type, sets entity.
         * @type {string}
         * @public
         */
        this.type = type;

        if ( this.type == 'vehicle' ) {
            /**
             * Use the YUKA vehicle entity.
             * @type {YUKA.Entity}
             * @public
             */
            this.entity = new YUKA.Vehicle();
        }
    }

    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );

    }

}
