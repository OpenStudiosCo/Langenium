import MovementPad from './TouchControlUI/MovementPad.js'
import SliderStick from './TouchControlUI/SliderStick.js'

/**
 * Adapted from https://github.com/mese79/TouchControls
 */


class TouchControlUI {
    movementPad
    sliderStick
    container
    config
    enabled = true
    moveUp = false
    moveDown = false
    moveForward = false
    moveBackward = false
    moveLeft = false
    moveRight = false

    constructor( container, camera, options ) {
        this.container = container
        this.config = Object.assign( {
            delta: 0.75,            // coefficient of movement
            moveSpeed: 0.5,         // speed of movement
        }, options )

        this.sliderStick = new SliderStick( container )
        this.sliderStick.stickElement.addEventListener( 'move', ( event ) => {

            if ( event.detail.deltaY == event.detail.middle ) {
                this.moveUp = this.moveDown = false
            } else {
                if ( event.detail.deltaY > event.detail.middle ) {
                    this.moveUp = true
                    this.moveDown = false
                }
                else if ( event.detail.deltaY < event.detail.middle ) {
                    this.moveUp = false
                    this.moveDown = true
                }
            }
        } )
        this.sliderStick.stickElement.addEventListener( 'stopMove', ( event ) => {
            this.moveUp = this.moveDown = false
        } )

        // Creating movement pad
        this.movementPad = new MovementPad( container )
        this.movementPad.padElement.addEventListener( 'move', ( event ) => {

            let yOffset = 0;
            if ( Math.abs( event.detail.deltaX ) > 1 ) {
                yOffset = 1.2;
            }

            if (
                event.detail.deltaY == event.detail.middle ||
                Math.abs( event.detail.deltaY ) < yOffset
            ) {
                this.moveForward = this.moveBackward = false
            } else {
                if ( event.detail.deltaY > event.detail.middle ) {
                    this.moveForward = true
                    this.moveBackward = false
                }
                else if ( event.detail.deltaY < event.detail.middle ) {
                    this.moveForward = false
                    this.moveBackward = true
                }
            }

            let xOffset = 0;
            if ( Math.abs( event.detail.deltaY ) > 1 ) {
                xOffset = 1.2;
            }

            if (
                event.detail.deltaX == event.detail.middle ||
                Math.abs( event.detail.deltaX ) < xOffset
            ) {
                this.moveRight = this.moveLeft = false
            } else {
                if ( event.detail.deltaX < event.detail.middle ) {
                    this.moveRight = true
                    this.moveLeft = false
                }
                else if ( event.detail.deltaX > event.detail.middle ) {
                    this.moveRight = false
                    this.moveLeft = true
                }
            }
        } )
        this.movementPad.padElement.addEventListener( 'stopMove', ( event ) => {
            this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false
        } )
    }

}


export default TouchControlUI
