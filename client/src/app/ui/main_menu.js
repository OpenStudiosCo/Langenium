/**
 * Main menu
 */
export default class Main_Menu {
    constructor() {
        /**
         * Tweakpane Pane UI
         */
        this.pane = new Tweakpane.Pane({
            title: "Langenium v" + window.l.version,
            expanded: true
        });

        
        const single_player = this.pane.addButton({
            title: 'Single Player',
        });
        single_player.on('click', () => {
            console.log('Single player launched');
        });

        const multi_player = this.pane.addButton({
            title: 'Multi Player',
        });
        multi_player.on('click', () => {
            console.log('Multi player launched');
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
