/**
 * Weapon Controls
 * 
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class WeaponControls {
    attack;

    autoAttack;

    container;

    constructor() {
        this.attack = false;
        this.autoAttack = true;

        this.container = document.getElementById('weapon_controls');

        this.container.querySelector('.switch input').onchange = ()=>{
            l.scenograph.controls.touch.weapons.autoAttack = l.scenograph.controls.touch.weapons.container.querySelector('.switch input').checked;
        };        

        this.container.querySelector('button').onclick = ()=>{
            l.scenograph.controls.touch.weapons.attack = true;
        };

        this.container.querySelector('button').onblur = ()=>{
            l.scenograph.controls.touch.weapons.attack = false;
        };

    }

}
