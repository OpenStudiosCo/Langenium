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
    saveStatusTimer;

    constructor() {
        this.container = document.querySelector( '.session_chrome' );
        this.saveButton = document.getElementById( 'save_game' );
        this.exit = document.getElementById( 'exit_game' );
        this.saveStatusTimer = 0;

        if ( this.exit ) {
            this.exit.addEventListener( 'click', () => {
                l.routes.exitGame();
                l.ui.menus.main_menu.returnHome();
            } );
        }

        if ( this.saveButton ) {
            this.saveButton.addEventListener( 'click', () => {
                if ( l.saves ) {
                    l.saves.saveManual();
                }
            } );
        }

        if ( l.saves ) {
            l.saves.onStatus( ( status ) => this.onSaveStatus( status ) );
        }
    }

    setExitVisible( visible ) {
        if ( this.container ) {
            this.container.hidden = !visible;
        }
        else if ( this.exit ) {
            this.exit.hidden = !visible;
        }
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
