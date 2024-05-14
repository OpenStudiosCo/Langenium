/**
 * Main menu
 */

import {Pane} from 'tweakpane';

export default class Main_Menu {
    constructor() {
        /**
         * Tweakpane Pane UI
         */
        this.pane = new Pane({
            title: "Langenium v" + window.l.version,
            expanded: true
        });

        if ( window.l.current_scene.debug ) {
            const debugging = this.pane.addFolder({
                title: 'Debugging',
            });

            const stats = debugging.addFolder({
                title: 'Stats',
                expanded: false,
            });

            stats.addBinding(window.l.current_scene.stats, 'fps', {
                readonly: true,
                view: 'graph',
                interval: 200,
                min: 0,
                max: 60
            });

            const latency = stats.addBinding(window.l.multiplayer, 'latency', {
                readonly: true,
                view: 'graph',
                interval: 200
            });

            const shipState = debugging.addFolder({
                title: 'Ship State',
            });

            shipState.addBinding(window.l.current_scene.scene_objects.ship.state.controls, 'throttleUp', {
                readonly: true,
                interval: 200
            })
            shipState.addBinding(window.l.current_scene.scene_objects.ship.state.controls, 'throttleDown', {
                readonly: true,
                interval: 200
            })
            shipState.addBinding(window.l.current_scene.scene_objects.ship.state.controls, 'moveLeft', {
                readonly: true,
                interval: 200
            })
            shipState.addBinding(window.l.current_scene.scene_objects.ship.state.controls, 'moveRight', {
                readonly: true,
                interval: 200
            })
    
            const touchControlStats = debugging.addFolder({
                title: 'Touch Controls State',
            });
    
            touchControlStats.addBinding(window.l.controls.touch.controls, 'moveForward', {
                readonly: true,
                interval: 200
            })
            touchControlStats.addBinding(window.l.controls.touch.controls, 'moveBackward', {
                readonly: true,
                interval: 200
            })
            touchControlStats.addBinding(window.l.controls.touch.controls, 'moveLeft', {
                readonly: true,
                interval: 200
            })
            touchControlStats.addBinding(window.l.controls.touch.controls, 'moveRight', {
                readonly: true,
                interval: 200
            })
        }

        const exit_game = this.pane.addButton({
            title: 'Exit to Main Menu',
            hidden: true
        });
        exit_game.on('click', () => {
            console.log('Exit to Main Menu, closing game session');
            window.l.controls.deactivate()
            window.l.current_scene.ui.hide_flight_instruments();

            // Show game mode buttons.
            single_player.hidden = false;
            multi_player.hidden = false;

            // Hide game exit button to return to main menu.
            exit_game.hidden = true;

            if (window.l.multiplayer.connected) {
                window.l.multiplayer.disconnect();
            }

        });

        const single_player = this.pane.addButton({
            title: 'Single Player',
        });
        single_player.on('click', () => {
            console.log('Single player launched');
            window.l.controls.activate();
            window.l.current_scene.ui.show_flight_instruments();

            // Hide game mode buttons.
            single_player.hidden = true;
            multi_player.hidden = true;

            // Show game exit button to return to main menu.
            exit_game.hidden = false;
        });

        const multi_player = this.pane.addButton({
            title: 'Multi Player',
        });
        multi_player.on('click', () => {
            console.log('Multi player launched');
            window.l.controls.activate();
            window.l.current_scene.ui.show_flight_instruments();

            // Hide game mode buttons.
            single_player.hidden = true;
            multi_player.hidden = true;

            // Show game exit button to return to main menu.
            exit_game.hidden = false;

            let serverLocation = window.l.env =='Dev' ? 'lcl.langenium.com:8090' : 'test.langenium.com:42069' ;

            window.l.multiplayer.connect('//' + serverLocation);

        });

        

        const settings = this.pane.addButton({
            title: 'Settings',
        });
        settings.on('click', () => {
            console.log('Settings launched');
        });

        const help = this.pane.addButton({
            title: 'Help',
        });
        help.on('click', () => {
            console.log('Help launched');
        });

        

        


        

        

        return this.pane;
    }

}
