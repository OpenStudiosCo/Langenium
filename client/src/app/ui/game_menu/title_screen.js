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

            const slotContinue = event.target.closest( '[data-slot-continue]' );
            if ( slotContinue ) {
                this.launchSlot( Number( slotContinue.dataset.slotContinue ), 'continue' );
                return;
            }

            const slotNew = event.target.closest( '[data-slot-new]' );
            if ( slotNew ) {
                const slot = Number( slotNew.dataset.slotNew );
                const occupied = !!l.saves.read( slot );
                if ( occupied && ! window.confirm( 'Overwrite save slot ' + ( slot + 1 ) + '?' ) ) {
                    return;
                }
                this.launchSlot( slot, 'new' );
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
        this.setSessionChromeVisible( false );

        if ( l.current_scene && l.current_scene.objects && l.current_scene.objects.logo ) {
            l.current_scene.objects.logo.show();
        }
    }

    hide() {
        this.closePanel();
        this.container.classList.remove( 'active', 'help-session' );
        this.setSessionChromeVisible( true );

        if ( l.current_scene && l.current_scene.objects && l.current_scene.objects.logo ) {
            l.current_scene.objects.logo.hide();
        }
    }

    /**
     * Session Save/Exit chrome lives on InGame; title only toggles visibility.
     */
    setSessionChromeVisible( visible ) {
        const inGame = l.ui.game_menu && l.ui.game_menu.in_game;
        if ( inGame ) {
            inGame.setExitVisible( visible );
        }
    }

    onAction( action, button ) {
        const path = button.dataset.path || ( action === 'play' ? '/play/' : '/' + action + '/' );

        if ( button.classList.contains( 'selected' ) && this.currentPath() === path ) {
            this.returnFocus = path;
            this.back();
            return;
        }

        this.navigate( path );
    }

    /**
     * Address for the screen that is open.
     * Menu pages are directories, so the working URL keeps its trailing slash.
     */
    currentPath() {
        let path = location.pathname || '/';

        if ( path === '/index.html' || path === '/index' ) {
            return '/';
        }

        if ( path.endsWith( '/index.html' ) ) {
            path = path.slice( 0, -'/index.html'.length );
        }
        else if ( path.endsWith( '.html' ) ) {
            path = path.slice( 0, -'.html'.length );
        }
        else if ( path.endsWith( '/index' ) ) {
            path = path.slice( 0, -'/index'.length );
        }

        if ( path.length > 1 && !path.endsWith( '/' ) ) {
            path += '/';
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
        if ( l.mode !== 'home' && path !== '/play/' ) {
            l.routes.exitGame();
            l.ui.menus.main_menu.returnHome( { keepUrl: true } );
        }

        this.apply( path );
    }

    /**
     * Open the screen for an address without changing history.
     */
    apply( path ) {
        window.clearTimeout( this.launchTimer );
        this.launching = false;

        if ( path === '/' ) {
            this.closePanel();
            this.focusReturn();
            return;
        }

        // In-session /play/ address stays put; do not reopen the slot picker.
        if ( path === '/play/' && l.mode !== 'home' ) {
            return;
        }

        const panel = this.container.querySelector( '[data-panel][data-path="' + path + '"]' );
        if ( !panel ) {
            this.closePanel();
            return;
        }

        if ( panel.dataset.panel === 'play' ) {
            this.refreshSaveSlots();
        }

        const action = panel.dataset.return || panel.dataset.panel;
        const button = this.container.querySelector( 'nav [data-action="' + action + '"]' );
        this.openPanel( panel.dataset.panel, button );
        this.focusReturn();
    }

    refreshSaveSlots() {
        const list = this.container.querySelector( '[data-save-slots]' );
        const template = document.querySelector( '#templates #save_slot' );
        if ( ! list || ! l.saves || ! template ) {
            return;
        }

        list.innerHTML = '';
        l.saves.list().forEach( ( entry ) => {
            const summary = l.saves.slotSummary( entry.payload );
            const item = template.content.firstElementChild.cloneNode( true );

            item.className = summary.empty ? 'save_slot empty' : 'save_slot occupied';
            item.querySelector( '.save_slot_index' ).textContent = String( entry.slot + 1 ).padStart( 2, '0' );
            item.querySelector( '.save_slot_title' ).textContent = summary.title;
            item.querySelector( '.save_slot_detail' ).textContent = summary.detail;

            const continueButton = item.querySelector( '[data-slot-continue]' );
            const newButton = item.querySelector( '[data-slot-new]' );
            const slot = String( entry.slot );

            if ( summary.empty ) {
                continueButton.hidden = true;
                continueButton.removeAttribute( 'data-slot-continue' );
                newButton.classList.remove( 'save_slot_new' );
                newButton.dataset.slotNew = slot;
            }
            else {
                continueButton.hidden = false;
                continueButton.dataset.slotContinue = slot;
                newButton.classList.add( 'save_slot_new' );
                newButton.dataset.slotNew = slot;
            }

            list.appendChild( item );
        } );
    }

    /**
     * Spawn from defaults or a save, then enter hangar or overworld.
     */
    launchSlot( slot, mode ) {
        if ( this.launching || l.mode !== 'home' ) {
            return;
        }

        this.launching = true;
        const playButton = this.container.querySelector( 'nav [data-action="play"]' );
        if ( playButton ) {
            playButton.classList.add( 'selected' );
        }

        window.clearTimeout( this.launchTimer );
        this.launchTimer = window.setTimeout( () => {
            const launch = async () => {
                this.launching = false;

                if ( this.currentPath() !== '/play/' ) {
                    if ( playButton ) {
                        playButton.classList.remove( 'selected' );
                    }
                    return;
                }

                const existing = mode === 'continue' ? l.saves.read( slot ) : null;
                const session = await l.saves.startSession( slot, mode );
                if ( session.appMode === 'single_player' ) {
                    new l.routes.singlePlayer();
                }
                else {
                    new l.routes.hangar();
                }
                // Hangar placement overwrites poses; re-apply Continue state afterwards.
                if ( existing ) {
                    l.saves.apply( existing );
                }
                l.saves.saveNow( 'launch' );

                l.ui.menus.main_menu.enterSession( {
                    welcome: mode !== 'continue',
                } );
            };

            const tour = l.current_scene && l.current_scene.objects && l.current_scene.objects.demoTour;
            if ( tour ) {
                tour.throughBlack( () => {
                    launch();
                } );
            }
            else {
                launch();
            }
        }, 500 );
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
     * Debug / legacy path: ensure a player exists, then enter the mode.
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
            const launch = async () => {
                this.launching = false;

                await l.saves.ensurePlayerReady();

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

        // Wordmark stays on the main menu only.
        if ( l.current_scene && l.current_scene.objects && l.current_scene.objects.logo ) {
            l.current_scene.objects.logo.hide();
        }

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
        const saved = l.config.get_story_scroll();
        const path = panel.dataset.path;
        const top = Number( saved[ path ] !== undefined ? saved[ path ] : saved[ path.replace( /\/$/, '' ) ] );

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

        if (
            this.container.classList.contains( 'active' )
            && l.current_scene
            && l.current_scene.objects
            && l.current_scene.objects.logo
        ) {
            l.current_scene.objects.logo.show();
        }
    }

}
