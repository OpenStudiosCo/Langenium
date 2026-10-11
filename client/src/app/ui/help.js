/**
 * Help screen
 */

export default class Help {

    /**
     * Open the help panel. During a session the title menu is hidden,
     * so this shows the same panel on its own until it is closed.
     */
    show() {
        const screen = l.ui.game_menu.title_screen;
        const button = screen.container.querySelector( 'nav [data-action="help"]' );

        if ( !screen.container.classList.contains( 'active' ) ) {
            screen.container.classList.add( 'active', 'help-session' );
        }

        screen.openPanel( 'help', button );
    }

    /**
     * Deactivate Help
     */
    hide() {
        const screen = l.ui.game_menu.title_screen;
        const session = screen.container.classList.contains( 'help-session' );

        screen.closePanel();

        if ( session ) {
            screen.container.classList.remove( 'active', 'help-session' );
        }
    }

}
