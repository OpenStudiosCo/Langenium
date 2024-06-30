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
        if ( url.searchParams.has( "skipintro" ) ) {
            this.skipintro = true;
        }

        // Check if we're in debug mode.
        if ( url.searchParams.has( "debug" ) ) {
            this.debug = true;
        }

        // Check if we're in fast mode.
        if ( url.searchParams.has( "fast" ) ) {
            this.fast = true;
        }
    }
}
