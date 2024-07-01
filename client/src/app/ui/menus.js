/**
 * Menus
 */

import { Pane } from 'tweakpane';
import Debugging_Tools from './menus/debugging_tools';
import Main_Menu from './menus/main_menu';
import Object_Editor from './menus/object_editor';
import Scene_Overview from './menus/scene_overview';

export default class Menus {

    main_menu;

    // Debugging Tools (set by debugging mode)
    debugging_tools;
    object_editor;
    scene_overview;

    constructor() {

        // Main menu
        // Position: Top right.
        this.main_menu = new Main_Menu();

    }

    debug_on() {

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

    debug_off(){

        // Dispose of the panes and then delete the controls so they're fresh if reactivated.
        this.debugging_tools.pane.dispose();
        this.debugging_tools = false;
        this.object_editor.pane.dispose();
        this.object_editor = false;
        this.scene_overview.pane.dispose();
        this.scene_overview = false;

    }

}