/**
 * @name            In-game menu
 * @description     Session chrome and future in-game menu while playing.
 * @namespace       l.ui.game_menu.in_game
 * @memberof        l.ui.game_menu
 */

export default class InGame {

    container;
    saveButton;
    exit;
    fullscreenButton;
    saveStatusTimer;

    constructor() {
        this.container = document.querySelector( '.session_chrome' );
        this.saveButton = document.getElementById( 'save_game' );
        this.exit = document.getElementById( 'exit_game' );
        this.fullscreenButton = document.getElementById( 'fullscreen_toggle' );
        this.saveStatusTimer = 0;

        if ( this.exit ) {
            this.exit.addEventListener( 'click', () => {
                l.routes.exitGame();
                l.ui.menus.main_menu.returnHome();
            } );
        }

        if ( this.saveButton ) {
            this.saveButton.addEventListener( 'click', () => {
                if ( l.sessions ) {
                    l.sessions.saveManual();
                }
            } );
        }

        if ( this.fullscreenButton ) {
            this.fullscreenButton.addEventListener( 'click', () => {
                this.toggleFullscreen();
            } );
            document.addEventListener( 'fullscreenchange', () => {
                this.syncFullscreenButton();
            } );
            this.syncFullscreenButton();
        }

        if ( l.sessions ) {
            l.sessions.onStatus( ( status ) => this.onSaveStatus( status ) );
        }
    }

    setExitVisible( visible ) {
        if ( this.container ) {
            this.container.hidden = !visible;
        }
        else if ( this.exit ) {
            this.exit.hidden = !visible;
        }

        // Same lifecycle as Save/Exit: hidden on the title screen, shown in-session.
        if ( this.fullscreenButton ) {
            this.fullscreenButton.hidden = !visible;
        }
    }

    /**
     * Enter or leave the browser full-screen presentation.
     */
    toggleFullscreen() {
        if ( this.isFullscreen() ) {
            if ( document.exitFullscreen ) {
                document.exitFullscreen();
            }
            return;
        }

        const root = document.documentElement;
        if ( root.requestFullscreen ) {
            root.requestFullscreen();
        }
    }

    isFullscreen() {
        return Boolean( document.fullscreenElement );
    }

    /**
     * Match the control label and icon to the current full-screen state.
     */
    syncFullscreenButton() {
        if ( ! this.fullscreenButton ) {
            return;
        }

        const active = this.isFullscreen();
        this.fullscreenButton.classList.toggle( 'is-fullscreen', active );
        this.fullscreenButton.setAttribute(
            'aria-label',
            active ? 'Exit full screen' : 'Enter full screen'
        );
    }

    onSaveStatus( status ) {
        if ( ! this.saveButton ) {
            return;
        }

        window.clearTimeout( this.saveStatusTimer );
        this.saveButton.classList.remove( 'is-saving', 'is-saved', 'is-error' );

        if ( status === 'saving' || status === 'loading' ) {
            this.saveButton.classList.add( 'is-saving' );
            return;
        }

        if ( status === 'error' ) {
            this.saveButton.classList.add( 'is-error' );
            this.saveStatusTimer = window.setTimeout( () => {
                this.saveButton.classList.remove( 'is-error' );
            }, 1600 );
            return;
        }

        if ( status === 'saved' ) {
            this.saveButton.classList.add( 'is-saved' );
            this.saveStatusTimer = window.setTimeout( () => {
                this.saveButton.classList.remove( 'is-saved' );
            }, 1200 );
        }
    }

}
