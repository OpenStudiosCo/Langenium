/***
 * @name            Map
 * @description     Player's mini map
 * @namespace       l.scenograph.overlays.map
 * @memberof        l.scenograph.overlays
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

export default class Map {

    constructor() {

        this.container = document.querySelector('#game_overlay #map');
        this.container.style.display = 'block';

        // Mapping distance / visibility range.
        this.distance = 2000;

        // Reusable icon SVGs
        this.icons = this.getIconSVGs();

        // Map markers, keyed by uuid
        this.markers = {};

        this._viewDir = new THREE.Vector3();

        // Create the fov icon (aircraft heading).
        this.fov = document.createElement('div');
        this.fov.id = 'map-fov';
        this.fov.innerHTML = this.icons.fov;
        this.container.appendChild(this.fov);

        // Camera viewing angle (orbit / chase look direction).
        this.view = document.createElement('div');
        this.view.id = 'map-view';
        this.view.innerHTML = this.icons.view_angle;
        this.container.appendChild(this.view);

    }

    getIconSVGs() {
        let icons = {};
        let iconTemplate = document.createElement('div');
        iconTemplate.innerHTML = document.querySelector('#templates #map_icons').innerHTML;

        icons.aircraft = iconTemplate.querySelector('.aircraft').innerHTML;
        icons.fov = iconTemplate.querySelector('.fov').innerHTML;
        icons.view_angle = iconTemplate.querySelector('.view_angle').innerHTML;
        icons.ship = iconTemplate.querySelector('.ship').innerHTML;
        icons.special = iconTemplate.querySelector('.special').innerHTML;
        icons.structure = iconTemplate.querySelector('.structure').innerHTML;

        return icons;
    }

    /**
     * Map-space degrees for a world yaw, matching the existing heading chevron.
     */
    yawToMapDegrees( yaw ) {
        let heading = THREE.MathUtils.radToDeg( yaw ) % 360;
        if ( heading < 0 ) {
            heading += 360;
        }
        return Math.round( 360 - heading );
    }

    /**
     * Adds marker to the map.
     */
    addMarker( trackedObject ) {
        let marker = {
            domElement: false,
        };

        // Object icon look up table.
        const objectIcons = {
            'bot': 'aircraft',
            'cargoShip': 'ship',
            'city': 'structure',
            'extractors': 'structure',
            'hangar': 'structure',
            'missiles': 'aircraft',
            'player': 'aircraft',
            'refinery': 'structure',
        }

        let iconName = objectIcons[ trackedObject.mesh.userData.objectClass ] || 'aircraft';

        marker.domElement = document.createElement('div');
        marker.domElement.classList.add('marker');
        marker.domElement.classList.add('marker-' + trackedObject.mesh.userData.objectClass);


        marker.domElement.innerHTML = l.scenograph.overlays.map.icons[ iconName];

        l.scenograph.overlays.map.container.appendChild( marker.domElement );

        return marker;

    }

    /**
     * Removes marker from the map.
     */
    removeMarker( uuid, marker ) {
        l.scenograph.overlays.map.container.removeChild( marker.domElement );
        delete l.scenograph.overlays.map.markers[ uuid ];
    }

    /**
     * Animates the markers.
     */
    animateMarkers( ) {

        let mapSize = l.scenograph.overlays.map.container.offsetWidth;
        let offset = mapSize / l.scenograph.overlays.map.distance;  // Pixels per world unit
        let halfMapSize = (mapSize / 2) - 2.5;  // Half the map size to center objects

        let leftEdge = l.scenograph.actors.player.vehicle.mesh.position.x - l.scenograph.overlays.map.distance / 2;
        let topEdge = l.scenograph.actors.player.vehicle.mesh.position.z - l.scenograph.overlays.map.distance / 2;


        l.scenograph.actors.player.vehicle.mesh.userData.actor.scanners.targets.forEach( target => {
            let distance = target.mesh.position.distanceTo( l.scenograph.actors.player.vehicle.mesh.position );

            // Check if the object is within the mapping distance.
            if ( distance <= l.scenograph.overlays.map.distance * 100 ) {

                // Check if the object is already present on the map, move it if so
                if ( target.mesh.uuid in l.scenograph.overlays.map.markers ) {

                    let diffX = ( target.mesh.position.x - leftEdge ) * offset;
                    let diffZ = ( target.mesh.position.z - topEdge ) * offset;

                     // Calculate the distance from the center of the minimap
                    let dx = diffX - halfMapSize;
                    let dy = diffZ - halfMapSize;
                    let distFromCenter = Math.sqrt(dx * dx + dy * dy);

                    // Check if the marker is outside the circle (clamp if necessary)
                    if (distFromCenter > halfMapSize) {
                        // Clamp the position to the edge of the circle
                        let clampedX = halfMapSize + (dx * halfMapSize) / distFromCenter;
                        let clampedY = halfMapSize + (dy * halfMapSize) / distFromCenter;

                        diffX = clampedX;
                        diffZ = clampedY;
                    }

                    // Update position.
                    l.scenograph.overlays.map.markers[ target.mesh.uuid ].domElement.style.left = `${diffX-5}px`;
                    l.scenograph.overlays.map.markers[ target.mesh.uuid ].domElement.style.top = `${diffZ-5}px`;

                }
                else {
                    // Add the object to the map
                    l.scenograph.overlays.map.markers[ target.mesh.uuid ] = l.scenograph.overlays.map.addMarker( target );
                }

            }
            else {
                // Check if the object is already present on the map, remove it if so
                if ( target.mesh.uuid in l.scenograph.overlays.map.markers ) {
                    l.scenograph.overlays.map.removeMarker( target.mesh.uuid, l.scenograph.overlays.map.markers[ target.mesh.uuid ] );
                }
            }
        } );


    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop andw
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof Map
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {
        const map = l.scenograph.overlays.map;
        const ship = l.scenograph.actors.player.vehicle.mesh;
        const cam = l.scenograph.cameras.player;

        map.fov.style.transform = 'rotate(' + map.yawToMapDegrees( ship.rotation.y ) + 'deg)';

        // Viewing wedge follows the camera look direction on the ground plane.
        // Flip 180° so the open end of the wedge faces the look direction on the map.
        cam.getWorldDirection( map._viewDir );
        const lookYaw = Math.atan2( map._viewDir.x, map._viewDir.z );
        map.view.style.transform = 'rotate(' + ( ( map.yawToMapDegrees( lookYaw ) + 180 ) % 360 ) + 'deg)';

        map.animateMarkers( );
    }

}
