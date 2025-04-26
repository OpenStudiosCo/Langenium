/**
 * Help screen
 */

export default class Help {

    containerSelector;

    constructor() {

        this.containerSelector = '#help';
        this.container = document.querySelector( this.containerSelector );

    }

    /**
     * Activate Help
     * 
     * Adds itself to the ui classes update queue.
     */
    show() {
        l.ui.help.container.classList.add( 'active' );
    }

    /**
     * Deactivate Help
     */
    hide() {
        l.ui.help.container.classList.remove( 'active' );
    }

}
