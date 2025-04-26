/**
 * Touchscreen Weapon Controls
 * 
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class WeaponControls {
    
    /**
     * Switch indicating we are currently attacking.
     * 
     * @type {boolean} 
     */
    attack;

    /**
     * Switch indicating auto attack is on.
     * 
     * @type {boolean} 
     */
    autoAttack;

    /**
     * HTML Container
     * 
     * @type {HTMLElement}
     */
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

    /**
     * Update hook.
     * 
     * This method is called within the UI setInterval updater, allowing
     * HTML content to be updated at different rate than the 3D frame rate.
     * 
     * @method update
     * @memberof WeaponControls
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {
        const button = l.scenograph.controls.touch.weapons.container.querySelector('button');

        let timeRemaining = 0;

        if ( parseInt(l.current_scene.stats.currentTime) < parseInt(l.current_scene.objects.player.mesh.userData.actor.weapons.last) + parseInt(l.current_scene.objects.player.mesh.userData.actor.weapons.timeout) ) {
            timeRemaining = parseInt(l.current_scene.objects.player.mesh.userData.actor.weapons.timeout) - (
                parseInt(l.current_scene.stats.currentTime) - parseInt(l.current_scene.objects.player.mesh.userData.actor.weapons.last)
            );
        }

        if ( timeRemaining == 0 ) {
            button.disabled = false;
            button.innerHTML = '';
        }
        else {
            button.disabled = true;
            button.innerHTML = timeRemaining + ' ms';
        }

    }

}
