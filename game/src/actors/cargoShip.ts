/**
 * Cargo Ship NPC
 * 
 * Defines a passive cargo ship NPC that travels between points and flees from aggressors.
 */

import * as YUKA from 'yuka';

export default class cargoShip {

    entity;

    mesh;

    type;

    constructor( mesh, type = 'vehicle' ) {
        this.mesh = mesh;
        this.type = type;

        if ( this.type == 'vehicle' ) {
            this.entity = new YUKA.Vehicle();
            this.entity.position.copy( this.mesh.userData.path.current() );
            this.entity.maxSpeed = 150;
            this.entity.maxTurnRate = this.entity.maxSpeed * Math.PI;
            this.entity.boundingRadius = this.mesh.userData.size * Math.PI;
            this.entity.setRenderComponent( mesh, this.sync );
            this.entity.smoother = new YUKA.Smoother( 20 );
            
            // Step forward in the path's internal pointers to the next point.
            this.mesh.userData.path.advance();

            const arriveBehavior = new YUKA.ArriveBehavior(this. mesh.userData.path.current(), 25., this.mesh.userData.size * 2 );
			this.entity.steering.add( arriveBehavior );
        }
    }

    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );

    }

    animate () {
        if ( this.mesh.position.distanceTo(this.entity.steering.behaviors[0].target) < 2000 ) {
            this.entity.steering.clear();
            this.mesh.userData.path.advance();

            const arriveBehavior = new YUKA.ArriveBehavior( this.mesh.userData.path.current(), 25., 2000 );
            this.entity.steering.add( arriveBehavior );

        }
    }
}
