/**
 * Base Systems
 * 
 * Defines an interface that fires a vehicles weapons.
 */


export default class BaseSystem {

    type;

    constructor( type = 'missile' ) {
        this.type = type;
    }

}
