/**
 * Pirate NPC
 * 
 * Defines an aggressive pirate NPC that attacks nearby aircraft.
 */

import * as YUKA from 'yuka';

import BaseActor from './base';

export default class Pirate extends BaseActor {

    follow;

    marker;

    path;

    pursue;

    constructor( mesh, scene ) {
        super( mesh, scene );
        
        this.marker = document.querySelector('#map .marker-bot svg path');

        if ( this.type == 'vehicle' ) {
            this.entity.position.z = this.mesh.position.z;
            this.entity.position.y = this.mesh.position.y;
            this.entity.maxSpeed = 400;
            this.entity.setRenderComponent( this.mesh, this.sync );
            this.entity.boundingRadius = 20;
            this.entity.smoother = new YUKA.Smoother( 20 );
            this.entity.rotation.order = 'XYZ';

            const loopDistance = -1000;

            this.path = new YUKA.Path();
            this.path.loop = true;
            this.path.add( new YUKA.Vector3( loopDistance, this.mesh.position.y, loopDistance ) );
            this.path.add( new YUKA.Vector3( loopDistance, this.mesh.position.y, - loopDistance ) );
            this.path.add( new YUKA.Vector3( - loopDistance, this.mesh.position.y, - loopDistance ) );
            this.path.add( new YUKA.Vector3( - loopDistance, this.mesh.position.y, loopDistance ) );
    
            this.follow = new YUKA.FollowPathBehavior( this.path );
            this.entity.steering.add( this.follow );

            // @todo: v7 Figure out a way to signal this to happen without l. global object access
            this.pursue = new YUKA.PursuitBehavior( l.current_scene.objects.player.mesh.userData.actor.entity, 1 );
            this.pursue.active = false;
			this.entity.steering.add( this.pursue );

        }
    }

    animate( delta ) {
        super.animate( delta );

        if ( ! this.marker ) {
            this.marker = document.querySelector('#map .marker-bot svg path');
        }

        // @todo: v7 Figure out a way to signal this to happen without l. global object access
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
