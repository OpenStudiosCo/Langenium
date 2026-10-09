/**
 * Touch Controls
 * 
 * Based on https://mese79.github.io/TouchControls/
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import TouchControlUI from '@/scenograph/controls/touch/TouchControlUI';
import WeaponControls from '@/scenograph/controls/touch/weapons';

export default class TouchControls {
    controls;

    weapons;

    constructor() {
        // Controls
        let options = {
            delta        :  0.75,       // coefficient of movement
            moveSpeed    :  0.0025,     // speed of movement
            rotationSpeed:  0.0025,     // coefficient of rotation
            maxPitch     :  55,         // max camera pitch angle
        }
        this.controls = new TouchControlUI(
            document.querySelector( 'body' ),
            l.scenograph.cameras.player,
            options
        );
        this.controls.movementPad.padElement.style.display = 'none';
        this.controls.rotationPad.padElement.style.display = 'none';
        this.controls.sliderStick.stickElement.style.display = 'none';

        this.weapons = new WeaponControls();
        this.weapons.container.style.display = 'none';

    }

    activate() {
        this.controls.enabled = true;
        this.controls.movementPad.padElement.style.filter = 'invert(1)';
        this.controls.rotationPad.padElement.style.filter = 'invert(1)';
        this.controls.sliderStick.stickElement.style.filter = 'invert(1)';

        this.controls.movementPad.padElement.style.display = '';
        this.controls.rotationPad.padElement.style.display = '';
        this.setAircraftChrome( l.mode !== 'hangar' );
    }

    /**
     * Climb slider and weapons are aircraft-only. Hangar uses move, camera, and overlays.
     */
    setAircraftChrome( show ) {
        this.controls.sliderStick.stickElement.style.display = show ? '' : 'none';
        this.weapons.container.style.display = show ? 'flex' : 'none';
    }

    deactivate() {
        this.controls.enabled = false;
        this.controls.movementPad.padElement.style.display = 'none';
        this.controls.rotationPad.padElement.style.display = 'none';
        this.setAircraftChrome( false );
    }
}
