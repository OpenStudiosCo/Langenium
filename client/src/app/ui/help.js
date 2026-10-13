/**
 * Help screen
 */

export default class Help {

    /**
     * Open the help panel. During a session the title menu is hidden,
     * so this shows the same panel on its own until it is closed.
     *
     * @param {object} [options] restore runs when Back leaves this help screen
     */
    show( options ) {
        const screen = l.ui.game_menu.title_screen;
        const button = screen.container.querySelector( 'nav [data-action="help"]' );

        this.restore = options && options.restore ? options.restore : null;

        if ( !screen.container.classList.contains( 'active' ) ) {
            screen.container.classList.add( 'active', 'help-session' );
        }

        screen.setExitVisible( false );
        screen.openPanel( 'help', button );
    }

    /**
     * Deactivate Help
     */
    hide() {
        const screen = l.ui.game_menu.title_screen;
        const session = screen.container.classList.contains( 'help-session' );
        const restore = this.restore;

        this.restore = null;
        screen.closePanel();

        if ( session ) {
            screen.container.classList.remove( 'active', 'help-session' );
        }

        if ( session && l.mode !== 'home' ) {
            screen.setExitVisible( true );
        }

        if ( restore ) {
            restore();
        }
    }

}
