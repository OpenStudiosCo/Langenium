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

        // Create the vertical lines
        this.lineElement = document.createElement('div');
        this.lineElement.id = 'hud-lines';
        this.container.appendChild(this.lineElement);

        // Create the label to track air speed.
        this.aspdElement = this.createLabel( 'aspd', 'AIRSPEED: 0km/h');
        this.container.appendChild(this.aspdElement);

        // Create the label to track vertical speed.
        this.vspdElement = this.createLabel( 'vspd', 'VERT. SPD: 0km/h');
        this.container.appendChild(this.vspdElement);

        // Create the label to track air speed.
        this.headingElement = this.createLabel( 'head', 'HEADING: 0°');
        this.container.appendChild(this.headingElement);

        // Create the label to track elevation.
        this.elevationElement = this.createLabel( 'elev', 'ELEVATION: 0m');
        this.container.appendChild(this.elevationElement);

        // Capacitor gauge + afterburner controls.
        this.capacitorPanel = this.createCapacitorPanel();
        this.container.appendChild(this.capacitorPanel);
        this.capacitorElement = this.capacitorPanel.querySelector('#hud-capacitor');
        this.capacitorSegments = this.capacitorElement.querySelectorAll('.seg');
        this.capacitorPctElement = this.capacitorElement.querySelector('.pct');
        this.capacitorTrend = this.capacitorElement.querySelector('.trend');
        this.capacitorCaret = this.capacitorElement.querySelector('.caret');
        this.afterburnerControls = this.capacitorPanel.querySelector('.afterburner-controls');
        this.afterburnerFooter = this.afterburnerControls.querySelector('.afterburner-footer');
        this.afterburnerLamp = this.afterburnerControls.querySelector('.afterburner-lamp');
        this.autoAfterburnerSwitch = this.afterburnerControls.querySelector('.auto-switch');
        this.thresholdDial = this.afterburnerControls.querySelector('.threshold-dial');
        this.thresholdDialNeedle = this.thresholdDial.querySelector('.needle');
        this.thresholdDialValue = this.thresholdDial.querySelector('.dial-value');

        this.bindAfterburnerControls();
        this.bindAfterburnerTray();

    }

    createLabel( keyName, labelText ) {
        let labelElement = document.createElement('div');
        labelElement.innerHTML = labelText;
        labelElement.id = 'hud-' + keyName;
        labelElement.dataset.id = keyName;
        return labelElement;
    }

    createCapacitorPanel() {
        let panel = document.createElement('div');
        panel.id = 'hud-capacitor-panel';

        let gauge = document.createElement('div');
        gauge.id = 'hud-capacitor';
        gauge.dataset.id = 'capacitor';

        let status = document.createElement('div');
        status.className = 'status';

        let pct = document.createElement('div');
        pct.className = 'pct';
        pct.textContent = '100%';

        let trend = document.createElement('div');
        trend.className = 'trend steady';
        trend.setAttribute( 'aria-hidden', 'true' );

        status.appendChild(pct);
        status.appendChild(trend);

        let track = document.createElement('div');
        track.className = 'track';

        let segments = document.createElement('div');
        segments.className = 'segments';
        for ( let i = 0; i < CAPACITOR_SEGMENTS; i++ ) {
            let seg = document.createElement('div');
            seg.className = 'seg';
            segments.appendChild(seg);
        }
        track.appendChild(segments);

        let caret = document.createElement('div');
        caret.className = 'caret';
        track.appendChild(caret);

        let capLabel = document.createElement('div');
        capLabel.className = 'label';
        capLabel.textContent = 'CAPACITOR';

        gauge.appendChild(status);
        gauge.appendChild(track);
        gauge.appendChild(capLabel);

        // Single framed afterburner control: label + auto + threshold dial.
        let controls = document.createElement('div');
        controls.className = 'afterburner-controls';
        controls.id = 'hud-afterburner';

        let body = document.createElement('div');
        body.className = 'afterburner-body';

        let autoSwitch = document.createElement('button');
        autoSwitch.type = 'button';
        autoSwitch.className = 'auto-switch on';
        autoSwitch.setAttribute( 'aria-pressed', 'true' );
        autoSwitch.textContent = 'AUTO';

        let dial = document.createElement('div');
        dial.className = 'threshold-dial';
        dial.setAttribute( 'role', 'slider' );
        dial.setAttribute( 'aria-valuemin', '0' );
        dial.setAttribute( 'aria-valuemax', '100' );
        dial.setAttribute( 'aria-valuenow', '25' );
        dial.setAttribute( 'aria-label', 'Afterburner minimum charge' );
        dial.tabIndex = 0;

        let dialFace = document.createElement('div');
        dialFace.className = 'face';
        let dialNeedle = document.createElement('div');
        dialNeedle.className = 'needle';
        let dialValue = document.createElement('div');
        dialValue.className = 'dial-value';
        dialValue.textContent = '25%';
        dial.appendChild(dialFace);
        dial.appendChild(dialNeedle);
        dial.appendChild(dialValue);

        body.appendChild(autoSwitch);
        body.appendChild(dial);

        // Status lamp + label under the controls.
        let footer = document.createElement('div');
        footer.className = 'afterburner-footer';

        let lamp = document.createElement('div');
        lamp.className = 'afterburner-lamp';
        lamp.setAttribute( 'aria-hidden', 'true' );

        let title = document.createElement('div');
        title.className = 'afterburner-label';
        title.textContent = 'AFTERBURNER';

        // Affordance: points open-ward when collapsed, close-ward when expanded.
        let chevron = document.createElement('div');
        chevron.className = 'afterburner-chevron';
        chevron.setAttribute( 'aria-hidden', 'true' );

        footer.appendChild(lamp);
        footer.appendChild(title);
        footer.appendChild(chevron);
        footer.setAttribute( 'role', 'button' );
        footer.setAttribute( 'aria-label', 'Afterburner controls' );
        footer.tabIndex = 0;

        controls.appendChild(body);
        controls.appendChild(footer);
        controls.setAttribute( 'aria-expanded', 'true' );

        panel.appendChild(gauge);
        panel.appendChild(controls);
        return panel;
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
