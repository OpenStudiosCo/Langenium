/**
 * Debugging Tools
 */

import { Pane } from 'tweakpane';

export default class Debugging_Tools {
    pane;
    settings;
    tabs;

    constructor() {
        this.settings = {};

        this.pane = new Pane( {
            title: 'Debugging Tools',
            container: document.getElementById( 'debugging_tools' ),
            expanded: true
        } );

        const tab = this.pane.addTab( {
            pages: [
                { title: 'Scene Controls' },
                { title: 'Performance' },
                { title: 'State' },
            ],
        } );

        // Tab: Scene Controls
        tab.pages[0].addBinding( l, 'mode', {
            label: 'Mode',
            readonly: true,
            interval: 200
        } )

        this.settings.active_camera = tab.pages[ 0 ].addBlade( {
            view: 'list',
            label: 'Active Camera',
            options: [
                { text: 'Player', value: 'player' },
                { text: 'Orbit', value: 'orbit' },
            ],
            value: l.config.settings.debug ? 'orbit' : 'player',
        } );

        this.settings.active_camera.on( 'change', () => {
            l.scenograph.cameras.setActive( this.settings.active_camera.value );
        } );

        // Tab: Performance
        tab.pages[ 1 ].addBinding( l.current_scene.stats, 'fps', {
            readonly: true,
            view: 'graph',
            interval: 200,
            min: 0,
            max: 60
        } );

        tab.pages[ 1 ].addBinding( l.scenograph.modes.multiplayer, 'latency', {
            readonly: true,
            view: 'graph',
            interval: 200
        } );

        // Tab: State
        const engineState = tab.pages[ 2 ].addFolder( {
            title: 'Engine State',
            expanded: false,
        } );

        const shipState = tab.pages[ 2 ].addFolder( {
            title: 'Ship Controls',
            expanded: false,
        } );

        shipState.addBinding( l.current_scene.objects.player.state.controls, 'throttleUp', {
            readonly: true,
            interval: 200
        } )
        shipState.addBinding( l.current_scene.objects.player.state.controls, 'throttleDown', {
            readonly: true,
            interval: 200
        } )
        shipState.addBinding( l.current_scene.objects.player.state.controls, 'moveLeft', {
            readonly: true,
            interval: 200
        } )
        shipState.addBinding( l.current_scene.objects.player.state.controls, 'moveRight', {
            readonly: true,
            interval: 200
        } )

        if ( l.scenograph.controls.touch ) {

            const touchControlStats = tab.pages[ 2 ].addFolder( {
                title: 'Touch Controls',
                expanded: false,
            } );

            touchControlStats.addBinding( l.scenograph.controls.touch.controls, 'moveForward', {
                readonly: true,
                interval: 200
            } )
            touchControlStats.addBinding( l.scenograph.controls.touch.controls, 'moveBackward', {
                readonly: true,
                interval: 200
            } )
            touchControlStats.addBinding( l.scenograph.controls.touch.controls, 'moveLeft', {
                readonly: true,
                interval: 200
            } )
            touchControlStats.addBinding( l.scenograph.controls.touch.controls, 'moveRight', {
                readonly: true,
                interval: 200
            } )
            touchControlStats.addBinding( l.scenograph.controls.touch.controls, 'moveUp', {
                readonly: true,
                interval: 200
            } )
            touchControlStats.addBinding( l.scenograph.controls.touch.controls, 'moveDown', {
                readonly: true,
                interval: 200
            } )
        }

        return this;
    }
}
