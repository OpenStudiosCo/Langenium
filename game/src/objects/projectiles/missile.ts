/**
 * Missile projectile.
 */

import BaseProjectile from './base';

class MissileProjectile extends BaseProjectile {

    damagePoints;

    missileMesh;

    constructor( missileMesh ) {
        super(); // Call the constructor of the base class

        this.damagePoints = 20;

        this.missileMesh = missileMesh;
    }

    // IF a missile gets within 5m of its target, it counts as a hit.
    hit ()  {
        const hit = this.missileMesh.position.distanceTo( this.missileMesh.userData.destMesh.position ) <= 5;

        if ( hit && this.missileMesh.userData.destMesh.userData.object ) {
            this.missileMesh.userData.destMesh.userData.object.damage( this.damagePoints );
        }

        return hit;
    }

}

module.exports = MissileProjectile;
