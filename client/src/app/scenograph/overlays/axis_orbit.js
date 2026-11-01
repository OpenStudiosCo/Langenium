/***
 * @name            AxisOrbit
 * @description     Viewport OrbitControls around the vehicle plus labelled AxesHelper compass
 * @namespace       l.scenograph.overlays.axis_orbit
 * @memberof        l.scenograph.overlays
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

/**
 * Vendor libs and base class.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MAX_PITCH = 55 * Math.PI / 180;
const AXIS_LENGTH = 0.7;
const LABEL_OFFSET = 0.82;
const HELPER_CAM_DISTANCE = 2.6;

export default class AxisOrbit {

    constructor() {
        this.container = document.querySelector( '#game_overlay #axis_orbit' );
        this.canvasHost = this.container.querySelector( '[data-axis-orbit-canvas]' );
        this.resetButton = this.container.querySelector( '[data-action="reset-orbit"]' );

        this.dragging = false;
        this.controls = null;
        this._size = new THREE.Vector2();
        this._viewOffset = new THREE.Vector3();
        this._pivotDelta = new THREE.Vector3();
        this._lastPivot = new THREE.Vector3();
        this._hasLastPivot = false;
        this._labels = [];
        this._viewport = null;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 20 );
        // World-fixed axes (LON=X, ELV=Y, LAT=Z). The helper camera orbits them
        // like a compass, matching the chase camera's view direction.
        this.camera.up.set( 0, 1, 0 );
        this.camera.position.set( 0, 0.8, HELPER_CAM_DISTANCE );
        this.camera.lookAt( 0, 0, 0 );

        this.axesRoot = new THREE.Group();
        this.scene.add( this.axesRoot );

        this.axes = new THREE.AxesHelper( AXIS_LENGTH );
        this.axesRoot.add( this.axes );
        this.addAxisLabels();

        this.canvas = document.createElement( 'canvas' );
        this.canvasHost.appendChild( this.canvas );

        this.renderer = new THREE.WebGLRenderer( {
            canvas: this.canvas,
            alpha: true,
            antialias: true,
        } );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.setClearAlpha( 0 );
        this.renderer.autoClear = true;

        this.syncSize();
        this.bindEvents();
        this.ensureControls();
        this.setVisible( false );
    }

    addAxisLabels() {
        // World axes: longitude = X, elevation = atmospheric up (Y), latitude = Z.
        const labels = [
            { text: 'LON', colour: '#ff3653', position: new THREE.Vector3( LABEL_OFFSET, 0, 0 ) },
            { text: 'ELV', colour: '#8adb00', position: new THREE.Vector3( 0, LABEL_OFFSET, 0 ) },
            { text: 'LAT', colour: '#2c8fff', position: new THREE.Vector3( 0, 0, LABEL_OFFSET ) },
        ];

        for ( const spec of labels ) {
            const sprite = this.createAxisLabel( spec.text, spec.colour );
            sprite.position.copy( spec.position );
            this.axesRoot.add( sprite );
            this._labels.push( sprite );
        }
    }

    createAxisLabel( text, colour ) {
        const width = 128;
        const height = 64;
        const canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext( '2d' );
        context.clearRect( 0, 0, width, height );
        context.font = 'bold 36px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineWidth = 6;
        context.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        context.strokeText( text, width / 2, height / 2 );
        context.fillStyle = colour;
        context.fillText( text, width / 2, height / 2 );

        const texture = new THREE.CanvasTexture( canvas );
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial( {
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        } );

        const sprite = new THREE.Sprite( material );
        sprite.scale.set( 0.42, 0.21, 1 );
        sprite.userData.axisLabel = true;
        return sprite;
    }

    resolveViewport() {
        const renderer = l.current_scene
            && l.current_scene.renderers
            && l.current_scene.renderers.webgl;
        if ( renderer && renderer.domElement ) {
            return renderer.domElement;
        }
        return document.querySelector( '#webgl canvas' );
    }

    ensureControls() {
        const playerCam = l.scenograph.cameras && l.scenograph.cameras.player;
        const viewport = this.resolveViewport();
        if ( ! playerCam || ! viewport ) {
            return;
        }

        if ( this.controls && this._viewport === viewport ) {
            return;
        }

        if ( this.controls ) {
            this.controls.dispose();
            this.controls = null;
        }

        this._viewport = viewport;
        this.controls = new OrbitControls( playerCam, viewport );
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.enableDamping = false;
        this.controls.enableRotate = true;
        this.controls.rotateSpeed = 0.6;
        // Match prior ±55° elevation from the horizon.
        this.controls.minPolarAngle = ( Math.PI / 2 ) - MAX_PITCH;
        this.controls.maxPolarAngle = ( Math.PI / 2 ) + MAX_PITCH;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: null,
            RIGHT: null,
        };
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: null,
        };
        this.controls.enabled = false;

        this.controls.addEventListener( 'start', this._onControlsStart );
        this.controls.addEventListener( 'end', this._onControlsEnd );
    }

    bindEvents() {
        this._onControlsStart = () => {
            if ( ! this.canOrbit() ) {
                if ( this.controls ) {
                    this.controls.enabled = false;
                }
                return;
            }

            const player = l.scenograph.actors.player;
            if ( player ) {
                player.userOrbitActive = true;
            }
            this.dragging = true;
            this.syncControlsTarget();
            this.rememberPivot();
        };

        this._onControlsEnd = () => {
            this.dragging = false;
        };

        this._onReset = ( event ) => {
            event.preventDefault();
            this.resetOrbit();
        };

        this._onResize = () => {
            this.syncSize();
        };

        window.addEventListener( 'resize', this._onResize );
        this.resetButton.addEventListener( 'click', this._onReset );
    }

    canOrbit() {
        if ( l.scenograph.controls && l.scenograph.controls.orbit ) {
            // Debug orbit already owns the same canvas listeners.
            return false;
        }

        const player = l.scenograph.actors.player;
        if ( ! player || ! player.vehicle || ! player.vehicle.mesh ) {
            return false;
        }
        if ( player.mode !== 'vehicle' ) {
            return false;
        }
        if ( l.ui && l.ui.inventory && l.ui.inventory.blocksInput() ) {
            return false;
        }

        return true;
    }

    getPivot() {
        const player = l.scenograph.actors.player;
        if ( ! player || ! player.vehicle || ! player.vehicle.mesh ) {
            return null;
        }

        return player.vehicle.getOrbitPivot
            ? player.vehicle.getOrbitPivot()
            : player.vehicle.mesh.position;
    }

    rememberPivot() {
        const pivot = this.getPivot();
        if ( ! pivot ) {
            this._hasLastPivot = false;
            return;
        }

        this._lastPivot.copy( pivot );
        this._hasLastPivot = true;
    }

    syncControlsTarget() {
        if ( ! this.controls ) {
            return;
        }

        const pivot = this.getPivot();
        if ( ! pivot ) {
            return;
        }

        this.controls.target.copy( pivot );
    }

    /**
     * Called each frame while user orbit framing is active.
     */
    updatePlayerOrbit() {
        if ( ! this.controls || ! this.controls.enabled ) {
            return;
        }

        const pivot = this.getPivot();
        const playerCam = l.scenograph.cameras.player;
        if ( ! pivot || ! playerCam ) {
            return;
        }

        // Carry the camera with the aircraft so the orbit offset stays locked in place
        // while the ship translates (OrbitControls alone only moves the look target).
        if ( this._hasLastPivot ) {
            this._pivotDelta.subVectors( pivot, this._lastPivot );
            playerCam.position.add( this._pivotDelta );
            this.controls.target.add( this._pivotDelta );
        }
        else {
            this.controls.target.copy( pivot );
        }

        this._lastPivot.copy( pivot );
        this._hasLastPivot = true;

        this.controls.update();

        const player = l.scenograph.actors.player;
        if ( player && player.vehicle ) {
            player.vehicle.aimChaseCamera( true );
            player.chaseYaw = Math.atan2(
                playerCam.position.x - this.controls.target.x,
                playerCam.position.z - this.controls.target.z
            );
        }
    }

    resetOrbit() {
        const player = l.scenograph.actors.player;
        if ( ! player ) {
            return;
        }

        player.userOrbitActive = false;
        this.dragging = false;
        this._hasLastPivot = false;

        player.chaseYaw = player.vehicle?.mesh?.rotation.y ?? 0;

        if ( player.vehicle ) {
            player.vehicle.applyChaseCamera( player.chaseYaw, 0, false );
        }

        // Keep OC spherical state aligned with the restored chase pose for the next engage.
        if ( this.controls ) {
            this.syncControlsTarget();
            this.controls.update();
            this.setControlsEnabled( ! this.container.hidden );
        }

        this.syncHelperFromPlayer();
    }

    syncHelperFromPlayer() {
        const player = l.scenograph.actors.player;
        const mainCam = l.scenograph.cameras && l.scenograph.cameras.player;
        if ( ! player || ! player.vehicle || ! player.vehicle.mesh || ! mainCam ) {
            return;
        }

        const pivot = player.vehicle.getOrbitPivot
            ? player.vehicle.getOrbitPivot()
            : player.vehicle.mesh.position;

        this._viewOffset.subVectors( mainCam.position, pivot );
        if ( this._viewOffset.lengthSq() < 1e-6 ) {
            this._viewOffset.set( 0, 0.8, HELPER_CAM_DISTANCE );
        }
        else {
            this._viewOffset.normalize().multiplyScalar( HELPER_CAM_DISTANCE );
        }

        this.camera.up.set( 0, 1, 0 );
        this.camera.position.copy( this._viewOffset );
        this.camera.lookAt( 0, 0, 0 );
    }

    syncSize() {
        if ( ! this.canvasHost || ! this.renderer ) {
            return;
        }

        const width = Math.max( 1, this.canvasHost.clientWidth );
        const height = Math.max( 1, this.canvasHost.clientHeight );
        const ratio = window.devicePixelRatio || 1;

        if ( this.renderer.getPixelRatio() !== ratio ) {
            this.renderer.setPixelRatio( ratio );
        }

        this.renderer.getSize( this._size );
        if ( this._size.x !== width || this._size.y !== height ) {
            this.renderer.setSize( width, height, false );
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    setControlsEnabled( show ) {
        this.ensureControls();
        if ( ! this.controls ) {
            return;
        }

        const allow = show && this.canOrbit() && ! ( l.scenograph.controls && l.scenograph.controls.orbit );
        // Enabled whenever the chrome is up so the first drag engages user orbit.
        // Chase framing overwrites the camera until userOrbitActive is set on 'start'.
        this.controls.enabled = allow;
    }

    setVisible( show ) {
        if ( ! this.container ) {
            return;
        }

        this.container.hidden = ! show;
        this.container.style.display = show ? 'flex' : 'none';

        if ( show ) {
            this.ensureControls();
            this.setControlsEnabled( true );
            this.syncSize();
        }
        else {
            this.dragging = false;
            if ( this.controls ) {
                this.controls.enabled = false;
            }
        }
    }

    dispose() {
        this.dragging = false;

        window.removeEventListener( 'resize', this._onResize );
        this.resetButton.removeEventListener( 'click', this._onReset );

        if ( this.controls ) {
            this.controls.removeEventListener( 'start', this._onControlsStart );
            this.controls.removeEventListener( 'end', this._onControlsEnd );
            this.controls.dispose();
            this.controls = null;
        }

        if ( this.renderer ) {
            this.renderer.dispose();
            this.renderer = null;
        }

        for ( const sprite of this._labels ) {
            if ( sprite.material && sprite.material.map ) {
                sprite.material.map.dispose();
            }
            if ( sprite.material ) {
                sprite.material.dispose();
            }
            this.axesRoot.remove( sprite );
        }
        this._labels = [];

        if ( this.axes ) {
            this.axes.geometry.dispose();
            if ( Array.isArray( this.axes.material ) ) {
                this.axes.material.forEach( ( material ) => material.dispose() );
            }
            else if ( this.axes.material ) {
                this.axes.material.dispose();
            }
            this.axesRoot.remove( this.axes );
            this.axes = null;
        }

        if ( this.axesRoot ) {
            this.scene.remove( this.axesRoot );
            this.axesRoot = null;
        }

        if ( this.canvas && this.canvas.parentNode ) {
            this.canvas.parentNode.removeChild( this.canvas );
        }

        if ( this.container ) {
            this.container.style.display = 'none';
            this.container.hidden = true;
        }

        this._viewport = null;
    }

    /**
     * Animate hook.
     *
     * @method animate
     * @memberof AxisOrbit
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {
        const orbit = l.scenograph.overlays.axis_orbit;
        if ( ! orbit || ! orbit.renderer || orbit.container.hidden ) {
            return;
        }

        // Disable while debug orbit owns the canvas.
        if ( l.scenograph.controls && l.scenograph.controls.orbit && orbit.controls ) {
            orbit.controls.enabled = false;
        }

        orbit.syncHelperFromPlayer();
        orbit.syncSize();
        orbit.renderer.render( orbit.scene, orbit.camera );
    }

}
