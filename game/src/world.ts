/**
 * Game World class
 * 
 * Loads and runs simulations of game scenes
 * 
 */

import Overworld from "./scenes/overworld.yml";

interface WorldInstance {
    actors: Record<string, any>;
    objects: Record<string, any>;
}
  
export default class World {

    public instance: WorldInstance;

    constructor( sceneName: string ) {
        if ( sceneName === 'Overworld' ) {
            this.initialise( Overworld );          
        }
    }

    /**
     * Initialise game world instance.
     *
     * Parses config and builds a self updating virtual world simulation.
     *
     * @todo:
     * - load abstract scene definition file overworld.yml and parse it
     * - loop over config to load game world simulation in here and scenograph in the client
     */
    initialise( config ) {
        this.instance = {
            actors: config.actors,
            objects: config.objects
        };

        // console.log(this.instance);
        // debugger;
    }

    update() {

    }

}

