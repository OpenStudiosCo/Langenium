/**
 * Game client configuration.
 */

export default class Config {
    client_info;

    settings;

    constructor() {
        // Store info about the players browser and device.
        this.client_info = {
            gpu: {
                tier: 0
            }
        };

        // Configure the game settings
        this.settings = this.get_settings();

        if ( this.settings === null ) {
            this.settings = this.default_settings();
        }

        // Allow URL parameters to override saved settings.
        let url = new URL( window.location.href );

        // Check if we should skip the logo title sequence.
        this.settings.skipintro = url.searchParams.has( "skipintro" ) ? true : this.settings.skipintro;

        // Check if we're in debug mode.
        this.settings.debug = url.searchParams.has( "debug" ) ? true : this.settings.debug;

        // Set fast mode on by default, gpu tier will determine if it can switch off.
        this.settings.fast = url.searchParams.has( "fast" ) ? true : this.settings.fast;

        // Save setings for next time.
        this.save_settings();

    }

    /**
     * Get default settings
     */
    default_settings() {
        let settings = {
            fast: true,
            debug: false,
            skipintro: false
        };

        return settings;
    }

    save_settings() {
        return localStorage.setItem( 'config', JSON.stringify( this.settings ) );
    }

    get_settings() {
        return JSON.parse(localStorage.getItem( 'config' ) );
    }
}
