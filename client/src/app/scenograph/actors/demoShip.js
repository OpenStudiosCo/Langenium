/**
 * @name            DemoShip
 * @description     Menu-screen Valiant: looping patrol plus a fading camera tour.
 * @memberof        l.scenograph.actors
 * @global
 */

import * as THREE from 'three';
import * as YUKA from 'yuka';

import l from '@/helpers/l.js';
import Valiant from '@/scenograph/objects/vehicles/valiant.js';

const REST_SECONDS = 5;
const SHOT_SECONDS = 8;
const FADE_SECONDS = 0.6;
const SHIP_VIEW = { radius: 110, height: 32, spin: 0.16 };
const LANDMARKS = {
    refinery: { radius: 2200, height: 420, spin: 0.12 },
    platform: { radius: 18000, height: 8800, spin: 0.05 },
    extractor: { radius: 2400, height: 16000, spin: 0.1 }
};

export default class DemoShip {

    constructor() {
        this.vehicle = null;
        this.entity = null;
        this.tourStarted = false;
        this.rest = 0;
        this._ready = false;
        this.shot = 0;
        this.shotT = 0;
        this.angle = 0;
        this.fade = 0;
        this.fading = 0;
        this.hold = false;
        this.departOnBlack = false;
        this.pendingShot = null;
        this.views = [ { kind: 'ship', ...SHIP_VIEW } ];
        this._look = new THREE.Vector3();
        this._fadeEl = null;
    }

    get mesh() { return this.vehicle ? this.vehicle.mesh : null; }
    get trail() { return this.vehicle ? this.vehicle.trail : null; }
    get ready() { return this._ready; }
    set ready( value ) {
        this._ready = value;
        if ( this.vehicle ) this.vehicle.ready = value;
    }
    get default_camera_distance() { return this.vehicle.default_camera_distance; }
    get camera_distance() { return this.vehicle.camera_distance; }
    set camera_distance( value ) { this.vehicle.camera_distance = value; }

    async load() {
        this.vehicle = new Valiant( true );
        await this.vehicle.load();
        this.vehicle.mesh.name = 'Demo Ship';
        this.vehicle.ready = this._ready;
    }

    applyChaseCamera( yaw ) { return this.vehicle.applyChaseCamera( yaw ); }
    aimChaseCamera() { return this.vehicle.aimChaseCamera(); }

    beginAfterIntro() {
        if ( this.tourStarted || this.rest > 0 ) return;
        this.rest = REST_SECONDS;
    }

    startTour() {
        if ( this.tourStarted || ! this.vehicle ) return;
        this.rest = 0;
        this.tourStarted = true;

        const mesh = this.mesh;
        mesh.updateMatrixWorld( true );
        mesh.matrixAutoUpdate = false;

        this.entity = new YUKA.Vehicle();
        this.entity.forward = new YUKA.Vector3( 0, 0, -1 );
        this.entity.maxSpeed = 70;
        this.entity.maxForce = 18;
        this.entity.smoother = new YUKA.Smoother( 20 );
        this.entity.setRenderComponent( mesh, this.sync );
        this.entity.position.copy( mesh.position );
        this.entity.rotation.set( mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w );

        const path = new YUKA.Path();
        path.loop = true;
        const { x, y, z } = mesh.position;
        const d = 1000;
        path.add( new YUKA.Vector3( x, y, z ) );
        path.add( new YUKA.Vector3( x + d, y, z - d ) );
        path.add( new YUKA.Vector3( x + d, y, z + d ) );
        path.add( new YUKA.Vector3( x - d, y, z + d ) );
        path.add( new YUKA.Vector3( x - d, y, z - d ) );
        this.entity.steering.add( new YUKA.FollowPathBehavior( path, 40 ) );
        l.scenograph.entityManager.add( this.entity );

        this.collectViews();
        this.shot = 0;
        this.shotT = 0;
    }

    leaveRest() {
        this.rest = 0;
        this.collectViews();
        this.pendingShot = this.views.length > 1 ? 1 : 0;
        this.hold = true;
        this.departOnBlack = true;
        this.fade = 0;
        this.fading = -1;
    }

    resumeTour() {
        this.startTour();
        this.pendingShot = 0;
        this.hold = true;
        this.fade = 0;
        this.fading = -1;
    }

    collectViews() {
        this.views = [ { kind: 'ship', ...SHIP_VIEW } ];
        for ( const kind of Object.keys( LANDMARKS ) ) {
            const catalog = l.scenograph.objects.structures[ kind ];
            const mesh = this.nearest( catalog && catalog.instances );
            if ( mesh ) this.views.push( { kind, mesh, ...LANDMARKS[ kind ] } );
        }
    }

