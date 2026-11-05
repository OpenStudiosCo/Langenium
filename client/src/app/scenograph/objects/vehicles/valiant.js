/**
 * Valiant Aircraft
 *
 * Provides a Valiant aircraft that can be added and updated in the game world.
 */

import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { brightenMaterial, proceduralMetalMaterial } from '@/scenograph/materials.js';
import Afterburner from '@/scenograph/effects/afterburner.js';
import ValiantObject from '#/game/src/objects/aircraft/valiant';

export default class Valiant {

    // Camera distance.
    camera_distance;

    // Default camera distance.
    default_camera_distance;

    // Ship Model (gltf)
    model;

    // The ship mesh.
    mesh;

    // Animation mixer.
    mixer;

    // Aircraft ready for input (intro sequence finished)
    ready;

    // Aircraft flight sim data like airspeed.
    state;

    // Object containing elements that drive the ships thruster.
    thruster;

    // TrailRenderer effect showing a trailing effect on the thruster.
    trail;

    // Short flame trail used at cruise speeds.
    cruiseTrail;

    // Soft shock-diamond rings along the thruster exhaust.
    afterburner;

    // Twin tilt-rotors (Cylinder / Cylinder001) and their articulation state.
    rotors;

    constructor( isDemo = false ) {
        this.default_camera_distance = -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;
        this.chaseLookAhead = 12;
        this._chaseLookAt = new THREE.Vector3();
        this._orbitPivotLocal = null;
        this._orbitPivotWorld = new THREE.Vector3();
        this._orbitBox = new THREE.Box3();
        this.afterburnerBlend = 0;
        this.trailAnchor = new THREE.Vector3();

        // Visual climb/dive pitch (radians), lerped in updateMesh.
        this.elevationPitch = 0;
        this.elevationPitchMax = 18 * Math.PI / 180;
        this.elevationPitchSmooth = 5;

        this.ready = false;

        this.demo = isDemo;

    }

