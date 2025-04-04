/**
 * Player Agent
 * 
 * Defines a player entity in the game world.
 * 
 * @todo: Remove this file if not used.
 */

import * as YUKA from 'yuka';

export default class Player {

    entity;

    mesh;

    type;

    constructor( mesh, type = 'vehicle' ) {
        this.mesh = mesh;

        this.type = type;
         if ( this.type == 'vehicle' ) {
            // formerly this.vehicle
            this.entity = new YUKA.Vehicle();
            this.entity.position.z = this.mesh.position.z;
            this.entity.position.y = this.mesh.position.y;
            this.entity.maxSpeed = 500;
            this.entity.setRenderComponent( this.mesh, this.sync );
            this.entity.boundingRadius = 20;
            this.entity.smoother = new YUKA.Smoother( 20 );

         }
    }

    // NOTE: This syncs in reverse as we are not using YUKA to pilot, just capture info.
    sync( entity, renderComponent ) {

        entity.worldMatrix.copy( renderComponent.matrix );
        entity.position.copy( renderComponent.position );

    }
}
