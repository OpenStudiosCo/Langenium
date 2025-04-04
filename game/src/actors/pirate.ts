/**
 * Pirate NPC
 * 
 * Defines an aggressive pirate NPC that attacks nearby aircraft.
 */

import * as YUKA from 'yuka';

export default class Pirate {

    entity;

    follow;

    mesh;

    pursue;

    type;

    constructor( mesh, type = 'vehicle' ) {
        this.mesh = mesh;

        this.targetSighted = false;
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

            const loopDistance = -1000;
            const path = new YUKA.Path();
            path.loop = true;
            path.add( new YUKA.Vector3( loopDistance, this.mesh.position.y, loopDistance ) );
            path.add( new YUKA.Vector3( loopDistance, this.mesh.position.y, - loopDistance ) );
            path.add( new YUKA.Vector3( - loopDistance, this.mesh.position.y, - loopDistance ) );
            path.add( new YUKA.Vector3( - loopDistance, this.mesh.position.y, loopDistance ) );
    
            const vision = new YUKA.Vision( this.entity );
            vision.range = 750;
            vision.fieldOfView = Math.PI * 0.95;
            this.entity.vision = vision;
    
            // this.follow = new YUKA.FollowPathBehavior( path );
            // this.entity.steering.add( this.follow );

            this.pursue = new YUKA.PursuitBehavior( l.current_scene.objects.player.actor.entity, 2 );
            this.pursue.active = false;
			this.entity.steering.add( this.pursue );

        }
    }

    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );

    }

    animate() {
        if ( this.entity.vision.visible( l.current_scene.objects.player.position ) === true ) {
            console.log('player sighted!');
            
            this.pursue.active = true;
            //this.follow.active = false;

        } else {
            console.log('player not sighted!');

            this.pursue.active = false;
            //this.follow.active = true;
            
        }
    }
}
