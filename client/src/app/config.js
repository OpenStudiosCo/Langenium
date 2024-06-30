/**
 * Game client configuration.
 */

export default class Config {
    debug;

    fast;

    skipintro;

    constructor() {
        let url = new URL( window.location.href );

        // Check if we should skip the logo title sequence.
        this.skipintro = url.searchParams.has( "skipintro" );

        // Check if we're in debug mode.
        this.debug = url.searchParams.has( "debug" );
        
        // Set fast mode on by default, gpu tier will determine if it can switch off.
        this.fast = true;

    }
}
