/**
 * Fast mode
 * 
 * Can be active for game modes and the home screen.
 */

import l from "@/helpers/l";

export default class Fast {
    active;

    constructor() {
        this.active = false;
    }

    // Toggle debugging mode on and off.
    toggle() {

        if ( this.active ) {
            this.deactivate();
        }
        else {
            this.activate();
        }

    }

    activate() {
        

        this.active = true;

    }

    deactivate() {
        if ( l.current_scene.effects.postprocesing == undefined
            || l.current_scene.effects.postprocesing ==  false ) {
            l.scenograph.effects.init();
            l.current_scene.effects.postprocessing.passes.forEach( ( effectPass ) => {
                if ( effectPass.name == 'EffectPass' ) {
                    effectPass.effects.forEach( ( effect ) => {
                        if ( effect.name == 'BloomEffect' ) {
                            effect.blendMode.setOpacity( 0 );
                        }
                    } );
                }

            } );
        }

        this.active = false;

    }
}
