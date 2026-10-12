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
            if ( event.target.closest( '[data-action="close-panel"]' ) ) {
                if ( this.container.classList.contains( 'help-session' ) ) {
                    l.ui.help.hide();
                    return;
                }

                const panel = event.target.closest( '[data-panel]' );

                if ( panel && panel.dataset.return ) {
                    const returnTo = this.container.querySelector( 'nav [data-action="' + panel.dataset.return + '"]' );
                    this.openPanel( panel.dataset.return, returnTo );
                    const storyButton = this.container.querySelector( '[data-read="' + panel.dataset.panel + '"]' );
                    if ( storyButton ) {
                        storyButton.focus();
                    }
                    return;
                }

                const returnTo = panel && this.container.querySelector( 'nav [data-action="' + panel.dataset.panel + '"]' );
                this.closePanel();
                if ( returnTo ) {
                    returnTo.focus();
                }
                return;
            }

            const read = event.target.closest( '[data-read]' );
            if ( read ) {
                const stories = this.container.querySelector( 'nav [data-action="stories"]' );
                this.openPanel( read.dataset.read, stories );
                return;
            }

            const story = event.target.closest( '[data-story]' );
            if ( story ) {
                this.startStory( story.dataset.story, story );
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
        this.container.classList.remove( 'help-session' );
        this.container.classList.add( 'active' );

        if ( l.current_scene && l.current_scene.objects && l.current_scene.objects.logo ) {
            l.current_scene.objects.logo.show();
        }
    }

    hide() {
        this.closePanel();
        this.container.classList.remove( 'active', 'help-session' );

        if ( l.current_scene && l.current_scene.objects && l.current_scene.objects.logo ) {
            l.current_scene.objects.logo.hide();
        }
    }

    onAction( action, button ) {
        if ( action === 'play' ) {
            this.startStory( 'hangar', button );
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
    startStory( story, button ) {
        if ( story === 'multiplayer' || this.launching ) {
            return;
        }

        this.launching = true;
        if ( button ) {
            button.classList.add( 'selected' );
        }

        window.setTimeout( () => {
            const launch = () => {
                this.launching = false;

                if ( story === 'hangar' ) {
                    new l.routes.hangar();
                }
                else {
                    new l.routes.singlePlayer();
                }

                l.ui.menus.main_menu.enterSession();
            };

            const tour = l.current_scene && l.current_scene.objects && l.current_scene.objects.demoTour;
            if ( tour ) tour.throughBlack( launch );
            else launch();
        }, 500 );
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
        if ( button ) {
            button.classList.add( 'selected' );
        }
        this.container.classList.add( 'panel-open' );

        this.container.scrollTop = 0;
        const detail = this.container.querySelector( '.title_screen_detail' );
        if ( detail ) {
            detail.scrollTop = 0;
        }

        const body = this.container.querySelector( '[data-panel="' + name + '"] .panel_body' );
        if ( body ) {
            body.scrollTop = 0;
        }

        const back = this.container.querySelector( '[data-panel="' + name + '"] .panel_back' );
        if ( back ) {
            back.focus();
        }
    }

    closePanel() {
        this.panels.forEach( ( panel ) => {
            panel.hidden = true;
        } );
        this.actions.forEach( ( item ) => item.classList.remove( 'selected' ) );
        this.container.classList.remove( 'panel-open' );
    }

}
