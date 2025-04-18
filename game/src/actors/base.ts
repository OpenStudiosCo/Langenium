/**
 * Actor Base
 * 
 * Provides an instance of an actor that can be attached to game objects.
 * 
 * Behaviours such as bot AI, path finding and combat are attached to the entity of actors.
 */

import * as YUKA from 'yuka';

import Weapons from '../systems/weapons.ts';

export default class BaseActor {

    entity;
    mesh;
    type;
    weapons;

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

            this.weapons = new Weapons();
        }
    }

    sync( entity, renderComponent ) {

        // "5" is the bot floor limit as they are a little unpredictable with elastic motion
        if (entity.position.y < 5 ) {
            entity.position.y = 5;
        }

        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );

    }

}
