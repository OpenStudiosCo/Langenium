/**
 * Menus
 */

import { Pane } from 'tweakpane';
import Debugging_Tools from './menus/debugging_tools';
import Main_Menu from './menus/main_menu';
import Object_Editor from './menus/object_editor';
import Scene_Overview from './menus/scene_overview';

export default class Menus {
    constructor() {

        // Main menu
        // Position: Top right.
        this.main_menu = new Main_Menu();

        // Show debugging menus if debugging is on.
        if ( window.l.config.debug ) {

            // Debugging tools
            // Position: Bottom right.
            this.debugging_tools = new Debugging_Tools();

            // Object editor
            // Position: Bottom left.
            this.object_editor = new Object_Editor();

            // Scene controls
            // Position: Top left.
            this.scene_overview = new Scene_Overview();
        }
    }

}
