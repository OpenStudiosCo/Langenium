/**
 * Main menu
 */

import { Pane } from 'tweakpane';

export default class Main_Menu {
    buttons;

    default_title;

    pane;

    settings;

    constructor() {

        this.default_title = "Main Menu";//Langenium v" + l.version;

        this.buttons = {};

        this.settings = {};

        /**
         * Setup the menu's Tweakpane Pane UI
         */
        this.pane = new Pane( {
            title: this.default_title,
            container: document.getElementById( 'main_menu' ),
            expanded: false
        } );

        this.buttons.exit_game = this.pane.addButton( {
            title: 'Exit game',
            hidden: true
        } );
        this.buttons.exit_game.on( 'click', () => {
            l.routes.exitGame();
            this.returnHome();
        } );

        this.buttons.scores = this.pane.addButton( {
            title: 'Scores',
            hidden: true
        } );

        this.buttons.scores.on( 'click', () => {
            l.ui.score_table.show();
        });

        this.buttons.player_one = this.pane.addButton( {
            title: 'P1: Overworld',
        } );
        this.buttons.player_one.on( 'click', () => {
            this.enterSession();
            new l.routes.singlePlayer();
        } );

        this.buttons.player_two = this.pane.addButton( {
            title: 'P2: Hangar',
        } );
        this.buttons.player_two.on( 'click', () => {
            this.enterSession();
            new l.routes.hangar();
        } );

        this.buttons.multi_player = this.pane.addButton( {
            title: 'Multi Player',
            disabled: true // @todo: v7 Restore multiplayer and server tracking of scene objects.
        } );
        this.buttons.multi_player.on( 'click', () => {
            this.enterSession();
            new l.routes.multiPlayer();
        } );

        this.buttons.settings = this.pane.addButton( {
            title: 'Settings',
        } );
        this.buttons.settings.on( 'click', () => {
            console.log( 'Settings launched' );

            // Hide all the other buttons.
            this.buttons.scores.hidden = true;
            this.buttons.exit_game.hidden = true;
            this.buttons.player_one.hidden = true;
            this.buttons.player_two.hidden = true;
            this.buttons.multi_player.hidden = true;
            this.buttons.settings.hidden = true;
            this.buttons.help.hidden = true;

            // Show the settings area elements.
            this.buttons.settingsExit.hidden = false;
            this.settings.debug.hidden = false;
            this.settings.fast.hidden = false;
            this.settings.skipintro.hidden = false;

            // Change the main menu title.
            this.pane.title = 'Settings';

        } );

        this.buttons.settingsExit = this.pane.addButton( {
            title: "Back to menu",
            hidden: true
        } );
        this.buttons.settingsExit.on( 'click', () => {
            console.log( 'Settings closed' );

            // Show all the other buttons.
            this.buttons.scores.hidden = l.mode !== 'home' ? false : true;
            this.buttons.exit_game.hidden = l.mode !== 'home' ? false : true;
            this.buttons.player_one.hidden = l.mode !== 'home' ? true : false;
            this.buttons.player_two.hidden = l.mode !== 'home' ? true : false;
            this.buttons.multi_player.hidden = l.mode !== 'home' ? true : false;
            this.buttons.settings.hidden = false;
            this.buttons.help.hidden = l.mode !== 'home' ? true : false;

            // Hide the settings area.
            this.buttons.settingsExit.hidden = true;
            this.settings.debug.hidden = true;
            this.settings.fast.hidden = true;
            this.settings.skipintro.hidden = true;

            // Restore the main menu title.
            this.pane.title = this.default_title;
        } );

        this.settings.debug = this.pane.addBinding( l.config.settings, 'debug', {
            label: 'Debugging mode',
            hidden: true
        } );

        this.settings.debug.on( 'change', () => {
            l.scenograph.modes.debugging.toggle();
            l.config.save_settings();
        } );

        this.settings.fast = this.pane.addBinding( l.config.settings, 'fast', {
            label: 'Performance mode',
            disabled: l.config.client_info.gpu.tier < 3,
            hidden: true
        } );

        this.settings.fast.on( 'change', () => {
            l.scenograph.modes.fast.toggle();
            l.config.save_settings();
        } );

        this.settings.skipintro = this.pane.addBinding( l.config.settings, 'skipintro', {
            label: 'Skip title sequence',
            hidden: true
        } );

        this.settings.skipintro.on( 'change', () => {
            l.config.save_settings();
        } );

        this.buttons.help = this.pane.addButton( {
            title: 'Help',
        } );
        this.buttons.help.on( 'click', () => {
            l.ui.help.show();
        } );

        return this;
    }

    /**
     * Leave the title screen and keep this pane collapsed as the in-session menu.
     */
    enterSession() {
        this.buttons.player_one.hidden = true;
        this.buttons.player_two.hidden = true;
        this.buttons.multi_player.hidden = true;

        this.pane.expanded = false;
        this.pane.title = "Menu";

        this.buttons.exit_game.hidden = false;
        this.buttons.scores.hidden = false;

        if ( l.ui.game_menu && l.ui.game_menu.title_screen ) {
            l.ui.game_menu.title_screen.hide();
        }
    }

    /**
     * Home again: title screen in front, this pane stays minimised.
     */
    returnHome() {
        this.buttons.player_one.hidden = false;
        this.buttons.player_two.hidden = false;
        this.buttons.multi_player.hidden = false;

        this.buttons.exit_game.hidden = true;
        this.buttons.scores.hidden = true;

        this.pane.expanded = false;
        this.pane.title = this.default_title;

        if ( l.ui.game_menu && l.ui.game_menu.title_screen ) {
            l.ui.game_menu.title_screen.show();
        }
    }

}
