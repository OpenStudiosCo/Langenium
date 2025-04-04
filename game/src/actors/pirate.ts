/**
 * Pirate NPC
 * 
 * Defines an aggressive pirate NPC that attacks nearby aircraft.
 */

import * as YUKA from 'yuka';

export default class Pirate {

    entity;

    follow;

    marker;

    mesh;

    pursue;

    type;

    constructor( mesh, type = 'vehicle' ) {
        this.marker = document.querySelector('#map .marker-bot svg path');

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

            const loopDistance = -1000;
            const path = new YUKA.Path();
            path.loop = true;
            path.add( new YUKA.Vector3( loopDistance, this.mesh.position.y, loopDistance ) );
            path.add( new YUKA.Vector3( loopDistance, this.mesh.position.y, - loopDistance ) );
            path.add( new YUKA.Vector3( - loopDistance, this.mesh.position.y, - loopDistance ) );
            path.add( new YUKA.Vector3( - loopDistance, this.mesh.position.y, loopDistance ) );
    
            const vision = new YUKA.Vision( this.entity );
            vision.range = 1500;
            vision.fieldOfView = Math.PI * 2;
            this.entity.vision = vision;
    
            this.follow = new YUKA.FollowPathBehavior( path );
            this.entity.steering.add( this.follow );

            this.pursue = new YUKA.PursuitBehavior( l.current_scene.objects.player.actor.entity, 1 );
            this.pursue.active = false;
			this.entity.steering.add( this.pursue );

        }
    }

    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );

    }

    animate() {
        if ( ! this.marker ) {
            this.marker = document.querySelector('#map .marker-bot svg path');
        }

        if ( this.entity.vision.visible( l.current_scene.objects.player.position ) === true ) {           
            this.pursue.active = true;
            this.follow.active = false;

            if ( this.marker )
                this.marker.style.stroke = 'rgb( 255, 0, 0 )';
        } else {
            this.pursue.active = false;
            this.follow.active = true;
            
            if ( this.marker )
                this.marker.style.stroke = 'rgb( 255, 255, 0 )';
        }
    }
}
