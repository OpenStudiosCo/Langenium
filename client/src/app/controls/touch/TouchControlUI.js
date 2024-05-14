import * as THREE from 'three'
import * as utils from './utils.js'
import RotationPad from './RotationPad.js'
import MovementPad from './MovementPad.js'
import SliderStick from './SliderStick.js'

/**
 * Adapted from https://github.com/mese79/TouchControls
 */


class TouchControlUI {
    rotationPad
    movementPad
    sliderStick
    container
    config
    fpsBody
    mouse
    enabled = true
    #rotationMatrices
    #cameraHolder
    #maxPitch
    #isRightMouseDown = false
    moveUp = false
    moveDown = false
    moveForward = false
    moveBackward = false
    moveLeft = false
    moveRight = false
    
    constructor(container, camera, options) {
        this.container = container
        this.config = Object.assign({
            delta: 0.75,            // coefficient of movement
            moveSpeed: 0.5,         // speed of movement
            rotationSpeed: 0.002,   // coefficient of rotation
            maxPitch: 55,           // max camera pitch angle
        }, options)

        this.#rotationMatrices = []
        this.#maxPitch = this.config.maxPitch * Math.PI / 180
        this.mouse = new THREE.Vector2()

        this.#cameraHolder = new THREE.Object3D()
        this.#cameraHolder.name = 'cameraHolder'
        //this.#cameraHolder.add(camera)

        this.fpsBody = new THREE.Object3D()
        this.fpsBody.add(this.#cameraHolder)

        // Creating rotation pad
        this.rotationPad = new RotationPad(container)
        this.rotationPad.padElement.addEventListener('YawPitch', (event) =>{
            let rotation = this.#calculateCameraRotation(event.detail.deltaX, event.detail.deltaY)
            this.setRotation(rotation.rx, rotation.ry)
        })

        // Creating rotation pad
        this.sliderStick = new SliderStick(container)
        this.sliderStick.padElement.addEventListener('move', (event) => {

            if (event.detail.deltaY == event.detail.middle) {
                this.moveUp = this.moveDown = false
            } else {
                if (event.detail.deltaY > event.detail.middle) {
                    this.moveUp = true
                    this.moveDown = false
                }
                else if (event.detail.deltaY < event.detail.middle) {
                    this.moveUp = false
                    this.moveDown = true
                }
            }
        })
        this.sliderStick.padElement.addEventListener('stopMove', (event) => {
            this.moveUp = this.moveDown = false
        })

        // Creating movement pad
        this.movementPad = new MovementPad(container)
        this.movementPad.padElement.addEventListener('move', (event) => {

            if (event.detail.deltaY == event.detail.middle) {
                this.moveForward = this.moveBackward = false
            } else {
                if (event.detail.deltaY > event.detail.middle) {
                    this.moveForward = true
                    this.moveBackward = false
                }
                else if (event.detail.deltaY < event.detail.middle) {
                    this.moveForward = false
                    this.moveBackward = true
                }
            }

            if (event.detail.deltaX == event.detail.middle) {
                this.moveRight = this.moveLeft = false
            } else {
                if (event.detail.deltaX < event.detail.middle) {
                    this.moveRight = true
                    this.moveLeft = false
                }
                else if (event.detail.deltaX > event.detail.middle) {
                    this.moveRight = false
                    this.moveLeft = true
                }
            }
        })
        this.movementPad.padElement.addEventListener('stopMove', (event) => {
            this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false
        })

        this.container.addEventListener('contextmenu', (event) => {event.preventDefault()})
        this.container.addEventListener('mousedown', (event) => this.onMouseDown(event))
        this.container.addEventListener('mouseup', (event) => this.onMouseUp(event))

        document.addEventListener('mousemove', (event) => this.onMouseMove(event))
        document.addEventListener('mouseout', (event) => this.onMouseOut(event))

        this.#prepareRotationMatrices()
    }

    //
    // Events
    //
    onMouseDown(event) {
        if (this.enabled && event.button === 2) {
            this.#isRightMouseDown = true
            event.preventDefault()
            event.stopPropagation()
        }
    }

    onMouseUp(event) {
        if (this.enabled && event.button === 2) {
            this.#isRightMouseDown = false
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        if (!this.enabled || !this.#isRightMouseDown)
            return

        let movementX = event.movementX || 0
        let movementY = event.movementY || 0
        let rotation = this.#calculateCameraRotation(-1 * movementX, -1 * movementY)

        // console.log(this.mouse, '\n', movementX, rotation)
        this.setRotation(rotation.rx, rotation.ry)
    }

    onMouseOut(e) {
        this.#isRightMouseDown = false
        // this.stopMouseMoving()
    }

    //
    // Private functions
    //
    #prepareRotationMatrices() {
        let rotationMatrixF = new THREE.Matrix4()
        rotationMatrixF.makeRotationY(0)
        this.#rotationMatrices.push(rotationMatrixF)  // forward direction

        let rotationMatrixB = new THREE.Matrix4()
        rotationMatrixB.makeRotationY(180 * Math.PI / 180)
        this.#rotationMatrices.push(rotationMatrixB)  // backward direction

        let rotationMatrixL = new THREE.Matrix4()
        rotationMatrixL.makeRotationY(90 * Math.PI / 180)
        this.#rotationMatrices.push(rotationMatrixL)  // left direction

        let rotationMatrixR = new THREE.Matrix4()
        rotationMatrixR.makeRotationY((360 - 90) * Math.PI / 180)
        this.#rotationMatrices.push(rotationMatrixR)  // right direction
    }

    #calculateCameraRotation(dx, dy, factor) {
        let rFactor = factor ? factor : this.config.rotationSpeed
        let ry = this.fpsBody.rotation.y - (dx * rFactor)
        let rx = this.#cameraHolder.rotation.x - (dy * rFactor)
        rx = Math.max(-this.#maxPitch, Math.min(this.#maxPitch, rx))

        return {
            rx: rx,
            ry: ry
        }
    }
    
    setRotation(x, y) {
        if (x !== null)
            window.l.current_scene.camera.rotation.x += x

        if (y !== null)
            window.l.current_scene.camera.rotation.y += y
    }

}


export default TouchControlUI
