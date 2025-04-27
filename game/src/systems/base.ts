/**
 * Base Systems
 * 
 * Scaffold for subsystems that attach to other objects like vehicles.
 */


export default class BaseSystem {

    // Timestamp of the last system run.
    last;
    
    // Delay between system runs.
    timeout;

    constructor( ) {
        this.last = 0;
        this.timeout = 0;
    }

}