    nearest( instances ) {
        if ( ! instances || instances.length === 0 ) return null;
        let best = instances[ 0 ];
        let bestD = best.position.lengthSq();
        for ( let i = 1; i < instances.length; i++ ) {
            const d = instances[ i ].position.lengthSq();
            if ( d < bestD ) {
                best = instances[ i ];
                bestD = d;
            }
        }
        return best;
    }

    sync( entity, renderComponent ) {
        if ( entity.position.y < 5 ) entity.position.y = 5;
        renderComponent.matrix.copy( entity.worldMatrix );
        renderComponent.position.copy( entity.position );
        renderComponent.matrixWorldNeedsUpdate = true;
    }

    view() {
        return this.views[ this.shot % this.views.length ];
    }

    centerOf( view ) {
        return view.kind === 'ship' ? this.mesh.position : view.mesh.position;
    }

    placeCamera( view, lerp ) {
        const center = this.centerOf( view );
        const x = center.x + Math.cos( this.angle ) * view.radius;
        const y = center.y + view.height;
        const z = center.z + Math.sin( this.angle ) * view.radius;
        const cam = l.scenograph.cameras.player;
        if ( lerp ) {
            cam.position.lerp( this._look.set( x, y, z ), lerp );
        }
        else {
            cam.position.set( x, y, z );
        }
        cam.lookAt( center.x, center.y + ( view.kind === 'ship' ? 1.2 : 0 ), center.z );
        cam.updateProjectionMatrix();
    }

    setFade( opacity ) {
        if ( ! this._fadeEl ) {
            this._fadeEl = document.createElement( 'div' );
            this._fadeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:3';
            ( document.getElementById( 'webgl-wrapper' ) || document.body ).appendChild( this._fadeEl );
        }
        this._fadeEl.style.opacity = String( opacity );
    }

    cutToNext() {
        if ( this.views.length < 2 ) this.collectViews();
        const count = Math.max( 1, this.views.length );
        this.shot = this.pendingShot !== null ? this.pendingShot : ( this.shot + 1 ) % count;
        this.pendingShot = null;
        this.shotT = 0;
        this.hold = false;
        const view = this.view();
        const center = this.centerOf( view );
        const cam = l.scenograph.cameras.player;
        this.angle = Math.atan2( cam.position.z - center.z, cam.position.x - center.x );
        this.placeCamera( view, 0 );
    }

    updateTour( delta ) {
        const view = this.view();
        this.angle += delta * view.spin;

        if ( ! this.hold ) {
            this.placeCamera( view, view.kind === 'ship' && this.fading === 0 ? 1 - Math.exp( -2.2 * delta ) : 0 );
        }

        if ( this.fading === 0 ) {
            this.shotT += delta;
            if ( this.shotT >= SHOT_SECONDS && this.views.length > 1 ) this.fading = -1;
        }
        else {
            this.fade = Math.min( 1, this.fade - this.fading * delta / FADE_SECONDS );
            const u = this.fade * this.fade * ( 3 - 2 * this.fade );
            this.setFade( u );
            if ( this.fading < 0 && this.fade >= 1 ) {
                if ( this.departOnBlack ) {
                    this.departOnBlack = false;
                    this.startTour();
                }
                this.cutToNext();
                this.fading = 1;
            }
            else if ( this.fading > 0 && this.fade <= 0 ) {
                this.fading = 0;
                this.fade = 0;
                this.setFade( 0 );
            }
        }
    }

    animate( delta ) {
        if ( ! this.vehicle ) return;

        if ( this.rest > 0 ) {
            if ( l.mode === 'home' ) {
                this.rest -= delta;
                if ( this.rest <= 0 ) this.leaveRest();
            }
            return;
        }

        if ( this.departOnBlack && ! this.tourStarted ) {
            if ( l.mode === 'home' ) {
                this.updateTour( delta );
            }
            else {
                this.departOnBlack = false;
                this.fading = 0;
                this.hold = false;
                this.setFade( 0 );
            }
            return;
        }

        if ( this.tourStarted ) {
            this.vehicle.updateAnimation( delta );
            this.vehicle.mesh.userData.object.airSpeed = -2;
            this.vehicle.animateTrail();
        }
        else if ( this._ready && l.mode !== 'hangar' ) {
            this.vehicle.updateAnimation( delta );
        }

        if ( this.tourStarted && l.mode === 'home' ) {
            this.updateTour( delta );
        }
        else if ( this._fadeEl ) {
            this.fading = 0;
            this.hold = false;
            this.setFade( 0 );
        }
    }

}
