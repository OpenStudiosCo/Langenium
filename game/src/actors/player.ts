/**
 * Player Agent
 * 
 * Defines a player entity in the game world.
 * 
 * @todo: Remove this file if not used.
 */

import * as YUKA from 'yuka';

import BaseActor from './base';

export default class Player extends BaseActor {

    constructor( mesh, type = 'vehicle' ) {
        super( mesh, type );
    
         if ( this.type == 'vehicle' ) {
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
