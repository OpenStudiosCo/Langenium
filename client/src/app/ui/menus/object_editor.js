/**
 * Object Editor
 */

import { Pane } from 'tweakpane';

export default class Object_Editor {
    constructor() {
        this.pane = new Pane( {
            title: 'Object Editor',
            container: document.getElementById( 'object_editor' ),
            expanded: true
        } );
        return this.pane;
    }
}
