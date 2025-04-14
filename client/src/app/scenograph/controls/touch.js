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
        l.scenograph.controls.touch.controls.movementPad.padElement.style.filter = 'invert(1)';
        l.scenograph.controls.touch.controls.rotationPad.padElement.style.filter = 'invert(1)';
        l.scenograph.controls.touch.controls.sliderStick.stickElement.style.filter = 'invert(1)';

        l.scenograph.controls.touch.controls.movementPad.padElement.style.display = '';
        l.scenograph.controls.touch.controls.rotationPad.padElement.style.display = '';
        l.scenograph.controls.touch.controls.sliderStick.stickElement.style.display = '';

        l.scenograph.controls.touch.weapons.container.style.display = '';
    }

    deactivate() {
        this.controls.enabled = false;
        l.scenograph.controls.touch.controls.movementPad.padElement.style.display = 'none';
        l.scenograph.controls.touch.controls.rotationPad.padElement.style.display = 'none';
        l.scenograph.controls.touch.controls.sliderStick.stickElement.style.display = 'none';
        l.scenograph.controls.touch.weapons.container.style.display = 'none';
    }
}
