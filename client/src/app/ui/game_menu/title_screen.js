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

        this.depth = 0;
        this.launchTimer = 0;
        this.returnFocus = '';

        this.container.addEventListener( 'click', ( event ) => {
            if ( event.target.closest( '[data-action="close-panel"]' ) ) {
                if ( this.container.classList.contains( 'help-session' ) ) {
                    l.ui.help.hide();
                    return;
                }

                const panel = event.target.closest( '[data-panel]' );
                this.returnFocus = panel ? panel.dataset.path || '' : '';
                this.back();
                return;
            }

            const read = event.target.closest( '[data-read]' );
            if ( read && read.dataset.path ) {
                this.navigate( read.dataset.path );
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

        window.addEventListener( 'popstate', ( event ) => {
            this.depth = event.state && Number.isFinite( event.state.depth ) ? event.state.depth : 0;
            this.onLocation( this.currentPath() );
        } );

        this.show();

        const path = this.currentPath();
        history.replaceState( { menu: path, depth: 0 }, '', path );
        if ( path !== '/' ) {
            this.apply( path );
        }
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
        const path = button.dataset.path || ( action === 'play' ? '/play' : '/' + action );

        if ( action !== 'play' && button.classList.contains( 'selected' ) && this.currentPath() === path ) {
            this.returnFocus = path;
            this.back();
            return;
        }

        this.navigate( path );
    }

    /**
     * Address for the screen that is open, ignoring a trailing slash.
     */
    currentPath() {
        let path = location.pathname || '/';

        if ( path.length > 1 && path.endsWith( '/' ) ) {
            path = path.slice( 0, -1 );
        }

        if ( path === '/index.html' ) {
            return '/';
        }

        if ( path.endsWith( '.html' ) ) {
            path = path.slice( 0, -5 );
        }

        if ( path.endsWith( '/index' ) ) {
            path = path.slice( 0, -6 );
        }

        return path || '/';
    }

    /**
     * Record a menu screen and show it.
     */
    navigate( path ) {
        path = path || '/';

        if ( path !== this.currentPath() ) {
            this.depth += 1;
            history.pushState( { menu: path, depth: this.depth }, '', path );
        }

        this.apply( path );
    }

    /**
     * Step back to the parent screen, or follow the browser history.
     */
    back() {
        if ( this.depth > 0 ) {
            history.back();
            return;
        }

        this.navigate( this.parentPath( this.currentPath() ) );
    }

    parentPath( path ) {
        const panel = this.container.querySelector( '[data-panel][data-path="' + path + '"]' );

        if ( panel && panel.dataset.return ) {
            const parent = this.container.querySelector( 'nav [data-action="' + panel.dataset.return + '"]' );
            if ( parent && parent.dataset.path ) {
                return parent.dataset.path;
            }
        }

        return '/';
    }

    /**
     * Browser back or forward landed on a menu address.
     */
    onLocation( path ) {
        if ( l.mode !== 'home' && path !== '/play' ) {
            l.routes.exitGame();
            l.ui.menus.main_menu.returnHome( { keepUrl: true } );
        }

        this.apply( path );
    }

    /**
     * Open the screen for an address without changing history.
     */
    apply( path ) {
        if ( path === '/play' ) {
            if ( l.mode === 'home' && !this.launching ) {
                const button = this.container.querySelector( 'nav [data-action="play"]' );
                this.startStory( 'hangar', button );
            }
            return;
        }

        window.clearTimeout( this.launchTimer );
        this.launching = false;

        if ( path === '/' ) {
            this.closePanel();
            this.focusReturn();
            return;
        }

        const panel = this.container.querySelector( '[data-panel][data-path="' + path + '"]' );
        if ( !panel ) {
            this.closePanel();
            return;
        }

        const action = panel.dataset.return || panel.dataset.panel;
        const button = this.container.querySelector( 'nav [data-action="' + action + '"]' );
        this.openPanel( panel.dataset.panel, button );
        this.focusReturn();
    }

    focusReturn() {
        if ( !this.returnFocus ) {
            return;
        }

        const button = this.container.querySelector( '[data-path="' + this.returnFocus + '"]' );
        this.returnFocus = '';
        if ( button ) {
            button.focus();
        }
    }

    /**
     * Leave /play in the address bar when the session is over.
     */
    replaceHome() {
        if ( this.currentPath() === '/' ) {
            return;
        }

        this.depth = 0;
        history.replaceState( { menu: '/', depth: 0 }, '', '/' );
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

        window.clearTimeout( this.launchTimer );
        this.launchTimer = window.setTimeout( () => {
            const launch = () => {
                this.launching = false;

                if ( this.currentPath() !== '/play' ) {
                    if ( button ) {
                        button.classList.remove( 'selected' );
                    }
                    return;
                }

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
