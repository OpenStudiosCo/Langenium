/**
 * @name            Title screen
 * @description     Home-mode front menu drawn over the scene.
 * @namespace       l.ui.game_menu.title_screen
 * @memberof        l.ui.game_menu
 */

export default class Title_Screen {

    container;

    constructor() {
        this.container = document.getElementById( 'title_screen' );
        this.nav = this.container.querySelector( 'nav' );
        this.panels = this.container.querySelectorAll( '[data-panel]' );
        this.actions = this.container.querySelectorAll( 'nav [data-action]' );

        const version = this.container.querySelector( '[data-version]' );
        if ( version ) {
            version.textContent = l.version;
        }

        this.container.addEventListener( 'click', ( event ) => {
            const story = event.target.closest( '[data-story]' );
            if ( story ) {
                this.startStory( story.dataset.story );
                return;
            }

            const action = event.target.closest( 'nav [data-action]' );
            if ( action ) {
                this.onAction( action.dataset.action, action );
            }
        } );

        this.show();
    }

    show() {
        this.closePanel();
        this.container.classList.add( 'active' );
    }

    hide() {
        this.closePanel();
        this.container.classList.remove( 'active' );
    }

    onAction( action, button ) {
        if ( action === 'play' ) {
            this.startStory( 'overworld' );
            return;
        }

        if ( action === 'help' ) {
            l.ui.help.show();
            return;
        }

        if ( button.classList.contains( 'selected' ) ) {
            this.closePanel();
            return;
        }

        this.openPanel( action, button );
    }

    /**
     * @param {string} story overworld | hangar | multiplayer
     */
    startStory( story ) {
        if ( story === 'multiplayer' ) {
            return;
        }

        l.ui.menus.main_menu.enterSession();

        if ( story === 'hangar' ) {
            new l.routes.hangar();
            return;
        }

        new l.routes.singlePlayer();
    }

    openPanel( name, button ) {
        let found = false;

        this.panels.forEach( ( panel ) => {
            const open = panel.dataset.panel === name;
            panel.hidden = !open;
            if ( open ) {
                found = true;
            }
        } );

        if ( !found ) {
            return;
        }

        this.actions.forEach( ( item ) => item.classList.remove( 'selected' ) );
        button.classList.add( 'selected' );
        this.container.classList.add( 'panel-open' );
    }

    closePanel() {
        this.panels.forEach( ( panel ) => {
            panel.hidden = true;
        } );
        this.actions.forEach( ( item ) => item.classList.remove( 'selected' ) );
        this.container.classList.remove( 'panel-open' );
    }

}
