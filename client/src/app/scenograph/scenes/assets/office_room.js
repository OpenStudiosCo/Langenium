/**
 * Open Studios office room object.
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

// Create door geometry
export var doorWidth = 8.2;
export var doorHeight = 20.4;
export var doorDepth = 0.2;

export async function createDoor() {
    var doorParent = new THREE.Object3D();
    doorParent.name = 'Door';

    await l.current_scene.loaders.texture.load( './assets/models/desk-diffuse.jpg', async ( doorTexture ) => {
        doorTexture.wrapS = THREE.RepeatWrapping;
        doorTexture.wrapT = THREE.RepeatWrapping;
        doorTexture.repeat.set( doorWidth / 8, doorHeight / 8 );

        var doorGeometry = new THREE.BoxGeometry( doorWidth, doorHeight, doorDepth );

        // Create door material
        var doorMaterial = new THREE.MeshLambertMaterial( { map: doorTexture, name: 'door' } );

        // Create door mesh
        var door = new THREE.Mesh( doorGeometry, doorMaterial );
        // Set initial position and rotation of the door
        door.position.set( doorWidth / 2, 0, 0 );
        door.updateMatrixWorld();

        doorParent.add( door );

        const frameGroup = new THREE.Group();
        frameGroup.name = "Door Frame";
        frameGroup.position.z = - 15 + ( l.current_scene.room_depth / 2 );

        var frameWidth = 0.4;
        var frameDepth = 0.4;

        // Create the top of the door frame geometry
        var topFrameGeometry = new THREE.BoxGeometry( doorWidth + 2 * frameWidth, frameWidth, frameDepth );

        // Create the top of the door frame mesh
        var topFrame = new THREE.Mesh( topFrameGeometry, doorMaterial );

        // Position the top of the door frame above the door
        topFrame.position.set( 0, 5 + ( doorHeight / 2 ) + frameWidth, 0 );
        frameGroup.add( topFrame );

        // Create the sides of the door frame geometry
        var sideFrameGeometry = new THREE.BoxGeometry( frameWidth, doorHeight + frameWidth, frameDepth );

        // Create the door frame material (you can change the color or add a texture here)
        var doorFrameMaterial = new THREE.MeshBasicMaterial( { color: 0x808080 } );

        // Create the left side of the door frame mesh
        var leftSideFrame = new THREE.Mesh( sideFrameGeometry, doorMaterial );

        // Position the left side of the door frame to the left of the door
        leftSideFrame.position.set( -( doorWidth / 2 ) - frameWidth / 2, - 5 + ( doorHeight / 2 ) - frameWidth / 2, 0 );
        frameGroup.add( leftSideFrame );

        // Create the right side of the door frame mesh
        var rightSideFrame = new THREE.Mesh( sideFrameGeometry, doorMaterial );

        // Position the right side of the door frame to the right of the door
        rightSideFrame.position.set( ( doorWidth / 2 ) + frameWidth / 2, - 5 + ( doorHeight / 2 ) - frameWidth / 2, 0 );
        frameGroup.add( rightSideFrame );

        l.current_scene.scene_objects.door_frame = frameGroup;

        l.current_scene.scene.add( l.current_scene.scene_objects.door_frame );

        l.current_scene.loaders.stats.textures.loaded++;
        l.current_scene.scene.visible = true;

    } );

    // instantiate a loader
    const loader = new SVGLoader();

    await loader.load( "./assets/logo.svg", async function ( data ) {

        const group = new THREE.Group();
        group.scale.multiplyScalar( 0.0025 );
        group.position.x = 1.35;
        group.position.y = 7.5;
        group.position.z = 0.15;
        group.scale.y *= - 1;

        let renderOrder = 0;

        for ( const path of data.paths ) {

            // Grab the desired color from the SVG fill.
            const fillColor = path.userData.style.fill;

            if ( fillColor !== undefined && fillColor !== 'none' ) {

                const material = new THREE.MeshLambertMaterial( {
                    emissiveIntensity: 0,
                    emissive: new THREE.Color().setStyle( fillColor )
                } );

                const shapes = SVGLoader.createShapes( path );

                for ( const shape of shapes ) {

                    const geometry = new THREE.ShapeGeometry( shape );
                    const mesh = new THREE.Mesh( geometry, material );
                    mesh.renderOrder = renderOrder++;
                    mesh.layers.set( 11 );

                    group.add( mesh );
                }

            }

            const strokeColor = path.userData.style.stroke;

            if ( strokeColor !== undefined && strokeColor !== 'none' ) {

                const material = new THREE.MeshLambertMaterial( {
                    emissiveIntensity: 0,
                    emissive: new THREE.Color().setStyle( strokeColor )
                } );
                path.userData.style.strokeWidth *= 2;
                for ( const subPath of path.subPaths ) {
                    const geometry = SVGLoader.pointsToStroke( subPath.getPoints(), path.userData.style );

                    if ( geometry ) {

                        const mesh = new THREE.Mesh( geometry, material );
                        mesh.renderOrder = renderOrder++;
                        mesh.layers.set( 11 );

                        group.add( mesh );

                    }

                }

            }

        }
        l.current_scene.scene_objects.door_sign = group;

        doorParent.add( group );
        // let backWallLogo = group.clone();
        // backWallLogo.scale.multiplyScalar(2.5);
        // backWallLogo.position.x = -6.85;
        // backWallLogo.position.y = 28.5;
        // backWallLogo.position.z = 1.5;
        // backWallLogo.name = 'backWallLogo';

        // l.current_scene.scene_objects.wallGroup.add(backWallLogo);

        l.current_scene.loaders.stats.svg.loaded++;
    } );

    // Add the door to the scene
    return doorParent;
}

export async function createOfficeRoom() {

    var doorGeometry = new THREE.BoxGeometry( doorWidth, doorHeight, doorDepth );
    const transparentMaterial = new THREE.MeshLambertMaterial( {
        opacity: 0,
        transparent: true
    } );

    const doorBrush = new Brush( doorGeometry, transparentMaterial );
    doorBrush.position.set( -doorWidth / 2, - 5 + ( doorHeight / 2 ), - 15 + ( l.current_scene.room_depth / 2 ) );
    doorBrush.position.x += 4.1;
    doorBrush.updateMatrixWorld();

    const roomWidth = 80;
    const roomHeight = 37.5;
    const roomGeometry = new THREE.BoxGeometry( roomWidth, roomHeight, l.current_scene.room_depth );

    // Create two materials: one for the floor face and one for the other faces
    const floorMaterial = new THREE.MeshPhongMaterial( {
        shininess: 5,
        side: THREE.DoubleSide
    } );
    floorMaterial.name = 'floor';

    await l.current_scene.loaders.texture.load( './assets/textures/EAK309.png', async ( floorTexture ) => {
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set( 8, 8 );
        floorMaterial.map = floorTexture;
        floorMaterial.needsUpdate = true;
        l.current_scene.loaders.stats.textures.loaded++;

        // const geometry = new THREE.PlaneGeometry( roomWidth, roomWidth );
        // const plane = new THREE.Mesh( geometry, floorMaterial );
        // plane.position.z = l.current_scene.room_depth / 2;
        // plane.position.y = -5.1;
        // plane.rotation.x = Math.PI / 2;
        // l.current_scene.scene.add( plane );

    } );

    // Create two materials: one for the floor face and one for the other faces
    const ceilMaterial = new THREE.MeshLambertMaterial( {
        aoMapIntensity: 1.5,
        //map: ceilTexture,
        //normalMap: ceilNormal,
        normalScale: new THREE.Vector2( 7.5, 7.5 ),
        side: THREE.DoubleSide
    } );
    ceilMaterial.name = 'ceiling';

    await l.current_scene.loaders.texture.load( './assets/textures/Ceiling_Drop_Tiles_001_height.png', async ( ceilHeight ) => {
        ceilHeight.wrapS = THREE.RepeatWrapping;
        ceilHeight.wrapT = THREE.RepeatWrapping;
        ceilHeight.repeat.set( 4, 4 );
        ceilMaterial.displacementMap = ceilHeight;
        ceilMaterial.needsUpdate = true;
        l.current_scene.loaders.stats.textures.loaded++;
    } );

    await l.current_scene.loaders.texture.load( './assets/textures/Ceiling_Drop_Tiles_001_ambientOcclusion.jpg', async ( ceilAO ) => {
        ceilAO.wrapS = THREE.RepeatWrapping;
        ceilAO.wrapT = THREE.RepeatWrapping;
        ceilAO.repeat.set( 4, 4 );
        ceilMaterial.aoMap = ceilAO;
        ceilMaterial.needsUpdate = true;
        l.current_scene.loaders.stats.textures.loaded++;
    } );

    await l.current_scene.loaders.texture.load( './assets/textures/Ceiling_Drop_Tiles_001_basecolor.jpg', async ( ceilTexture ) => {
        ceilTexture.wrapS = THREE.RepeatWrapping;
        ceilTexture.wrapT = THREE.RepeatWrapping;
        ceilTexture.repeat.set( 4, 4 );
        ceilMaterial.map = ceilTexture;
        ceilMaterial.needsUpdate = true;
        l.current_scene.loaders.stats.textures.loaded++;
    } );


    await l.current_scene.loaders.texture.load( './assets/textures/Ceiling_Drop_Tiles_001_normal.jpg', async ( ceilNormal ) => {
        ceilNormal.wrapS = THREE.RepeatWrapping;
        ceilNormal.wrapT = THREE.RepeatWrapping;
        ceilNormal.repeat.set( 4, 4 );
        ceilMaterial.normalMap = ceilNormal;
        ceilMaterial.needsUpdate = true;
        l.current_scene.loaders.stats.textures.loaded++;
    } );

    const backwallMaterial = new THREE.MeshStandardMaterial( {
        alphaTest: 0.99,
        aoMapIntensity: .5,
        color: 0xa0adaf,
        displacementScale: 0.001,
        name: 'backwall',
        opacity: 1,
        side: THREE.DoubleSide,
        transparent: true
    } );

    const sidewallMaterial = backwallMaterial.clone();
    sidewallMaterial.name = 'sidewall';

    await l.current_scene.loaders.texture.load( './assets/textures/brick_wall_001_displacement_4k.jpg', async ( backwallHeight ) => {
        backwallHeight.wrapS = THREE.RepeatWrapping;
        backwallHeight.wrapT = THREE.RepeatWrapping;
        backwallHeight.repeat.set( roomWidth / 10, roomHeight / 10 );
        backwallMaterial.aoMap = backwallHeight;
        backwallMaterial.displacementMap = backwallHeight;
        backwallMaterial.needsUpdate = true;

        const sideWallHeight = backwallHeight.clone();
        sideWallHeight.repeat.set( l.current_scene.room_depth / 10, roomHeight / 10 );
        sidewallMaterial.aoMap = sideWallHeight;
        sidewallMaterial.displacementMap = sideWallHeight;

        sidewallMaterial.needsUpdate = true;

        l.current_scene.loaders.stats.textures.loaded++;
    } );

    await l.current_scene.loaders.texture.load( './assets/textures/brick_wall_001_nor_gl_4k.jpg', async ( backwallNormal ) => {
        backwallNormal.wrapS = THREE.RepeatWrapping;
        backwallNormal.wrapT = THREE.RepeatWrapping;
        backwallNormal.repeat.set( roomWidth / 10, roomHeight / 10 );
        backwallMaterial.normalMap = backwallNormal;
        backwallMaterial.needsUpdate = true;

        const sideWallNormal = backwallNormal.clone();
        sideWallNormal.repeat.set( l.current_scene.room_depth / 10, roomHeight / 10 );
        sidewallMaterial.normalMap = sideWallNormal;
        sidewallMaterial.needsUpdate = true;

        l.current_scene.loaders.stats.textures.loaded++;
    } );

    await l.current_scene.loaders.texture.load( './assets/textures/brick_wall_001_rough_4k.jpg', async ( backwallRough ) => {
        backwallRough.wrapS = THREE.RepeatWrapping;
        backwallRough.wrapT = THREE.RepeatWrapping;
        backwallRough.repeat.set( roomWidth / 10, roomHeight / 10 );
        backwallMaterial.roughnessMap = backwallRough;
        backwallMaterial.needsUpdate = true;

        const sideWallRough = backwallRough.clone();
        sideWallRough.repeat.set( l.current_scene.room_depth / 10, roomHeight / 10 );
        sidewallMaterial.roughnessMap = sideWallRough;
        sidewallMaterial.needsUpdate = true;

        l.current_scene.loaders.stats.textures.loaded++;

    } );

    const materials = [
        // Right
        sidewallMaterial,
        // Left
        sidewallMaterial,
        // Ceiling
        ceilMaterial,
        // Floor
        floorMaterial,
        // Front
        backwallMaterial,
        // Back
        backwallMaterial
    ];

    const roomBrush = new Brush( roomGeometry, materials );
    roomBrush.position.y = 13.75;
    roomBrush.position.z = l.current_scene.room_depth - 15;

    roomBrush.updateMatrixWorld();

    let result = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial()
    );

    // Constructive Solid Geometry (csg) Evaluator.
    let csgEvaluator;
    csgEvaluator = new Evaluator();
    csgEvaluator.useGroups = true;
    csgEvaluator.evaluate( roomBrush, doorBrush, SUBTRACTION, result );
    result.receiveShadow = true;
    result.layers.set( 11 );
    result.name = 'Office room';

    return result;
}
