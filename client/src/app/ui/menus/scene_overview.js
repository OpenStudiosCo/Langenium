/**
 * Scene Overview
 */

import { Pane } from 'tweakpane';

export default class Scene_Overview {
    constructor() {
        this.pane = new Pane( {
            title: 'Scene Overview',
            container: document.getElementById( 'scene_overview' ),
            expanded: true
        } );
        return this.pane;
    }
}
