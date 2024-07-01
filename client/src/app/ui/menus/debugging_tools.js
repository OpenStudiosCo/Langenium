/**
 * Debugging Tools
 */

import { Pane } from 'tweakpane';

export default class Debugging_Tools {
    constructor() {
        this.pane = new Pane( {
            title: 'Debugging Tools',
            container: document.getElementById( 'debugging_tools' ),
            expanded: true
        } );

        if ( l.config.settings.debug ) {
            const debugging = this.pane.addFolder( {
                title: 'Debugging',
                expanded: true,
            } );

            const stats = debugging.addFolder( {
                title: 'Stats',
                expanded: false,
            } );

            stats.addBinding( l.current_scene.stats, 'fps', {
                readonly: true,
                view: 'graph',
                interval: 200,
                min: 0,
                max: 60
            } );

            const latency = stats.addBinding( l.multiplayer, 'latency', {
                readonly: true,
                view: 'graph',
                interval: 200
            } );

            const shipState = debugging.addFolder( {
                title: 'Ship Controls State',
                expanded: false,
            } );

            shipState.addBinding( l.current_scene.scene_objects.ship.state.controls, 'throttleUp', {
                readonly: true,
                interval: 200
            } )
            shipState.addBinding( l.current_scene.scene_objects.ship.state.controls, 'throttleDown', {
                readonly: true,
                interval: 200
            } )
            shipState.addBinding( l.current_scene.scene_objects.ship.state.controls, 'moveLeft', {
                readonly: true,
                interval: 200
            } )
            shipState.addBinding( l.current_scene.scene_objects.ship.state.controls, 'moveRight', {
                readonly: true,
                interval: 200
            } )

            if ( l.controls.touch ) {

                const touchControlStats = debugging.addFolder( {
                    title: 'Touch Controls State',
                    expanded: false,
                } );

                touchControlStats.addBinding( l.controls.touch.controls, 'moveForward', {
                    readonly: true,
                    interval: 200
                } )
                touchControlStats.addBinding( l.controls.touch.controls, 'moveBackward', {
                    readonly: true,
                    interval: 200
                } )
                touchControlStats.addBinding( l.controls.touch.controls, 'moveLeft', {
                    readonly: true,
                    interval: 200
                } )
                touchControlStats.addBinding( l.controls.touch.controls, 'moveRight', {
                    readonly: true,
                    interval: 200
                } )
                touchControlStats.addBinding( l.controls.touch.controls, 'moveUp', {
                    readonly: true,
                    interval: 200
                } )
                touchControlStats.addBinding( l.controls.touch.controls, 'moveDown', {
                    readonly: true,
                    interval: 200
                } )
            }
        }

        return this;
    }
}
