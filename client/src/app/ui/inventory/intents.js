/**
 * @name            InventoryIntents
 * @description     Bag lookups and Terminal-backed storage mutations
 * @namespace       l.ui.inventory.intents
 * @memberof        l.ui.inventory
 */

import l from '@/helpers/l.js';

/**
 * Bridges the storage UI to world bags and the game Terminal when available.
 * Modal bag refs (locationInventory / aircraftInventory) stay on the parent UI.
 */
export default class InventoryIntents {

    ui;

    constructor( ui ) {
        this.ui = ui;
    }

    /**
     * Game Terminal that owns storage mutation intents.
     */
    getTerminal() {
        return l.scenograph
            && l.scenograph.objects
            && l.scenograph.objects.structures
            && l.scenograph.objects.structures.terminal
            && l.scenograph.objects.structures.terminal.objectClass
            ? l.scenograph.objects.structures.terminal.objectClass
            : null;
    }

    /**
     * Player's inventory at their assigned location.
     */
    getPersonObject() {
        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        return player && player.actorInstance && player.actorInstance.object
            ? player.actorInstance.object
            : null;
    }

    getLocationInventory() {
        const person = this.getPersonObject();
        return person && person.inventory ? person.inventory : null;
    }

    getAircraftObject() {
        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        return player
            && player.vehicle
            && player.vehicle.mesh
            && player.vehicle.mesh.userData
            && player.vehicle.mesh.userData.object
            ? player.vehicle.mesh.userData.object
            : null;
    }

    getAircraftInventory() {
        const ship = this.getAircraftObject();
        return ship && ship.inventory ? ship.inventory : null;
    }

    getBag( bag ) {
        if ( bag === 'location' ) {
            return this.ui.locationInventory;
        }
        if ( bag === 'aircraft' ) {
            return this.ui.aircraftInventory;
        }
        return null;
    }

    otherBag( bag ) {
        return bag === 'location' ? 'aircraft' : 'location';
    }

    /**
     * Issue a simulation intent through the game Terminal when available.
     */
    transferSlot( fromBag, fromIndex, toBag, toIndex ) {
        const terminal = this.getTerminal();
        if ( terminal && typeof terminal.transferSlot === 'function' ) {
            return terminal.transferSlot( fromBag, fromIndex, toBag, toIndex );
        }
        return fromBag.transferTo( fromIndex, toBag, toIndex );
    }

    transferToFirstEmpty( fromBag, fromIndex, toBag ) {
        const terminal = this.getTerminal();
        if ( terminal && typeof terminal.transferToFirstEmpty === 'function' ) {
            return terminal.transferToFirstEmpty( fromBag, fromIndex, toBag );
        }
        return fromBag.transferToFirstEmpty( fromIndex, toBag );
    }

    split( inventory, index ) {
        const terminal = this.getTerminal();
        if ( terminal && typeof terminal.splitStack === 'function' ) {
            return terminal.splitStack( inventory, index );
        }
        return inventory.split( index );
    }

    remove( inventory, index ) {
        const terminal = this.getTerminal();
        if ( terminal && typeof terminal.removeItem === 'function' ) {
            return terminal.removeItem( inventory, index );
        }
        return inventory.remove( index ) !== null;
    }

}
