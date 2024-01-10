/***
 * Scenograph class
 * 
 * Controls which scene composition is being played in the game client
 * 
 * e.g. scene objects, sky box, lighting, effects.
 */

/**
 * Scenes 
 */
import Overworld from './scenes/overworld.js';

export default class Scenograph {
    constructor() {}

    load( sceneName ) {
        let scene = false;

        if ( sceneName == 'Overworld' ) {
            scene = new Overworld();
        }
        return scene;
    }

}
