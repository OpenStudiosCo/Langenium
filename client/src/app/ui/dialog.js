/**
 * @name            Dialog
 * @description     Typed lines for welcome, NPC speech, and narration
 * @namespace       l.ui.dialog
 * @memberof        l.ui
 * @global
 */

export default class Dialog {

    /**
     * Container CSS selector statement.
     * @type {string}
     */
    containerSelector;

    /**
     * Container HTML Element.
     * @type {HTMLElement}
     */
    container;

    // Current line. { text, speaker, actions }
    line;

    // Lines still waiting to play.
    queue;

    timer;

    typing;

    constructor() {

        this.containerSelector = '#game_dialog';
        this.container = document.querySelector( this.containerSelector );

        this.label = this.container.querySelector( '.dialog_label' );
        this.speaker = this.container.querySelector( '.dialog_speaker' );
        this.text = this.container.querySelector( '.dialog_line' );
        this.actions = this.container.querySelector( '.dialog_actions_row' );

        this.timer = 0;
        this.queue = [];
        this.line = null;
        this.owner = null;
        this.typing = false;

        this.container.addEventListener( 'click', ( event ) => {
            if ( this.typing ) {
                window.clearTimeout( this.timer );
                this.complete();
                return;
            }

            if ( event.target.closest( '[data-action="close-dialog"]' ) ) {
                this.dismiss();
                return;
            }

            const button = event.target.closest( '[data-dialog-action]' );
            if ( button ) {
                this.choose( Number( button.dataset.dialogAction ) );
                return;
            }

            if ( !event.target.closest( '.dialog_frame' ) ) {
                this.dismiss();
                return;
            }

            this.advance();
        } );

        document.addEventListener( 'keydown', ( event ) => {
            if ( this.container.hidden || !this.line ) {
                return;
            }

            const actions = this.line.actions || [];
            const index = actions.findIndex( ( action ) => this.keyMatches( action.key, event ) );
            if ( index !== -1 ) {
                event.preventDefault();
                this.choose( index );
                return;
            }

            if ( event.key === 'Escape' ) {
                event.preventDefault();
                this.dismiss();
            }
        } );

    }

    /**
     * Play one line.
     *
     * @param {object} line text, optional speaker, optional actions
     */
    show( line ) {
        this.play( [ line ] );
    }

    /**
     * Play lines in order.
     *
     * A click while the line is typing finishes it. The next click dismisses or continues.
     *
     * @param {object[]} lines
     */
    play( lines ) {
        this.queue = lines.slice();
        this.openNext();
    }

    /**
     * Close the dialog and drop any lines still queued.
     */
    hide() {
        this.queue = [];
        this.close();
    }

    openNext() {
        window.clearTimeout( this.timer );

        const line = this.queue.shift();
        if ( !line ) {
            this.close();
            return;
        }

        this.line = line;
        this.owner = line.owner || null;
        this.container.hidden = false;
        this.container.classList.toggle( 'dialog-passive', line.modal === false );
        this.container.classList.remove( 'dialog-written' );
        this.label.textContent = line.speaker ? line.speaker + '. ' + line.text : line.text;

        if ( line.speaker ) {
            this.speaker.hidden = false;
            this.speaker.textContent = line.speaker;
        }
        else {
            this.speaker.hidden = true;
            this.speaker.textContent = '';
        }

        this.renderActions( line.actions || [] );
        this.text.textContent = '';

        const reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
        if ( reduce || line.instant ) {
            this.complete();
            return;
        }

        this.typing = true;
        let index = 0;
        const step = () => {
            index += 1;
            this.text.textContent = line.text.slice( 0, index );
            if ( index < line.text.length ) {
                this.timer = window.setTimeout( step, 32 );
            }
            else {
                this.complete();
            }
        };

        this.timer = window.setTimeout( step, 220 );
    }

    complete() {
        this.typing = false;
        this.text.textContent = this.line ? this.line.text : '';
        this.container.classList.add( 'dialog-written' );

        const first = this.actions.querySelector( 'button' );
        if ( first ) {
            first.focus();
        }
    }

    advance() {
        if ( this.typing ) {
            window.clearTimeout( this.timer );
            this.complete();
            return;
        }

        if ( this.line && this.line.actions && this.line.actions.length ) {
            return;
        }

        this.openNext();
    }

    choose( index ) {
        const action = this.line && this.line.actions && this.line.actions[ index ];
        this.queue = [];
        this.close();
        if ( action && action.run ) {
            action.run();
        }
    }

    /**
     * True while a line is on screen.
     */
    isShowing() {
        return !!this.container && !this.container.hidden;
    }

    dismiss() {
        const line = this.line;
        this.queue = [];
        this.close();
        if ( line && line.onDismiss ) {
            line.onDismiss();
        }
    }

    close() {
        window.clearTimeout( this.timer );
        this.typing = false;
        this.line = null;
        this.owner = null;
        this.container.hidden = true;
        this.container.classList.remove( 'dialog-written', 'dialog-passive' );
        this.clearActions();
    }

    renderActions( actions ) {
        this.clearActions();

        const close = this.actions.querySelector( '[data-action="close-dialog"]' );
        const showClose = !( this.line && this.line.close === false );
        if ( close ) {
            close.hidden = !showClose;
            close.style.display = showClose ? '' : 'none';
            close.querySelectorAll( 'kbd' ).forEach( ( key ) => {
                key.remove();
            } );

            if ( showClose && this.line && this.line.closeKey ) {
                const key = document.createElement( 'kbd' );
                key.textContent = this.line.closeKey;
                close.insertBefore( key, close.firstChild );
            }
        }

        actions.forEach( ( action, index ) => {
            const button = document.createElement( 'button' );
            button.type = 'button';
            button.className = 'dialog_action window_action';
            button.dataset.dialogAction = String( index );

            if ( action.key ) {
                const key = document.createElement( 'kbd' );
                key.textContent = action.key;
                button.appendChild( key );
            }

            button.appendChild( document.createTextNode( action.label ) );
            this.actions.insertBefore( button, close );
        } );
    }

    clearActions() {
        this.actions.querySelectorAll( '[data-dialog-action]' ).forEach( ( button ) => {
            button.remove();
        } );
    }

    /**
     * True when a button's key label matches this keydown.
     */
    keyMatches( label, event ) {
        if ( !label ) {
            return false;
        }

        const name = String( label ).toLowerCase();
        if ( name === 'esc' || name === 'escape' ) {
            return event.key === 'Escape';
        }

        return event.key.toLowerCase() === name;
    }

}
