/**
 * Game menu
 */

import Title_Screen from '@/ui/game_menu/title_screen';
import InGame from '@/ui/game_menu/in_game';

export default class Game_Menu {

    title_screen;
    in_game;

    constructor() {

        // Session chrome and future in-game menu while playing.
        this.in_game = new InGame();

        // Home-mode front menu. Position: left.
        this.title_screen = new Title_Screen();

        // Title starts active; hide session chrome after both exist.
        this.in_game.setExitVisible( false );

    }

}
