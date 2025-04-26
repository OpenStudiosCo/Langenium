/**
 * Score Table
 */

export default class ScoreTable {

    containerSelector;

    constructor() {

        this.containerSelector = '#score_table';
        this.container = document.querySelector( this.containerSelector );

        this.rowContainerSelector = this.containerSelector + ' tbody';
        this.rowContainer = document.querySelector( this.rowContainerSelector );

    }

    /**
     * Activate Score Table
     * 
     * Adds itself to the ui classes update queue.
     */
    show() {
        l.ui.score_table.container.classList.add( 'active' );
    }

    /**
     * Deactivate Score Table
     */
    hide() {
        l.ui.score_table.container.classList.remove( 'active' );
    }

    update() {
        let scores = l.current_scene.scene.children.filter( scene_obj => 
            scene_obj.userData.hasOwnProperty( 'object' ) &&
            scene_obj.userData.object.hasOwnProperty( 'score' )
        );
        l.ui.score_table.rowContainer.innerHTML = '';
        scores.forEach( aircraftMesh => {
            
            let row = '<tr>';

            // ID.
            row += '<td>' + aircraftMesh.id + '</td>';
            
            // Vehicle.
            row += '<td>' + aircraftMesh.name + '</td>';
            
            // Kills.
            row += '<td>' + aircraftMesh.userData.object.score.kills + '</td>';

            // Deaths.
            row += '<td>' + aircraftMesh.userData.object.score.deaths + '</td>';


            row += '</tr>';
            l.ui.score_table.rowContainer.innerHTML += row;
        } );

    }

}
