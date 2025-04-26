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

    // Updater, runs on setInterval
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
