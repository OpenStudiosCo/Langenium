/**
 * Keyboard Controls
 * 
 * Based on https://github.com/jeromeetienne/threex.keyboardstate
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

let MODIFIERS = [ 'shift', 'ctrl', 'alt', 'meta' ];
let ALIAS = {
    'left'    :  37,
    'up'      :  38,
    'right'   :  39,
    'down'    :  40,
    'space'   :  32,
    'pageup'  :  33,
    'pagedown':  34,
    'tab'     :  9,
    'escape'  :  27
};

export default class KeyboardControls {

    keyCodes;

    modifiers;

    constructor() {

        this.keyCodes = {};
        this.modifiers = {};

    }

    onKeyDown( event ) {
        l.scenograph.controls.keyboard.onKeyChange( event );
    }

    onKeyUp( event ) {
        l.scenograph.controls.keyboard.onKeyChange( event );
    }

    onKeyChange( event ) {
        // log to debug
        //console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

        // update this.keyCodes
        var keyCode = event.keyCode
        var pressed = event.type === 'keydown' ? true : false
        l.scenograph.controls.keyboard.keyCodes[ keyCode ] = pressed
        // update this.modifiers
        l.scenograph.controls.keyboard.modifiers[ 'shift' ] = event.shiftKey
        l.scenograph.controls.keyboard.modifiers[ 'ctrl' ] = event.ctrlKey
        l.scenograph.controls.keyboard.modifiers[ 'alt' ] = event.altKey
        l.scenograph.controls.keyboard.modifiers[ 'meta' ] = event.metaKey

    }

    pressed( keyDesc ) {
        var keys = keyDesc.split( "+" );

        for ( var i = 0; i < keys.length; i++ ) {
            var key = keys[ i ]
            var pressed = false
            if ( MODIFIERS.indexOf( key ) !== -1 ) {
                pressed = l.scenograph.controls.keyboard.modifiers[ key ];
            } else if ( Object.keys( ALIAS ).indexOf( key ) != -1 ) {
                pressed = l.scenograph.controls.keyboard.keyCodes[ ALIAS[ key ] ];
            } else {
                pressed = l.scenograph.controls.keyboard.keyCodes[ key.toUpperCase().charCodeAt( 0 ) ]
            }
            if ( !pressed ) return false;
        };
        return true;
    }

    eventMatches = function ( event, keyDesc ) {
        var aliases = ALIAS
        var aliasKeys = Object.keys( aliases )
        var keys = keyDesc.split( "+" )
        // log to debug
        // console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
        for ( var i = 0; i < keys.length; i++ ) {
            var key = keys[ i ];
            var pressed = false;
            if ( key === 'shift' ) {
                pressed = ( event.shiftKey ? true : false )
            } else if ( key === 'ctrl' ) {
                pressed = ( event.ctrlKey ? true : false )
            } else if ( key === 'alt' ) {
                pressed = ( event.altKey ? true : false )
            } else if ( key === 'meta' ) {
                pressed = ( event.metaKey ? true : false )
            } else if ( aliasKeys.indexOf( key ) !== -1 ) {
                pressed = ( event.keyCode === aliases[ key ] ? true : false );
            } else if ( event.keyCode === key.toUpperCase().charCodeAt( 0 ) ) {
                pressed = true;
            }
            if ( !pressed ) return false;
        }
        return true;
    }

}
