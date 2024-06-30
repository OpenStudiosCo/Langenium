/**
 * Menus
 */

import { Pane } from 'tweakpane';
import Main_Menu from './menus/main_menu';
import Object_Editor from './menus/object_editor';
import Scene_Overview from './menus/scene_overview';

export default class Menus {
    constructor() {

        this.main_menu = new Main_Menu();

        if ( window.l.config.debug ) {
            this.object_editor = new Object_Editor();
            this.scene_overview = new Scene_Overview();
        }
    }

}
