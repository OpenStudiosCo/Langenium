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
        const snapshot = this.snapshotItem( fromBag, fromIndex );
        const terminal = this.getTerminal();
        const ok = terminal && typeof terminal.transferSlot === 'function'
            ? terminal.transferSlot( fromBag, fromIndex, toBag, toIndex )
            : fromBag.transferTo( fromIndex, toBag, toIndex );

        if ( ok && snapshot ) {
            this.logTransfer( snapshot, toBag );
        }
        return ok;
    }

    transferToFirstEmpty( fromBag, fromIndex, toBag ) {
        const snapshot = this.snapshotItem( fromBag, fromIndex );
        const terminal = this.getTerminal();
        const ok = terminal && typeof terminal.transferToFirstEmpty === 'function'
            ? terminal.transferToFirstEmpty( fromBag, fromIndex, toBag )
            : fromBag.transferToFirstEmpty( fromIndex, toBag );

        if ( ok && snapshot ) {
            this.logTransfer( snapshot, toBag );
        }
        return ok;
    }

    split( inventory, index ) {
        const terminal = this.getTerminal();
        if ( terminal && typeof terminal.splitStack === 'function' ) {
            return terminal.splitStack( inventory, index );
        }
        return inventory.split( index );
    }

    remove( inventory, index ) {
        const snapshot = this.snapshotItem( inventory, index );
        const terminal = this.getTerminal();
        const ok = terminal && typeof terminal.removeItem === 'function'
            ? terminal.removeItem( inventory, index )
            : inventory.remove( index ) !== null;

        if ( ok && snapshot && l.ui && l.ui.gameLog ) {
            l.ui.gameLog.appendItemEvent( 'Deleted', snapshot.item, snapshot.qty );
        }
        return ok;
    }

    /**
     * Copy item fields needed for the game log before a bag mutates.
     */
    snapshotItem( inventory, index ) {
        if ( ! inventory || typeof inventory.get !== 'function' ) {
            return null;
        }

        const item = inventory.get( index );
        if ( ! item ) {
            return null;
        }

        const qty = typeof inventory.qtyOf === 'function'
            ? inventory.qtyOf( item )
            : ( item.qty === undefined ? 1 : item.qty );

        return {
            item: {
                id: item.id,
                name: item.name,
                charge: item.charge,
                capacity: item.capacity,
                qty,
            },
            qty,
        };
    }

    /**
     * Describe a successful hangar ↔ aircraft move in the session log.
     */
    logTransfer( snapshot, toBag ) {
        if ( ! l.ui || ! l.ui.gameLog || ! snapshot ) {
            return;
        }

        const destination = this.destinationLabel( toBag );
        if ( ! destination ) {
            return;
        }

        l.ui.gameLog.appendItemEvent(
            'Transferred',
            snapshot.item,
            snapshot.qty,
            'to ' + destination
        );
    }

    destinationLabel( bag ) {
        if ( bag === this.ui.locationInventory ) {
            return 'hangar';
        }
        if ( bag === this.ui.aircraftInventory ) {
            return 'aircraft';
        }
        return null;
    }

}
