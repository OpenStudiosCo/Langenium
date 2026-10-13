/**
 * Game menu
 */

import Title_Screen from '@/ui/game_menu/title_screen';

export default class Game_Menu {

    title_screen;

    constructor() {

        // Home-mode front menu. Position: left.
        this.title_screen = new Title_Screen();

    }

}