    // Loads the ship model inc built-in animations
    async load() {


        this.model = await l.current_scene.loaders.gtlf.loadAsync( '/assets/models/mercenary4.glb' );

        let amount = l.config.settings.fast ? 5 : 2.5;

        this.model.scene.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;

                child.original_material = child.material.clone();

                let scale = 0.7;

                if ( child.name == 'Chassis' ) {
                    scale = 1.05;
                }

                if ( child.name != 'Fuselage' ) {

                    child.material = proceduralMetalMaterial( {
                        uniforms: {
                            scale         :  { value: scale },                                           // Scale
                            lacunarity    :  { value: 2.0 },                                             // Lacunarity
                            randomness    :  { value: 1.0 },                                             // Randomness
                            diffuseColour1:  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40 ) },     // Diffuse gradient colour 1
                            diffuseColour2:  { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43 ) },        // Diffuse gradient colour 2
                            diffuseColour3:  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44 ) },     // Diffuse gradient colour 3
                            emitColour1   :  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61 ) },     // Emission gradient colour 1
                            emitColour2   :  { value: new THREE.Vector4( 0.8, 0.0, 1.0, 0.63 ) },        // Emission gradient colour 2
                        }
                    } );

                }
                else {
                    brightenMaterial( child.material, amount );
                }

            }

        } );

        this.mesh = this.model.scene;
        this.mesh.position.z = l.current_scene.room_depth;
        this.mesh.rotation.order = 'YXZ';
        this.mesh.scale.setScalar(2);

        this.mesh.userData.targetable = true;

        this.createThruster();
        this.afterburner = new Afterburner( this.thruster.container );
        this.setupRotors();

        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.rotors.actions = [
            this.mixer.clipAction( this.model.animations[ 0 ] ),
            this.mixer.clipAction( this.model.animations[ 1 ] )
        ];
        this.rotors.actions[ 0 ].play();
        this.rotors.actions[ 1 ].play();

        //l.current_scene.effects.particles.createShipThruster(this, 1.5, { x: 0, y: 1.2, z: 1.5 });

        // Short flame for cruise speeds.
        this.cruiseTrail = l.current_scene.effects.trail.createTrail(
            this.mesh, 0, this.trail_position_y, this.trail_position_z,
            { trailLength: 4, advanceFrequency: 69, headScale: 0.25, nameSuffix: ' Cruise Trail' }
        );
        this.cruiseTrail.mesh.visible = false;
        this.cruiseTrail.mesh.material.uniforms.headColor.value.w = 0;
        this.cruiseTrail.mesh.material.uniforms.tailColor.value.w = 0;

        // Soft sheath around the shock diamonds (full 16-node buffer).
        this.trail = l.current_scene.effects.trail.createTrail(
            this.mesh, 0, this.trail_position_y, this.trail_position_z,
            { trailLength: 8, advanceFrequency: 48, headScale: 0.28, nameSuffix: ' Afterburner Trail' }
        );
        this.trail.mesh.visible = false;
        this.trail.mesh.material.uniforms.headColor.value.w = 0;
        this.trail.mesh.material.uniforms.tailColor.value.w = 0;

        this.mesh.userData.object = new ValiantObject( this.mesh );
    }

    createThrusterMesh( options ) {
        let geometry = false,
            texture = false,
            material = false,
            mesh = false;

        switch ( options.geometry ) {
            case 'cone':
                geometry = new THREE.ConeGeometry(
                    options.radius,
                    options.height,
                    options.radialSegments,
                );
                break;

            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    options.radius, // radiusTop
                    options.radius, // radiusBottom
                    options.height,
                    options.radialSegments,
                );
                geometry.openEnded = true;
                break;
        }

        texture = new THREE.VideoTexture( this.thruster.videoElement );
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, options.texture_repeat );
        texture.rotation = - Math.PI / 2;

        const parameters = {
            depthWrite: false,
            map: texture,
            transparent: true,
        };

        material = new THREE.MeshBasicMaterial( parameters );

        material.blending = THREE.CustomBlending;
        material.blendSrc = THREE.SrcAlphaFactor;
        material.blendDst = THREE.OneFactor;
        material.blendEquation = THREE.AddEquation;

        // Nest material in an array so it only paints the first face of the cylinder.
        if ( options.geometry == 'cylinder' ) {
            material = [
                material,
                new THREE.MeshBasicMaterial( { visible: false } ),
                new THREE.MeshBasicMaterial( { visible: false } )
            ];
        }

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

    // Uses a video texture to create a jet engine afterburner effect
    createThruster() {
        this.thruster = {
            container: new THREE.Object3D(),
            containerPosition: {
                x: 0,
                y: 1.2,
                z: 1.5
            },
            rearConeBurner: false,
            centralConeBurner: false,
            innerCylBurner: false,
            outerCylBurner: false,
            videoElement: false,
        };

        // Setup the thruster container which will contain the other meshes.
        this.thruster.container.rotation.x = Math.PI / 2;
        this.thruster.container.position.set(
            this.thruster.containerPosition.x,
            this.thruster.containerPosition.y,
            this.thruster.containerPosition.z,
        );

        // Instantiate the video element for reuse
        this.thruster.videoElement = document.getElementById( 'thruster' );
        this.thruster.videoElement.play();
        this.thruster.videoElement.playbackRate = 0.25;

        // Setup rear cone burner.
        this.thruster.rearConeBurner = this.createThrusterMesh( {
            geometry: 'cone',
            radius: 0.3,
            height: 0.6,
            radialSegments: 8,
            texture_repeat: 8,
        } );
        this.thruster.rearConeBurner.position.z = - 0.05;
        this.thruster.container.add( this.thruster.rearConeBurner );

        // Setup central cone burner.
        this.thruster.centralConeBurner = this.createThrusterMesh( {
            geometry: 'cone',
            radius: 0.3,
            height: 2,
            radialSegments: 8,
            texture_repeat: 8,
        } );
        this.thruster.centralConeBurner.rotation.y = Math.PI / 4;
        this.thruster.container.add( this.thruster.centralConeBurner );

        // Setup the inner cylinder burner
        this.thruster.innerCylBurner = this.createThrusterMesh( {
            geometry: 'cylinder',
            radius: 0.15,
            height: 0.75,
            radialSegments: 16,
            texture_repeat: 4,
        } );
        this.thruster.container.add( this.thruster.innerCylBurner );

        // Setup the outer cylinder burner
        this.thruster.outerCylBurner = this.createThrusterMesh( {
            geometry: 'cylinder',
            radius: 0.25,
            height: 0.75,
            radialSegments: 16,
            texture_repeat: 8,
        } );
        this.thruster.outerCylBurner.rotation.y = Math.PI / 4;
        this.thruster.container.add( this.thruster.outerCylBurner );

        // Add the thruster container to the mesh.
        this.mesh.add( this.thruster.container );
    }

    // Parent each rotor mesh under a pivot so we can tilt without fighting the spin clips.
    setupRotors() {
        let leftMesh = this.mesh.getObjectByName( 'Cylinder' ),
            rightMesh = this.mesh.getObjectByName( 'Cylinder001' ),
            leftPivot = new THREE.Object3D(),
            rightPivot = new THREE.Object3D();

        if ( ! leftMesh || ! rightMesh ) {
            this.rotors = false;
            return;
        }

        leftPivot.name = 'LeftRotorPivot';
        rightPivot.name = 'RightRotorPivot';
        leftPivot.position.copy( leftMesh.position );
        rightPivot.position.copy( rightMesh.position );
        this.mesh.add( leftPivot );
        this.mesh.add( rightPivot );

        leftMesh.position.set( 0, 0, 0 );
        rightMesh.position.set( 0, 0, 0 );
        leftPivot.add( leftMesh );
        rightPivot.add( rightMesh );

        this.rotors = {
            left: leftPivot,
            right: rightPivot,
            actions: [],
            // 0 = face down (hover), maxTilt = lean forward in flight (~30 deg).
            tilt: 0,
            maxTilt: Math.PI / 6,
            // Turn lean shared by both nacelles, then applied differentially.
            bank: 0,
            // Elevation tip used in afterburner / jet mode.
            elev: 0,
            // True once blades have been parked for jet mode this run.
            jetParked: false
        };
    }

    // Tilt nacelles with airspeed / turn input; spin rate follows throttle effort.
    // Above cruise (afterburner): park spin, reset airspeed tilt, angle only for turn/elev.
    animateRotors( delta ) {
        if ( ! this.rotors ) {
            return;
        }

        let object = this.mesh.userData.object,
            // airSpeed < 0 is forward in this sim; > 0 is reverse.
            airSpeed = object.airSpeed,
            speed = Math.abs( airSpeed ),
            cruiseCap = object.cruiseForward || ( 400 / 60 ),
            hoverSpeed = 100 / 60,
            // Afterburner regime: faster than cruise.
            jetMode = speed > cruiseCap,
            tiltTarget = 0,
            turnTarget = 0,
            elevTarget = 0,
            forwardFactor = 0,
            ease = Math.min( 1, delta * 3 ),
            spinRate = 1,
            turbulence = 0,
            turbX = 0,
            turbZ = 0;

        if ( jetMode ) {
            // Lock out airspeed tilt; nacelles only tip for turn / elevation.
            tiltTarget = 0;
            spinRate = 0;
            if ( ! this.rotors.jetParked && this.rotors.actions[ 0 ] ) {
                this.rotors.actions[ 0 ].time = 0;
                this.rotors.actions[ 1 ].time = 0;
                this.rotors.jetParked = true;
            }
            if ( object.controls.moveUp ) {
                elevTarget = -this.rotors.maxTilt * 0.55;
            }
            else if ( object.controls.moveDown ) {
                elevTarget = this.rotors.maxTilt * 0.55;
            }
        }
        else {
            this.rotors.jetParked = false;
            if ( airSpeed < -hoverSpeed ) {
                tiltTarget = -this.rotors.maxTilt;
            }
            else if ( airSpeed > hoverSpeed ) {
                tiltTarget = this.rotors.maxTilt;
            }
            // Spin faster under thrust and as airspeed climbs.
            spinRate = 0.85
                + speed * 0.12
                + ( object.controls.throttleDown || object.controls.throttleUp ? 0.55 : 0 );
        }

        this.rotors.tilt += ( tiltTarget - this.rotors.tilt ) * ease;
        this.rotors.elev += ( elevTarget - this.rotors.elev ) * Math.min( 1, delta * 5 );
        forwardFactor = Math.abs( this.rotors.tilt ) / this.rotors.maxTilt;

        if ( object.controls.moveLeft ) {
            turnTarget = 1;
        }
        else if ( object.controls.moveRight ) {
            turnTarget = -1;
        }
        this.rotors.bank += ( turnTarget * 0.35 - this.rotors.bank ) * Math.min( 1, delta * 5 );

        if ( this.rotors.actions[ 0 ] ) {
            this.rotors.actions[ 0 ].setEffectiveTimeScale( spinRate );
            this.rotors.actions[ 1 ].setEffectiveTimeScale( spinRate );
        }

        // Light mechanical shake; quiet in jet mode so parked blades read as locked.
        if ( jetMode ) {
            turbulence = Math.abs( this.rotors.bank ) * 0.01 + Math.abs( this.rotors.elev ) * 0.01;
        }
        else {
            turbulence = Math.min( 1, speed / cruiseCap ) * 0.02 + Math.abs( this.rotors.bank ) * 0.015;
        }
        turbX = ( Math.random() * 2 - 1 ) * turbulence;
        turbZ = ( Math.random() * 2 - 1 ) * turbulence;

        // Pitch both nacelles forward together; differential roll/yaw when turning.
        // Hover: bank → lateral tip (yaw authority). Flight: bank → differential pitch (roll).
        // Jet mode: parked blades; elev for climb/dive, bank as differential pitch for turns.
        if ( jetMode ) {
            this.rotors.left.rotation.x = this.rotors.elev + this.rotors.bank * 0.55 + turbX;
            this.rotors.left.rotation.z = turbZ;
            this.rotors.right.rotation.x = this.rotors.elev - this.rotors.bank * 0.55 + turbX;
            this.rotors.right.rotation.z = -turbZ;
        }
        else {
            this.rotors.left.rotation.x = this.rotors.tilt + this.rotors.bank * 0.22 * forwardFactor + turbX;
            this.rotors.left.rotation.z = this.rotors.bank * 0.4 * ( 1 - forwardFactor ) + turbZ;
            this.rotors.right.rotation.x = this.rotors.tilt - this.rotors.bank * 0.22 * forwardFactor + turbX;
            this.rotors.right.rotation.z = -this.rotors.bank * 0.4 * ( 1 - forwardFactor ) - turbZ;
        }
    }

    updateAnimation( delta ) {
        if ( this.mixer ) {
            this.mixer.update( delta );
        }

        this.animateRotors( delta );

        // Rock the ship forward and back when moving horizontally.
        // Elevation pitch is applied in updateMesh so it survives the sim sync.
        if ( this.mesh.userData.object.controls.throttleDown || this.mesh.userData.object.controls.throttleUp ) {
            let pitchChange = this.mesh.userData.object.controls.throttleUp ? -1 : 1;
            if ( Math.abs( this.mesh.rotation.x ) < 1 / 4 ) {
                this.mesh.rotation.x += pitchChange / 10 / 180;
            }
        }
    }

    chaseCameraDistance() {
        let distance = this.default_camera_distance + ( l.current_scene.room_depth / 2 );
        if ( this.mesh.userData.object && this.mesh.userData.object.airSpeed < 0 ) {
            distance -= this.mesh.userData.object.airSpeed * 4;
        }
        return distance;
    }

    /**
     * Visual centre of the aircraft in world space (mesh origin is often not the hull centre).
     */
    getOrbitPivot() {
        if ( ! this._orbitPivotLocal && this.mesh ) {
            this._orbitBox.setFromObject( this.mesh );
            this._orbitPivotLocal = this._orbitBox.getCenter( new THREE.Vector3() );
            this.mesh.worldToLocal( this._orbitPivotLocal );
        }

        if ( ! this._orbitPivotLocal ) {
            return this.mesh.position;
        }

        this._orbitPivotWorld.copy( this._orbitPivotLocal );
        this.mesh.localToWorld( this._orbitPivotWorld );
        return this._orbitPivotWorld;
    }

    getChaseCameraPosition( yaw = this.mesh.rotation.y, pitch = 0, aroundCentre = false ) {
        const ship = this.mesh;
        const maxPitch = 55 * Math.PI / 180;
        const clampedPitch = Math.max( -maxPitch, Math.min( maxPitch, pitch ) );

        // Rare helper path: sphere around the visual hull centre (OrbitControls owns live user orbit).
        if ( aroundCentre ) {
            const pivot = this.getOrbitPivot();
            const distance = -Math.abs( this.chaseCameraDistance() );
            const horizontal = distance * Math.cos( clampedPitch );
            return {
                x: pivot.x + horizontal * Math.sin( yaw ),
                y: pivot.y - distance * Math.sin( clampedPitch ),
                z: pivot.z + horizontal * Math.cos( yaw )
            };
        }

        const distance = this.chaseCameraDistance();
        const horizontal = distance * Math.cos( clampedPitch );
        return {
            x: ship.position.x + horizontal * Math.sin( yaw ),
            y: ship.position.y + ( l.scenograph.cameras.playerY - 8.5 ) + Math.abs( distance ) * Math.sin( clampedPitch ),
            z: ship.position.z + horizontal * Math.cos( yaw )
        };
    }

    aimChaseCamera( aroundCentre = false ) {
        if ( aroundCentre ) {
            this._chaseLookAt.copy( this.getOrbitPivot() );
        }
        else {
            const ship = this.mesh;
            const heading = ship.rotation.y;
            this._chaseLookAt.set(
                ship.position.x - Math.sin( heading ) * this.chaseLookAhead,
                ship.position.y + 1.2,
                ship.position.z - Math.cos( heading ) * this.chaseLookAhead
            );
        }
        l.scenograph.cameras.player.lookAt( this._chaseLookAt );
    }

    applyChaseCamera( yaw = this.mesh.rotation.y, pitch = 0, aroundCentre = false ) {
        const pos = this.getChaseCameraPosition( yaw, pitch, aroundCentre );
        l.scenograph.cameras.player.position.set( pos.x, pos.y, pos.z );
        this.aimChaseCamera( aroundCentre );
        l.scenograph.cameras.player.updateProjectionMatrix();
    }

    // Update the position of the aircraft to spot determined by game logic.
    updateMesh( delta = 1 / 60 ) {
        const object = this.mesh.userData.object;

        this.mesh.position.x = object.position.x;
        this.mesh.position.y = object.position.y;
        this.mesh.position.z = object.position.z;
        this.mesh.rotation.y = object.rotation.y;
        this.mesh.rotation.z = object.rotation.z;

        // Smooth nose pitch toward climb / dive from vertical speed.
        let targetPitch = 0;
        if ( object.verticalSpeed > 0.01 ) {
            targetPitch = this.elevationPitchMax;
        }
        else if ( object.verticalSpeed < -0.01 ) {
            targetPitch = -this.elevationPitchMax;
        }

        const blend = 1 - Math.exp( -this.elevationPitchSmooth * Math.max( 0, delta ) );
        this.elevationPitch += ( targetPitch - this.elevationPitch ) * blend;

        this.mesh.rotation.x = object.rotation.x + this.elevationPitch;
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof Valiant
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {

        const departing = l.mode === 'hangar' && l.scenograph.hangar && l.scenograph.hangar.departing;
        if ( departing || ( l.current_scene.objects.demoTour.ready && l.mode != 'hangar' ) ) {
            this.updateAnimation( delta );
            if ( ! this.demo && l.mode != 'hangar' ) {
                this.animateTrail();
            }
        }
    }

    animateTrail() {
        if ( ! this.trail || ! this.cruiseTrail ) {
            return;
        }

        let object = this.mesh.userData.object,
            thrusting = object.airSpeed < 0,
            speed = Math.abs( object.airSpeed ),
            // Crossfade short flame → afterburner between 380–420 km/h (HUD @ 60 FPS).
            fadeIn = 380 / 60,
            fadeOut = 420 / 60,
            cruiseCap = object.cruiseForward || ( 400 / 60 ),
            nodeSpacing = ( 35 / 60 ) * ( 60 / 48 ),
            blendTarget = 0,
            cruiseWeight = 0,
            afterburnerWeight = 0,
            turbulence = 0,
            jitter = 0,
            cruiseJitter = 0.012,
            traveled = 0,
            steps = 0,
            i = 0,
            // Warm cruise sheath → electric blue afterburner plume.
            warmHeadR = 1.0,
            warmHeadG = 0.83,
            warmHeadB = 0.58,
            warmTailR = 0.52,
            warmTailG = 0.16,
            warmTailB = 0.14,
            blueHeadR = 0.45,
            blueHeadG = 0.75,
            blueHeadB = 1.0,
            blueTailR = 0.25,
            blueTailG = 0.45,
            blueTailB = 0.95,
            sheathBlend = 0,
            headR = 0,
            headG = 0,
            headB = 0,
            tailR = 0,
            tailG = 0,
            tailB = 0,
            // Cruise plume stays on during afterburner (~50%); was fully crossfaded off before.
            cruiseAlpha = 0;

        if ( speed >= fadeOut ) {
            blendTarget = 1;
        }
        else if ( speed > fadeIn ) {
            blendTarget = ( speed - fadeIn ) / ( fadeOut - fadeIn );
        }

        this.afterburnerBlend += ( blendTarget - this.afterburnerBlend ) * 0.15;
        if ( Math.abs( this.afterburnerBlend - blendTarget ) < 0.002 ) {
            this.afterburnerBlend = blendTarget;
        }

        cruiseWeight = 1 - this.afterburnerBlend;
        afterburnerWeight = this.afterburnerBlend;
        cruiseAlpha = 0.8 * cruiseWeight + 0.25 * afterburnerWeight;

        // Turbulence only after cruise; gentle at first, then ramps toward maxForward.
        if ( speed > cruiseCap ) {
            turbulence = Math.min( 1, ( speed - cruiseCap ) / Math.max( 0.001, object.maxForward - cruiseCap ) );
        }
        jitter = turbulence * turbulence * 0.045;

        if ( thrusting ) {
            // Cones keep cruise scale; cylinders open with afterburner.
            this.animateThruster( object.airSpeed, this.thruster.centralConeBurner, .5, 0 );
            this.animateThruster( object.airSpeed, this.thruster.outerCylBurner, .5, this.afterburnerBlend );
            this.thruster.innerCylBurner.scale.y = 1 + this.afterburnerBlend * 1.4;
            this.thruster.innerCylBurner.position.y = this.afterburnerBlend * 0.55;

            this.spinThruster( object.airSpeed, this.thruster.rearConeBurner, -1 );
            this.spinThruster( object.airSpeed, this.thruster.centralConeBurner, 1 );
            this.spinThruster( object.airSpeed, this.thruster.outerCylBurner, -1 );
            this.spinThruster( object.airSpeed, this.thruster.innerCylBurner, 1 );

            this.thruster.videoElement.playbackRate = Math.min( 5, 0.25 + speed + this.afterburnerBlend * 2.0 );

            this.mesh.updateMatrixWorld( true );

            sheathBlend = afterburnerWeight;
            headR = warmHeadR + ( blueHeadR - warmHeadR ) * sheathBlend;
            headG = warmHeadG + ( blueHeadG - warmHeadG ) * sheathBlend;
            headB = warmHeadB + ( blueHeadB - warmHeadB ) * sheathBlend;
            tailR = warmTailR + ( blueTailR - warmTailR ) * sheathBlend;
            tailG = warmTailG + ( blueTailG - warmTailG ) * sheathBlend;
            tailB = warmTailB + ( blueTailB - warmTailB ) * sheathBlend;

            // Original cruise plume — stays visible during afterburner (layered under diamonds).
            if ( cruiseAlpha > 0.01 ) {
                if ( ! this.cruiseTrail.mesh.visible ) {
                    this.cruiseTrail.reset();
                    this.cruiseTrail.lastAdvanceTime = 0;
                    this.cruiseTrail.mesh.visible = true;
                }
                this.cruiseTrail.targetObject.position.set(
                    ( Math.random() * 2 - 1 ) * cruiseJitter,
                    this.trail_position_y + ( Math.random() * 2 - 1 ) * cruiseJitter * 0.5,
                    this.trail_position_z
                );
                this.cruiseTrail.mesh.material.uniforms.headColor.value.set( headR, headG, headB, cruiseAlpha );
                this.cruiseTrail.mesh.material.uniforms.tailColor.value.set( tailR, tailG, tailB, 0.3 * cruiseAlpha );
                this.cruiseTrail.update();
            }
            else {
                this.cruiseTrail.mesh.material.uniforms.headColor.value.w = 0;
                this.cruiseTrail.mesh.material.uniforms.tailColor.value.w = 0;
                this.cruiseTrail.mesh.visible = false;
            }

            // Longer soft sheath wrapping the shock-diamond chain.
            if ( afterburnerWeight > 0.01 ) {
                if ( ! this.trail.mesh.visible ) {
                    this.trail.reset();
                    this.trail.lastAdvanceTime = 0;
                    this.trail.mesh.visible = true;
                    this.trailAnchor.copy( this.mesh.position );
                }

                this.trail.targetObject.position.set(
                    ( Math.random() * 2 - 1 ) * jitter,
                    this.trail_position_y + ( Math.random() * 2 - 1 ) * jitter * 0.5,
                    this.trail_position_z
                );

                this.trail.mesh.material.uniforms.headColor.value.set( headR, headG, headB, 0.375 * afterburnerWeight );
                this.trail.mesh.material.uniforms.tailColor.value.set( tailR, tailG, tailB, 0.15 * afterburnerWeight );

                traveled = this.mesh.position.distanceTo( this.trailAnchor );
                steps = Math.min( 8, Math.floor( traveled / Math.max( 0.05, nodeSpacing ) ) );
                for ( i = 0; i < steps; i++ ) {
                    this.trail.advance();
                }
                if ( steps > 0 && traveled > 0 ) {
                    this.trailAnchor.lerp( this.mesh.position, ( steps * nodeSpacing ) / traveled );
                }
                this.trail.updateHead();
                this.trail.geometry.computeBoundingSphere();
            }
            else {
                this.trail.mesh.material.uniforms.headColor.value.w = 0;
                this.trail.mesh.material.uniforms.tailColor.value.w = 0;
                this.trail.mesh.visible = false;
            }

            if ( this.afterburner ) {
                this.afterburner.update( speed, this.afterburnerBlend, turbulence );
            }
        }
        else {
            this.cruiseTrail.mesh.material.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0 );
            this.cruiseTrail.mesh.material.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 0 );
            this.cruiseTrail.mesh.visible = false;
            this.trail.mesh.material.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0 );
            this.trail.mesh.material.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 0 );
            this.trail.mesh.visible = false;
            this.afterburnerBlend = 0;
            if ( this.afterburner ) {
                this.afterburner.update( 0, 0 );
            }
        }
    }

    // Scale thruster meshes with airspeed. afterburnerBoost lengthens cylinders past cruise.
    animateThruster( airSpeed, burnerMesh, ratio, afterburnerBoost = 0 ) {
        let cruiseSpeed = Math.min( Math.abs( airSpeed ), 4.5 );
        burnerMesh.scale.y = 1 + cruiseSpeed * ratio + afterburnerBoost * ratio * 2.8;
        burnerMesh.position.y = cruiseSpeed * ratio * 0.5 + afterburnerBoost * ratio * 1.25;
    }

    spinThruster( airSpeed, burnerMesh, rotation_factor ) {
        burnerMesh.rotation.y += airSpeed / 50. * rotation_factor;
    }

}
