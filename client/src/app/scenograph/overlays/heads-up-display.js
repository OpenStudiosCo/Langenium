/***
 * @name            Heads Up Display (HUD)
 * @description     Draws aircraft HUD
 * @namespace       l.scenograph.overlays.hud
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
import * as THREE from "three";

const CAPACITOR_SEGMENTS = 20;

export default class HeadsUpDisplay {

    constructor() {

        this.container = document.querySelector('#game_overlay #hud');

        this.portraitMode = l.scenograph.cameras.player.aspect < 0.88;
        this.compactMode = false;
        this.afterburnerTrayOpen = false;

        // Clone the Pug shell only while flight overlays are active.
        // deactivate() clears #hud, matching the previous createElement lifecycle.
        const shell = document.querySelector( '#templates #hud_shell' );
        if ( shell ) {
            this.container.appendChild( shell.content.cloneNode( true ) );
        }

        this.lineElement = this.container.querySelector( '#hud-lines' );
        this.aspdElement = this.container.querySelector( '#hud-aspd' );
        this.vspdElement = this.container.querySelector( '#hud-vspd' );
        this.headingElement = this.container.querySelector( '#hud-head' );
        this.elevationElement = this.container.querySelector( '#hud-elev' );

        this.capacitorPanel = this.container.querySelector( '#hud-capacitor-panel' );
        this.capacitorElement = this.capacitorPanel.querySelector( '#hud-capacitor' );
        this.capacitorSegments = this.capacitorElement.querySelectorAll( '.seg' );
        this.capacitorPctElement = this.capacitorElement.querySelector( '.pct' );
        this.capacitorTrend = this.capacitorElement.querySelector( '.trend' );
        this.capacitorCaret = this.capacitorElement.querySelector( '.caret' );
        this.afterburnerControls = this.capacitorPanel.querySelector( '.afterburner-controls' );
        this.afterburnerFooter = this.afterburnerControls.querySelector( '.afterburner-footer' );
        this.afterburnerLamp = this.afterburnerControls.querySelector( '.afterburner-lamp' );
        this.autoAfterburnerSwitch = this.afterburnerControls.querySelector( '.auto-switch' );
        this.thresholdDial = this.afterburnerControls.querySelector( '.threshold-dial' );
        this.thresholdDialNeedle = this.thresholdDial.querySelector( '.needle' );
        this.thresholdDialValue = this.thresholdDial.querySelector( '.dial-value' );

        this.bindAfterburnerControls();
        this.bindAfterburnerTray();
        this.bindInventoryButton();

    }

    bindInventoryButton() {
        this.inventoryButton = this.capacitorPanel.querySelector( '#hud-inventory' );
        if ( ! this.inventoryButton ) {
            return;
        }

        this.inventoryButton.addEventListener( 'click', function ( event ) {
            event.preventDefault();
            if ( ! l.ui || ! l.ui.inventory ) {
                return;
            }
            l.ui.inventory.toggleAircraftInventory();
        } );
    }

    // Mobile/compact: tray collapses to lamp + label; slide/tap opens controls.
    bindAfterburnerTray() {
        let hud = this;
        let startX = 0;
        let startY = 0;
        let tracking = false;

        function toggleTray() {
            if ( ! hud.compactMode ) {
                return;
            }
            hud.setAfterburnerTrayOpen( ! hud.afterburnerTrayOpen );
        }

        function onFooterPointerDown( event ) {
            if ( ! hud.compactMode ) {
                return;
            }
            tracking = true;
            startX = event.clientX;
            startY = event.clientY;
            if ( hud.afterburnerFooter.setPointerCapture && event.pointerId !== undefined ) {
                hud.afterburnerFooter.setPointerCapture( event.pointerId );
            }
            event.preventDefault();
        }

        function onFooterPointerUp( event ) {
            if ( ! tracking ) {
                return;
            }
            tracking = false;
            let dx = event.clientX - startX;
            let dy = event.clientY - startY;
            // Portrait: tray slides in from the left. Wide: tray slides up from bottom.
            if ( hud.portraitMode ) {
                if ( dx > 24 ) {
                    hud.setAfterburnerTrayOpen( true );
                }
                else if ( dx < -24 ) {
                    hud.setAfterburnerTrayOpen( false );
                }
                else {
                    toggleTray();
                }
            }
            else if ( dy < -24 ) {
                hud.setAfterburnerTrayOpen( true );
            }
            else if ( dy > 24 ) {
                hud.setAfterburnerTrayOpen( false );
            }
            else {
                toggleTray();
            }
            event.preventDefault();
        }

        this.afterburnerFooter.addEventListener( 'pointerdown', onFooterPointerDown );
        this.afterburnerFooter.addEventListener( 'pointerup', onFooterPointerUp );
        this.afterburnerFooter.addEventListener( 'pointercancel', function () {
            tracking = false;
        } );
        this.afterburnerFooter.addEventListener( 'keydown', function ( event ) {
            if ( event.key === 'Enter' || event.key === ' ' ) {
                toggleTray();
                event.preventDefault();
            }
        } );

        // Tap outside an open tray to collapse it.
        document.addEventListener( 'pointerdown', function ( event ) {
            if ( ! hud.compactMode || ! hud.afterburnerTrayOpen ) {
                return;
            }
            if ( hud.afterburnerControls.contains( event.target ) ) {
                return;
            }
            hud.setAfterburnerTrayOpen( false );
        }, true );
    }

    setAfterburnerTrayOpen( open ) {
        this.afterburnerTrayOpen = !! open;
        this.afterburnerControls.classList.toggle( 'expanded', this.afterburnerTrayOpen );
        this.afterburnerControls.classList.toggle( 'collapsed', ! this.afterburnerTrayOpen );
        this.afterburnerControls.setAttribute( 'aria-expanded', this.afterburnerTrayOpen ? 'true' : 'false' );
    }

    syncCompactLayout() {
        let aspect = l.scenograph.cameras.player.aspect;
        let portrait = aspect < 0.88;
        let compact = portrait
            || window.innerHeight <= 520
            || ( aspect >= 1 && window.innerWidth <= 920 );
        let wasCompact = this.compactMode;

        this.portraitMode = portrait;
        this.compactMode = compact;
        this.container.classList.toggle( 'portrait', portrait );
        this.container.classList.toggle( 'compact', compact );

        if ( compact && ! wasCompact ) {
            this.afterburnerControls.classList.add( 'tray' );
            this.setAfterburnerTrayOpen( false );
        }
        else if ( ! compact && wasCompact ) {
            this.afterburnerControls.classList.remove( 'tray', 'collapsed', 'expanded' );
            this.afterburnerTrayOpen = false;
            this.afterburnerControls.setAttribute( 'aria-expanded', 'true' );
        }
    }

    bindAfterburnerControls() {
        let hud = this;

        this.autoAfterburnerSwitch.addEventListener( 'click', function () {
            let ship = hud.getPlayerShip();
            if ( ! ship ) {
                return;
            }
            ship.autoAfterburner = ! ship.autoAfterburner;
            hud.syncAfterburnerControls( ship );
        } );

        let dragging = false;

        function applyDialFromEvent( event ) {
            let ship = hud.getPlayerShip();
            if ( ! ship || ! ship.autoAfterburner ) {
                return;
            }
            let point = event.touches && event.touches[ 0 ] ? event.touches[ 0 ] : event;
            if ( point.clientX === undefined && event.changedTouches && event.changedTouches[ 0 ] ) {
                point = event.changedTouches[ 0 ];
            }
            hud.setThresholdFromPointer( ship, point.clientX, point.clientY );
        }

        function onPointerDown( event ) {
            let ship = hud.getPlayerShip();
            if ( ! ship || ! ship.autoAfterburner ) {
                return;
            }
            dragging = true;
            hud.thresholdDial.classList.add( 'active' );
            if ( hud.thresholdDial.setPointerCapture && event.pointerId !== undefined ) {
                hud.thresholdDial.setPointerCapture( event.pointerId );
            }
            applyDialFromEvent( event );
            event.preventDefault();
        }

        function onPointerMove( event ) {
            if ( ! dragging ) {
                return;
            }
            applyDialFromEvent( event );
            event.preventDefault();
        }

        function onPointerUp( event ) {
            if ( ! dragging ) {
                return;
            }
            dragging = false;
            hud.thresholdDial.classList.remove( 'active' );
            if ( hud.thresholdDial.releasePointerCapture && event.pointerId !== undefined ) {
                try {
                    hud.thresholdDial.releasePointerCapture( event.pointerId );
                }
                catch ( e ) {}
            }
            event.preventDefault();
        }

        this.thresholdDial.addEventListener( 'pointerdown', onPointerDown );
        this.thresholdDial.addEventListener( 'pointermove', onPointerMove );
        this.thresholdDial.addEventListener( 'pointerup', onPointerUp );
        this.thresholdDial.addEventListener( 'pointercancel', onPointerUp );

        // Keyboard: arrow keys nudge threshold in segment steps.
        this.thresholdDial.addEventListener( 'keydown', function ( event ) {
            let ship = hud.getPlayerShip();
            if ( ! ship || ! ship.autoAfterburner ) {
                return;
            }
            let step = 1 / CAPACITOR_SEGMENTS;
            if ( event.key === 'ArrowRight' || event.key === 'ArrowUp' ) {
                ship.afterburnerThreshold = Math.min( 1, ship.afterburnerThreshold + step );
                hud.syncAfterburnerControls( ship );
                event.preventDefault();
            }
            else if ( event.key === 'ArrowLeft' || event.key === 'ArrowDown' ) {
                ship.afterburnerThreshold = Math.max( 0, ship.afterburnerThreshold - step );
                hud.syncAfterburnerControls( ship );
                event.preventDefault();
            }
        } );
    }

    getPlayerShip() {
        if (
            ! l.scenograph.actors
            || ! l.scenograph.actors.player
            || ! l.scenograph.actors.player.vehicle
            || ! l.scenograph.actors.player.vehicle.mesh
            || ! l.scenograph.actors.player.vehicle.mesh.userData.object
        ) {
            return false;
        }
        return l.scenograph.actors.player.vehicle.mesh.userData.object;
    }

    // Map pointer position around the dial to a 0..1 threshold (snapped to segments).
    setThresholdFromPointer( ship, clientX, clientY ) {
        let rect = this.thresholdDial.getBoundingClientRect();
        let cx = rect.left + rect.width / 2;
        let cy = rect.top + rect.height / 2;
        // 0 = up, increasing clockwise; usable sweep is -135deg .. +135deg.
        let angle = Math.atan2( clientX - cx, cy - clientY );
        let start = -Math.PI * 0.75;
        let end = Math.PI * 0.75;
        let t = ( angle - start ) / ( end - start );
        t = Math.max( 0, Math.min( 1, t ) );
        // Snap to segment steps (5%).
        t = Math.round( t * CAPACITOR_SEGMENTS ) / CAPACITOR_SEGMENTS;
        ship.afterburnerThreshold = t;
        this.syncAfterburnerControls( ship );
    }

    syncAfterburnerControls( ship ) {
        let auto = !! ship.autoAfterburner;
        let threshold = Math.max( 0, Math.min( 1, ship.afterburnerThreshold ) );
        let pct = Math.round( threshold * 100 );
        // Needle: -135deg (0%) → +135deg (100%).
        let needleDeg = -135 + threshold * 270;

        this.afterburnerControls.classList.toggle( 'auto-on', auto );
        this.autoAfterburnerSwitch.classList.toggle( 'on', auto );
        this.autoAfterburnerSwitch.setAttribute( 'aria-pressed', auto ? 'true' : 'false' );
        this.thresholdDial.classList.toggle( 'disabled', ! auto );
        this.thresholdDial.setAttribute( 'aria-valuenow', String( pct ) );
        this.thresholdDialNeedle.style.transform = 'translateX(-50%) rotate(' + needleDeg + 'deg)';
        this.thresholdDialValue.textContent = pct + '%';

        this.capacitorCaret.style.left = ( threshold * 100 ) + '%';
        this.capacitorCaret.style.display = auto ? 'block' : 'none';
        this.capacitorElement.classList.toggle( 'auto-off', ! auto );
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof HeadsUpDisplay
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {

        l.scenograph.overlays.hud.syncCompactLayout();

        let ship = l.scenograph.overlays.hud.getPlayerShip();
        if ( ! ship ) {
            return;
        }

        let aspd = -l.scenograph.overlays.hud.frameToSecond( ship.airSpeed );
        l.scenograph.overlays.hud.aspdElement.innerHTML = `AIRSPEED: ${aspd}km/h`;

        let vspd = l.scenograph.overlays.hud.frameToSecond( ship.verticalSpeed );
        l.scenograph.overlays.hud.vspdElement.innerHTML = `VERT. SPD: ${vspd}km/h`;

        let heading = THREE.MathUtils.radToDeg( l.scenograph.actors.player.vehicle.mesh.rotation.y );
        heading = heading % 360;
        if ( heading < 0 ) {
            heading += 360;
        }
        heading = Math.round( 360 - heading );
        l.scenograph.overlays.hud.headingElement.innerHTML = `HEADING: ${heading}°`;

        let elevation = Math.round( l.scenograph.actors.player.vehicle.mesh.position.y * 100 ) / 100;
        l.scenograph.overlays.hud.elevationElement.innerHTML = `ELEVATION: ${elevation}m`;

        let charge = Math.max( 0, Math.min( 1, ship.capacitor ) );
        let chargePct = Math.round( charge * 100 );
        let lit = Math.round( charge * CAPACITOR_SEGMENTS );
        let afterburning = Math.abs( ship.airSpeed ) > ship.cruiseForward;
        let trend = 'steady';
        let segments = l.scenograph.overlays.hud.capacitorSegments;
        let i = 0;

        for ( i = 0; i < segments.length; i++ ) {
            segments[ i ].classList.toggle( 'on', i < lit );
        }

        if ( afterburning && charge > 0 ) {
            trend = 'down';
        }
        else if ( ! afterburning && charge < 1 ) {
            trend = 'up';
        }

        l.scenograph.overlays.hud.capacitorPctElement.textContent = chargePct + '%';
        l.scenograph.overlays.hud.capacitorTrend.classList.remove( 'up', 'down', 'steady' );
        l.scenograph.overlays.hud.capacitorTrend.classList.add( trend );
        l.scenograph.overlays.hud.capacitorElement.classList.toggle( 'draining', trend === 'down' );
        l.scenograph.overlays.hud.capacitorElement.classList.toggle( 'charging', trend === 'up' );
        l.scenograph.overlays.hud.capacitorElement.classList.toggle( 'empty', charge <= 0 );
        l.scenograph.overlays.hud.afterburnerLamp.classList.toggle( 'on', afterburning );
        l.scenograph.overlays.hud.syncAfterburnerControls( ship );
    }

    /**
     * Converts velocity on a per frame basis to per second using FPS.
     */
    frameToSecond( metersPerFrame ) {
        let metersPerSecond = metersPerFrame * l.current_scene.stats.fps;
        metersPerSecond = Math.round( metersPerSecond * 100 ) / 100;
        return metersPerSecond;
    }

}
