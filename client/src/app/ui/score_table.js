/**
 * Score Table
 */

export default class ScoreTable {

    containerSelector;

    constructor() {

        this.containerSelector = '#score_table';

    }

    /**
     * Activate Score Table
     * 
     * Adds itself to the ui classes update queue.
     */
    show() {
        document.querySelector( l.ui.score_table.containerSelector ).classList.add( 'active' );
    }

    /**
     * Deactivate Score Table
     */
    hide() {
        document.querySelector( l.ui.score_table.containerSelector ).classList.remove( 'active' );
    }

    update() {
        // update scores in the table.
    }

}
