/**
 * Scene Overview window
 */
import { Pane } from 'tweakpane';

export default class Scene_Overview {
    container;

    pane_content;

    row_template;

    table_template;

    constructor() {
        this.container = document.getElementById( 'scene_overview' );
        this.container.style.display = 'block';
        
        this.pane = new Pane( {
            title: 'Scene Overview',
            container: this.container,
            expanded: true
        } );

        this.pane_content = this.container.querySelector('.tp-rotv_c');

        this.table_template = document.getElementById( 'scene_overview_table' ).innerHTML;
        this.row_template = document.getElementById( 'scene_overview_row' ).innerHTML;

        this.buildTable();

        return this;
    }

    buildTable() {

        this.pane_content.innerHTML = JSON.parse( JSON.stringify( this.table_template ) );

        let table_body = this.pane_content.querySelector( 'tbody' );
        l.current_scene.scene.children.forEach( ( object ) => {
            let row = JSON.parse( JSON.stringify( this.row_template ) );

            row = row
                .replaceAll( '$id', object.id )    
                .replaceAll( '$name', object.name )
                .replaceAll( '$type', object.type );

            table_body.innerHTML += row;
        } )

    }

    update() {
        //l.ui.menus.scene_overview.buildTable();
    }

    view() {
        
    }
}
