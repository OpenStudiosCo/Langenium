/**
 * Pirate NPC
 * 
 * Defines an aggressive pirate NPC that attacks nearby aircraft.
 */

import * as YUKA from 'yuka';

export default class Pirate {

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
            this.entity.rotation.order = 'XYZ';
        }
    }

    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );

    }
}
