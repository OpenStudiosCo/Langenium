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
            expanded: true
        } );

        this.buttons.exit_game = this.pane.addButton( {
            title: 'Exit game',
            hidden: true
        } );
        this.buttons.exit_game.on( 'click', () => {
            console.log( 'Exit to Main Menu, closing game session' );
            l.scenograph.controls.deactivate()
            l.scenograph.overlays.deactivate()
            //l.ui.hide_flight_instruments();

            // Show game mode buttons.
            this.buttons.single_player.hidden = false;
            this.buttons.multi_player.hidden = false;

            // Hide game exit button to return to main menu.
            this.buttons.exit_game.hidden = true;

            // Hide the score table button.
            this.buttons.scores.hidden = true;

            // Restore the main menu title.
            this.pane.title = this.default_title;

            if ( l.scenograph.modes.multiplayer.connected ) {
                l.scenograph.modes.multiplayer.disconnect();
            }

            // Set client mode.
            l.mode = 'home';
        } );

        this.buttons.scores = this.pane.addButton( {
            title: 'Scores',
            hidden: true
        } );

        this.buttons.scores.on( 'click', () => {
            l.ui.score_table.show();
        });

        this.buttons.single_player = this.pane.addButton( {
            title: 'Single Player',
        } );
        this.buttons.single_player.on( 'click', () => {
            console.log( 'Single player launched' );

            // Start controls.
            l.scenograph.controls.activate();

            // Start overlays.
            l.scenograph.overlays.activate();

            //l.ui.show_flight_instruments();

            // Hide game mode buttons.
            this.buttons.single_player.hidden = true;
            this.buttons.multi_player.hidden = true;

            // Hide main menu and change it's title
            this.pane.expanded = false;
            this.pane.title = "Menu";

            // Show game exit button to return to main menu.
            this.buttons.exit_game.hidden = false;

            // Show game scores button
            this.buttons.scores.hidden = false;

            // Set client mode.
            l.mode = 'single_player';
        } );

        this.buttons.multi_player = this.pane.addButton( {
            title: 'Multi Player',
            disabled: true // @todo: v7 Restore multiplayer and server tracking of scene objects.
        } );
        this.buttons.multi_player.on( 'click', () => {
            console.log( 'Multi player launched' );

            l.scenograph.controls.activate();

            //l.ui.show_flight_instruments();

            // Hide game mode buttons.
            this.buttons.single_player.hidden = true;
            this.buttons.multi_player.hidden = true;

            // Hide main menu
            this.pane.expanded = false;
            this.pane.title = "Menu";

            // Show game exit button to return to main menu.
            this.buttons.exit_game.hidden = false;

            // Show game scores button
            this.buttons.scores.hidden = false;

            let serverLocation = l.env == 'Dev' ? 'lcl.langenium.com:8090' : 'test.langenium.com:42069';

            l.scenograph.modes.multiplayer.connect( '//' + serverLocation );

            // Set client mode.
            l.mode = 'multi_player';
        } );

        this.buttons.settings = this.pane.addButton( {
            title: 'Settings',
        } );
        this.buttons.settings.on( 'click', () => {
            console.log( 'Settings launched' );

            // Hide all the other buttons.
            this.buttons.scores.hidden = true;
            this.buttons.exit_game.hidden = true;
            this.buttons.single_player.hidden = true;
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
            this.buttons.single_player.hidden = l.mode !== 'home' ? true : false;
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

}