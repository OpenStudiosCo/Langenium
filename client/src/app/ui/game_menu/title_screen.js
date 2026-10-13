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

        this.container.querySelectorAll( '[data-version]' ).forEach( ( version ) => {
            version.textContent = l.version;
        } );

        this.exit = document.getElementById( 'exit_game' );
        if ( this.exit ) {
            this.exit.addEventListener( 'click', () => {
                l.routes.exitGame();
                l.ui.menus.main_menu.returnHome();
            } );
        }

        this.bindSettings();
        this.bindStoryScroll();

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
        this.setExitVisible( false );

        if ( l.current_scene && l.current_scene.objects && l.current_scene.objects.logo ) {
            l.current_scene.objects.logo.show();
        }
    }

    hide() {
        this.closePanel();
        this.container.classList.remove( 'active', 'help-session' );
        this.setExitVisible( true );

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

        this.rememberOpenStory();

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

        if ( name === 'settings' ) {
            this.syncSettings();
        }

        this.container.scrollTop = 0;
        const detail = this.container.querySelector( '.title_screen_detail' );
        if ( detail ) {
            detail.scrollTop = 0;
        }

        const body = this.container.querySelector( '[data-panel="' + name + '"] .panel_body' );
        const story = body && body.closest( '.story_reader' );
        if ( story ) {
            this.restoreStoryScroll( story );
        }
        else if ( body ) {
            body.scrollTop = 0;
        }

        const back = this.container.querySelector( '[data-panel="' + name + '"] .panel_back' );
        if ( back ) {
            back.focus();
        }
    }

    setExitVisible( visible ) {
        if ( this.exit ) {
            this.exit.hidden = !visible;
        }
    }

    bindSettings() {
        this.syncSettings();

        this.container.querySelectorAll( '[data-setting]' ).forEach( ( input ) => {
            input.addEventListener( 'change', () => {
                this.applySetting( input.dataset.setting, input.checked );
            } );
        } );
    }

    syncSettings() {
        const gpu = l.config.client_info.gpu;
        const tier = gpu && typeof gpu.tier === 'number' ? gpu.tier : 0;

        this.container.querySelectorAll( '[data-setting]' ).forEach( ( input ) => {
            input.checked = !!l.config.settings[ input.dataset.setting ];

            if ( input.dataset.setting === 'fast' ) {
                input.disabled = tier < 3;
            }
        } );
    }

    applySetting( name, checked ) {
        const input = this.container.querySelector( '[data-setting="' + name + '"]' );

        if ( this.applying || ( input && input.disabled ) || !l.config.settings || !Object.prototype.hasOwnProperty.call( l.config.settings, name ) ) {
            return;
        }

        l.config.settings[ name ] = checked;
        this.applying = true;

        if ( name === 'debug' ) {
            l.scenograph.modes.debugging.toggle();
        }

        if ( name === 'fast' ) {
            l.scenograph.modes.fast.toggle();
        }

        l.config.save_settings();

        const menu = l.ui.menus && l.ui.menus.main_menu;
        const binding = menu && menu.settings && menu.settings[ name ];

        if ( binding && typeof binding.refresh === 'function' ) {
            binding.refresh();
        }

        this.syncSettings();
        this.applying = false;
    }

    bindStoryScroll() {
        this.storyScrollTimer = 0;

        this.container.querySelectorAll( '.story_reader .panel_body' ).forEach( ( body ) => {
            body.addEventListener( 'scroll', () => {
                window.clearTimeout( this.storyScrollTimer );
                this.storyScrollTimer = window.setTimeout( () => {
                    this.rememberStoryScroll( body.closest( '.story_reader' ) );
                }, 150 );
            }, { passive: true } );
        } );

        window.addEventListener( 'pagehide', () => {
            this.rememberOpenStory();
        } );
    }

    rememberOpenStory() {
        this.rememberStoryScroll( this.container.querySelector( '.story_reader:not([hidden])' ) );
    }

    rememberStoryScroll( panel ) {
        if ( !panel || !panel.dataset.path ) {
            return;
        }

        const body = panel.querySelector( '.panel_body' );
        if ( !body ) {
            return;
        }

        const saved = l.config.get_story_scroll();
        saved[ panel.dataset.path ] = body.scrollTop;
        l.config.save_story_scroll( saved );
    }

    restoreStoryScroll( panel ) {
        const body = panel.querySelector( '.panel_body' );
        const top = Number( l.config.get_story_scroll()[ panel.dataset.path ] );

        if ( !body || !Number.isFinite( top ) || top <= 0 ) {
            if ( body ) {
                body.scrollTop = 0;
            }
            return;
        }

        const apply = () => {
            body.scrollTop = top;
        };

        apply();
        if ( Math.abs( body.scrollTop - top ) > 1 ) {
            window.requestAnimationFrame( apply );
        }
    }

    closePanel() {
        this.rememberOpenStory();

        this.panels.forEach( ( panel ) => {
            panel.hidden = true;
        } );
        this.actions.forEach( ( item ) => item.classList.remove( 'selected' ) );
        this.container.classList.remove( 'panel-open' );
    }

}
