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
const HANGAR_LOOK_SENSITIVITY = 0.005;

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
        this._lookDir = new THREE.Vector3();
        this._labels = [];
        this._viewport = null;
        this._hangarViewport = null;
        this._hangarLook = {
            active: false,
            pointerId: null,
            lastX: 0,
            lastY: 0,
            yaw: 0,
            pitch: 0,
        };

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
        this.bindHangarLookEvents();
        this.ensureControls();
        this.setVisible( false );
    }

    isHangarPerson() {
        const player = l.scenograph.actors.player;
        return l.mode === 'hangar'
            && player
            && player.mode === 'person'
            && player.person
            && player.person.mesh;
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
        this.controls.enableZoom = true;
        this.controls.enableDamping = false;
        this.controls.enableRotate = true;
        this.controls.rotateSpeed = 0.6;
        this.controls.zoomSpeed = 0.8;
        // Match prior ±55° elevation from the horizon.
        this.controls.minPolarAngle = ( Math.PI / 2 ) - MAX_PITCH;
        this.controls.maxPolarAngle = ( Math.PI / 2 ) + MAX_PITCH;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: null,
            RIGHT: null,
        };
        // TWO must be DOLLY_PAN or DOLLY_ROTATE — OrbitControls has no TOUCH.DOLLY branch.
        // Pan stays off via enablePan, so a pinch only dollies.
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
        };
        this.syncZoomLimits();
        this.controls.enabled = false;

        this.controls.addEventListener( 'start', this._onControlsStart );
        this.controls.addEventListener( 'end', this._onControlsEnd );
    }

    bindEvents() {
        this._onControlsStart = () => {
            if ( this.isHangarPerson() ) {
                // Hangar FP look uses its own pointer handlers, not OrbitControls.
                return;
            }

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
            this.syncZoomLimits();
            this.syncControlsTarget();
            this.rememberPivot();
        };

        this._onControlsEnd = () => {
            if ( this.isHangarPerson() ) {
                return;
            }
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

    bindHangarLookEvents() {
        this._onHangarPointerDown = ( event ) => {
            if ( event.button !== 0 || this.container.hidden ) {
                return;
            }
            if ( ! this.isHangarPerson() || ! this.canOrbit() ) {
                return;
            }
            if ( event.target.closest && event.target.closest( 'button, a, input, .axis_orbit_reset' ) ) {
                return;
            }

            const playerCam = l.scenograph.cameras && l.scenograph.cameras.player;
            const pivot = this.getPivot();
            if ( ! playerCam || ! pivot ) {
                return;
            }

            this.dragging = true;
            this._hangarLook.active = true;
            this._hangarLook.pointerId = event.pointerId;
            this._hangarLook.lastX = event.clientX;
            this._hangarLook.lastY = event.clientY;
            this._hangarLook.yaw = playerCam.rotation.y;
            this._hangarLook.pitch = playerCam.rotation.x;

            playerCam.position.copy( pivot );
            playerCam.rotation.order = 'YXZ';

            if ( this._hangarViewport && this._hangarViewport.setPointerCapture ) {
                try {
                    this._hangarViewport.setPointerCapture( event.pointerId );
                }
                catch ( error ) {
                    // Capture is best-effort across browsers.
                }
            }
        };

        this._onHangarPointerMove = ( event ) => {
            if ( ! this._hangarLook.active || event.pointerId !== this._hangarLook.pointerId ) {
                return;
            }

            const dx = event.clientX - this._hangarLook.lastX;
            const dy = event.clientY - this._hangarLook.lastY;
            this._hangarLook.lastX = event.clientX;
            this._hangarLook.lastY = event.clientY;

            this._hangarLook.yaw -= dx * HANGAR_LOOK_SENSITIVITY;
            this._hangarLook.pitch -= dy * HANGAR_LOOK_SENSITIVITY;
            this._hangarLook.pitch = Math.max( -MAX_PITCH, Math.min( MAX_PITCH, this._hangarLook.pitch ) );

            this.applyHangarLookCamera();
        };

        this._onHangarPointerUp = ( event ) => {
            if ( ! this._hangarLook.active || event.pointerId !== this._hangarLook.pointerId ) {
                return;
            }

            this._hangarLook.active = false;
            this._hangarLook.pointerId = null;
            this.dragging = false;
            this.applyHangarLookFacing();
        };
    }

    ensureHangarLookListeners() {
        const viewport = this.resolveViewport();
        if ( ! viewport ) {
            return;
        }

        if ( this._hangarViewport === viewport ) {
            return;
        }

        this.teardownHangarLookListeners();
        this._hangarViewport = viewport;
        viewport.addEventListener( 'pointerdown', this._onHangarPointerDown );
        viewport.addEventListener( 'pointermove', this._onHangarPointerMove );
        viewport.addEventListener( 'pointerup', this._onHangarPointerUp );
        viewport.addEventListener( 'pointercancel', this._onHangarPointerUp );
    }

    teardownHangarLookListeners() {
        if ( ! this._hangarViewport ) {
            return;
        }

        this._hangarViewport.removeEventListener( 'pointerdown', this._onHangarPointerDown );
        this._hangarViewport.removeEventListener( 'pointermove', this._onHangarPointerMove );
        this._hangarViewport.removeEventListener( 'pointerup', this._onHangarPointerUp );
        this._hangarViewport.removeEventListener( 'pointercancel', this._onHangarPointerUp );
        this._hangarViewport = null;
    }

    canOrbit() {
        if ( l.scenograph.controls && l.scenograph.controls.orbit ) {
            // Debug orbit already owns the same canvas listeners.
            return false;
        }

        const player = l.scenograph.actors.player;
        if ( ! player ) {
            return false;
        }
        if ( l.ui && l.ui.inventory && l.ui.inventory.blocksInput() ) {
            return false;
        }

        if ( player.mode === 'vehicle' && player.vehicle && player.vehicle.mesh ) {
            return true;
        }

        // Hangar walk: orbit around the person.
        if ( l.mode === 'hangar' && player.mode === 'person' && player.person && player.person.mesh ) {
            return true;
        }

        return false;
    }

    getPivot() {
        const player = l.scenograph.actors.player;
        if ( ! player ) {
            return null;
        }

        if ( player.mode === 'person' && player.person && player.person.mesh ) {
            return player.person.mesh.position;
        }

        if ( ! player.vehicle || ! player.vehicle.mesh ) {
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

    /**
     * Keep the hangar eye on the person and apply look yaw/pitch in place.
     */
    applyHangarLookCamera() {
        const playerCam = l.scenograph.cameras && l.scenograph.cameras.player;
        const pivot = this.getPivot();
        if ( ! playerCam || ! pivot ) {
            return;
        }

        playerCam.position.copy( pivot );
        playerCam.rotation.order = 'YXZ';
        playerCam.rotation.y = this._hangarLook.yaw;
        playerCam.rotation.x = this._hangarLook.pitch;
        playerCam.rotation.z = 0;
        playerCam.updateProjectionMatrix();
    }

    /**
     * Commit hangar look yaw to the person so walk/strafe continue from that heading.
     */
    applyHangarLookFacing() {
        const player = l.scenograph.actors.player;
        const playerCam = l.scenograph.cameras && l.scenograph.cameras.player;
        if ( ! player || ! player.person || ! playerCam ) {
            return;
        }

        const yaw = this._hangarLook.yaw;

        if ( player.person.game && player.person.game.object ) {
            player.person.game.object.rotation.y = yaw;
            player.person.game.object.rotation.z = 0;
        }

        player.person.mesh.rotation.y = yaw;
        player.person.mesh.rotation.z = 0;
        this._hangarLook.pitch = 0;
        player.person.updateCamera();
        playerCam.rotation.order = 'YXZ';
        playerCam.rotation.y = yaw;
        playerCam.rotation.x = 0;
        playerCam.rotation.z = 0;
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
     * Dolly limits follow the chase camera's hover ↔ max-speed distance envelope.
     * minDistance is eased down to the live radius so engage cannot push the camera out;
     * maxDistance stays on the flight envelope so a bad radius cannot blow the dolly out.
     */
    syncZoomLimits() {
        if ( ! this.controls ) {
            return;
        }

        const range = this.getZoomDistanceRange();
        let min = range.min;
        const max = range.max;

        const playerCam = l.scenograph.cameras && l.scenograph.cameras.player;
        const pivot = this.getPivot();
        if ( playerCam && pivot ) {
            const liveRadius = playerCam.position.distanceTo( pivot );
            if ( Number.isFinite( liveRadius ) && liveRadius > 0.5 && liveRadius < max * 1.5 ) {
                min = Math.min( min, liveRadius );
            }
        }

        this.controls.minDistance = Math.max( 1.5, min );
        this.controls.maxDistance = Math.max( this.controls.minDistance, max );
    }

    getZoomDistanceRange() {
        const player = l.scenograph.actors.player;
        if ( player && player.vehicle && typeof player.vehicle.chaseCameraDistanceRange === 'function' ) {
            return player.vehicle.chaseCameraDistanceRange();
        }

        return { min: 1.5, max: 120 };
    }

    /**
     * Called each frame while user orbit framing is active.
     */
    updatePlayerOrbit() {
        // Hangar is first-person look-from-eye, not a third-person orbit arm.
        if ( this.isHangarPerson() ) {
            this.applyHangarLookCamera();
            return;
        }

        if ( ! this.controls || ! this.controls.enabled ) {
            return;
        }

        const pivot = this.getPivot();
        const playerCam = l.scenograph.cameras.player;
        if ( ! pivot || ! playerCam ) {
            return;
        }

        this.syncZoomLimits();

        // Carry the camera with the aircraft, then snap the look target to the pivot.
        // Target is set absolutely (not delta-added) so a stale OC target cannot accumulate.
        if ( this._hasLastPivot ) {
            this._pivotDelta.subVectors( pivot, this._lastPivot );
            playerCam.position.add( this._pivotDelta );
        }
        this.controls.target.copy( pivot );

        this._lastPivot.copy( pivot );
        this._hasLastPivot = true;

        this.controls.update();

        const player = l.scenograph.actors.player;
        if ( player && player.mode === 'vehicle' && player.vehicle ) {
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
        this._hangarLook.active = false;
        this._hangarLook.pointerId = null;

        if ( this.isHangarPerson() ) {
            this.applyHangarLookFacing();
        }
        else if ( player.mode === 'person' && player.person ) {
            player.person.updateCamera();
            if ( l.scenograph.cameras.player ) {
                l.scenograph.cameras.player.rotation.y = player.person.mesh.rotation.y;
            }
        }
        else {
            player.chaseYaw = player.vehicle?.mesh?.rotation.y ?? 0;
            if ( player.vehicle ) {
                player.vehicle.applyChaseCamera( player.chaseYaw, 0, false );
            }
        }

        // Keep OC spherical state aligned with the restored chase pose for the next engage.
        if ( this.controls ) {
            this.syncZoomLimits();
            this.syncControlsTarget();
            this.controls.update();
            this.setControlsEnabled( ! this.container.hidden );
        }

        this.syncHelperFromPlayer();
    }

    syncHelperFromPlayer() {
        const mainCam = l.scenograph.cameras && l.scenograph.cameras.player;
        if ( ! mainCam ) {
            return;
        }

        const pivot = this.getPivot();
        if ( pivot ) {
            this._viewOffset.subVectors( mainCam.position, pivot );
        }
        else {
            this._viewOffset.set( 0, 0, 0 );
        }

        // First-person (eye on pivot): drive the compass from look direction so
        // world axes stay aligned as the view turns.
        if ( this._viewOffset.lengthSq() < 1e-4 ) {
            mainCam.getWorldDirection( this._viewOffset );
            if ( this._viewOffset.lengthSq() < 1e-8 ) {
                this._viewOffset.set( 0, 0, 1 );
            }
            this._viewOffset.normalize().multiplyScalar( -HELPER_CAM_DISTANCE );
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
        this.ensureHangarLookListeners();
        this.syncResetButton();
        if ( ! this.controls ) {
            return;
        }

        // Hangar FP look owns the viewport drag; keep OrbitControls off there.
        const allow = show
            && this.canOrbit()
            && ! this.isHangarPerson()
            && ! ( l.scenograph.controls && l.scenograph.controls.orbit );
        // Enabled whenever the chrome is up so the first drag engages user orbit.
        // Chase framing overwrites the camera until userOrbitActive is set on 'start'.
        this.controls.enabled = allow;
    }

    /**
     * Recentre is flight-only — hangar look already turns the person with the view.
     */
    syncResetButton() {
        if ( ! this.resetButton ) {
            return;
        }

        const showReset = ! this.isHangarPerson();
        this.resetButton.hidden = ! showReset;
        this.resetButton.style.display = showReset ? '' : 'none';
    }

    setVisible( show ) {
        if ( ! this.container ) {
            return;
        }

        this.container.hidden = ! show;
        this.container.style.display = show ? 'flex' : 'none';

        if ( show ) {
            this.ensureControls();
            this.ensureHangarLookListeners();
            this.setControlsEnabled( true );
            this.syncResetButton();
            this.syncSize();
        }
        else {
            this.dragging = false;
            this._hangarLook.active = false;
            if ( this.controls ) {
                this.controls.enabled = false;
            }
        }
    }

    dispose() {
        this.dragging = false;
        this._hangarLook.active = false;

        window.removeEventListener( 'resize', this._onResize );
        this.resetButton.removeEventListener( 'click', this._onReset );
        this.teardownHangarLookListeners();

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
