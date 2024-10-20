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

        // Mapping distance / visibility range.
        this.distance = 2000;

        // Reusable icon SVGs
        this.icons = this.getIconSVGs();

        // Map markers, keyed by uuid
        this.markers = {};

        // Create the fov icon
        this.fov = document.createElement('div');
        this.fov.id = 'map-fov';
        this.fov.innerHTML = this.icons.fov;
        this.container.appendChild(this.fov);

    }

    getIconSVGs() {
        let icons = {};
        let iconTemplate = document.createElement('div');
        iconTemplate.innerHTML = document.querySelector('#templates #map_icons').innerHTML;

        icons.aircraft = iconTemplate.querySelector('.aircraft').innerHTML;
        icons.fov = iconTemplate.querySelector('.fov').innerHTML;
        icons.ship = iconTemplate.querySelector('.ship').innerHTML;
        icons.special = iconTemplate.querySelector('.special').innerHTML;
        icons.structure = iconTemplate.querySelector('.structure').innerHTML;

        return icons;
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
            'player': 'aircraft',
            'refinery': 'structure',
        }

        let iconName = objectIcons[ trackedObject.mesh.userData.objectClass ];

        marker.domElement = document.createElement('div');
        marker.domElement.classList.add('marker');
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

        let leftEdge = l.current_scene.objects.player.mesh.position.x - l.scenograph.overlays.map.distance / 2;
        let topEdge = l.current_scene.objects.player.mesh.position.z - l.scenograph.overlays.map.distance / 2;

        l.scenograph.overlays.scanners.trackedObjects.forEach( trackedObject => {
            let distance = trackedObject.mesh.position.distanceTo( l.current_scene.objects.player.mesh.position );
            
            // Check if the object is within the mapping distance.
            if ( distance <= l.scenograph.overlays.map.distance * 100 ) {
                
                // Check if the object is already present on the map, move it if so
                if ( trackedObject.mesh.uuid in l.scenograph.overlays.map.markers ) {

                    let diffX = ( trackedObject.mesh.position.x - leftEdge ) * offset;
                    let diffZ = ( trackedObject.mesh.position.z - topEdge ) * offset;

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
                    l.scenograph.overlays.map.markers[ trackedObject.mesh.uuid ].domElement.style.left = `${diffX-5}px`;
                    l.scenograph.overlays.map.markers[ trackedObject.mesh.uuid ].domElement.style.top = `${diffZ-5}px`;

                }
                else {
                    // Add the object to the map
                    l.scenograph.overlays.map.markers[ trackedObject.mesh.uuid ] = l.scenograph.overlays.map.addMarker( trackedObject );
                }

            }
            else {
                // Check if the object is already present on the map, remove it if so
                if ( trackedObject.mesh.uuid in l.scenograph.overlays.map.markers ) {
                    l.scenograph.overlays.map.removeMarker( trackedObject.mesh.uuid, l.scenograph.overlays.map.markers[ trackedObject.mesh.uuid ] );
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
        let heading = THREE.MathUtils.radToDeg( l.current_scene.objects.player.state.rotation.y );
        heading = heading % 360;
        if (heading < 0) {
            heading += 360;
        }
        heading = Math.round(360 - heading);

        l.scenograph.overlays.map.fov.style.transform = 'rotate(' + heading + 'deg)';

        l.scenograph.overlays.map.animateMarkers( )
    }

}
