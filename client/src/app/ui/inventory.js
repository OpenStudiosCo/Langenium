/**
 * @name            InventoryUI
 * @description     Hangar and aircraft storage windows
 * @namespace       l.ui.inventory
 * @memberof        l.ui
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD = 8;

export default class InventoryUI {

    container;
    hangarWindow;
    aircraftWindow;
    hangarGrid;
    aircraftGrid;
    hangarDetail;
    aircraftDetail;
    menu;
    hangarButton;

    // Modal open state and which bags are on screen.
    open;
    mode;
    hangarInventory;
    aircraftInventory;

    // Pointer story: select → long-press menu, or drag to another slot.
    selected;
    menuTarget;
    drag;
    longPress;
    suppressClick;

    /**
     * Markup shared by the flight HUD button and the hangar-floor button.
     */
    static buttonMarkup() {
        return [
            '<svg class="inventory-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
            '<path d="M3.5 8.2 12 4.2l8.5 4v9.6L12 21.8l-8.5-4V8.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
            '<path d="M3.5 8.2 12 12.2l8.5-4M12 12.2V21.8M7.2 10l9.6 4.5M7.2 14.2l4.8 2.3" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>',
            '</svg>',
            '<div class="inventory-meta">',
            '<kbd class="window_hotkey">I</kbd>',
            '<div class="inventory-label">INVENTORY</div>',
            '</div>',
        ].join( '' );
    }

    constructor() {

        this.container = document.querySelector( '#item_screen' );
        this.hangarWindow = this.container.querySelector( '[data-window="hangar"]' );
        this.aircraftWindow = this.container.querySelector( '[data-window="aircraft"]' );
        this.hangarGrid = this.container.querySelector( '[data-grid="hangar"]' );
        this.aircraftGrid = this.container.querySelector( '[data-grid="aircraft"]' );
        this.hangarDetail = this.container.querySelector( '[data-detail="hangar"]' );
        this.aircraftDetail = this.container.querySelector( '[data-detail="aircraft"]' );
        this.menu = this.container.querySelector( '.item_screen_menu' );
        this.hangarButton = null;

        this.open = false;
        this.mode = 'aircraft';
        this.hangarInventory = null;
        this.aircraftInventory = null;
        this.selected = null;
        this.menuTarget = null;
        this.drag = null;
        this.longPress = null;
        this.suppressClick = false;

        this.container.addEventListener( 'click', ( event ) => this.onClick( event ) );
        this.container.addEventListener( 'contextmenu', ( event ) => this.onContextMenu( event ) );
        this.container.addEventListener( 'pointerdown', ( event ) => this.onPointerDown( event ) );
        this.container.addEventListener( 'pointermove', ( event ) => this.onPointerMove( event ) );
        this.container.addEventListener( 'pointerup', ( event ) => this.onPointerUp( event ) );
        this.container.addEventListener( 'pointercancel', ( event ) => this.onPointerCancel( event ) );

        document.addEventListener( 'keydown', ( event ) => this.onKeyDown( event ) );

    }

    isOpen() {
        return this.open;
    }

    /**
     * Freeze walk / flight controls while the storage modal is up.
     */
    blocksInput() {
        return this.open;
    }

    toggleAircraftInventory() {
        if ( this.isOpen() ) {
            this.hide();
            return;
        }
        this.openAircraftInventory();
    }

    /**
     * Hangar mode has no flight HUD, so we park a matching inventory button
     * on the game overlay for the whole time the player is on foot indoors.
     */
    showHangarButton() {
        const overlay = document.querySelector( '#game_overlay' );
        if ( ! overlay ) {
            return;
        }

        if ( ! this.hangarButton ) {
            const button = document.createElement( 'button' );
            button.type = 'button';
            button.className = 'inventory-button hangar-inventory-button';
            button.dataset.action = 'toggle-inventory';
            button.setAttribute( 'aria-label', 'Inventory' );
            button.innerHTML = InventoryUI.buttonMarkup();
            button.addEventListener( 'click', ( event ) => {
                event.preventDefault();
                this.toggleAircraftInventory();
            } );
            this.hangarButton = button;
            overlay.appendChild( button );
        }

        this.hangarButton.hidden = false;
    }

    hideHangarButton() {
        if ( this.hangarButton ) {
            this.hangarButton.hidden = true;
        }
    }

    /**
     * Open the modal over one or two bags.
     *
     * mode 'aircraft'  — single aircraft storage window
     * mode 'transfer'  — hangar + aircraft side by side
     */
    show( options ) {
        if ( ! options ) {
            return;
        }

        const mode = options.mode || 'aircraft';
        const transferReady = options.hangarInventory && options.aircraftInventory;
        const aircraftReady = !! options.aircraftInventory;

        if ( mode === 'transfer' && ! transferReady ) {
            return;
        }
        if ( mode !== 'transfer' && ! aircraftReady ) {
            return;
        }

        // Spoken hangar prompts yield to the storage modal.
        if ( l.ui && l.ui.dialog && l.ui.dialog.isShowing() ) {
            l.ui.dialog.hide();
        }

        this.hideMenu();
        this.clearDrag();
        this.clearLongPress();

        this.mode = mode;
        this.hangarInventory = options.hangarInventory || null;
        this.aircraftInventory = options.aircraftInventory || null;
        this.selected = null;
        this.open = true;

        this.container.classList.toggle( 'transfer', mode === 'transfer' );
        this.hangarWindow.hidden = mode !== 'transfer';
        this.aircraftWindow.hidden = false;
        this.container.hidden = false;
        this.render();

        const closeButton = this.container.querySelector( '.item_screen_close' );
        if ( closeButton ) {
            closeButton.focus();
        }
    }

    hide() {
        if ( ! this.open ) {
            return;
        }

        this.hideMenu();
        this.clearDrag();
        this.clearLongPress();

        this.open = false;
        this.mode = 'aircraft';
        this.hangarInventory = null;
        this.aircraftInventory = null;
        this.selected = null;
        this.container.classList.remove( 'transfer' );
        this.hangarWindow.hidden = true;
        this.container.hidden = true;
    }

    /**
     * Hangar computer: both bags so the player can load the ship.
     */
    openHangarInventory() {
        const hangarInventory = this.getHangarInventory();
        const aircraft = this.getAircraftInventory();
        if ( ! hangarInventory || ! aircraft ) {
            return;
        }

        this.show( {
            mode: 'transfer',
            hangarInventory: hangarInventory,
            aircraftInventory: aircraft,
        } );
    }

    /**
     * Floor bag for the player's assigned hangar in the World scene.
     * Contents come from overworld.yml via Hangar.applyInventory.
     */
    getHangarInventory() {
        const hangarRef = l.scenograph
            && l.scenograph.actors
            && l.scenograph.actors.player
            && l.scenograph.actors.player.actorInstance
            && l.scenograph.actors.player.actorInstance.config
            && l.scenograph.actors.player.actorInstance.config.hangar;
        if ( ! hangarRef ) {
            return null;
        }

        const world = l.current_scene && l.current_scene.world;
        if ( ! world || ! world.instance || ! world.instance.objects ) {
            return null;
        }

        const structure = world.instance.objects.get( hangarRef.structure );
        if ( ! structure || ! structure.hangars ) {
            return null;
        }

        const hangarInstance = structure.hangars.find(
            ( entry ) => entry.config && entry.config.name === hangarRef.hangarName
        );
        const hangarObject = hangarInstance && hangarInstance.object;
        return hangarObject && hangarObject.inventory ? hangarObject.inventory : null;
    }

    /**
     * Flight / hangar floor button: aircraft cargo only.
     */
    openAircraftInventory() {
        const inventory = this.getAircraftInventory();
        if ( ! inventory ) {
            return;
        }

        this.show( {
            mode: 'aircraft',
            aircraftInventory: inventory,
        } );
    }

    getAircraftInventory() {
        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        const ship = player
            && player.vehicle
            && player.vehicle.mesh
            && player.vehicle.mesh.userData
            && player.vehicle.mesh.userData.object;
        return ship && ship.inventory ? ship.inventory : null;
    }

    getBag( bag ) {
        if ( bag === 'hangar' ) {
            return this.hangarInventory;
        }
        if ( bag === 'aircraft' ) {
            return this.aircraftInventory;
        }
        return null;
    }

    otherBag( bag ) {
        return bag === 'hangar' ? 'aircraft' : 'hangar';
    }

    /**
     * [I] is live in the hangar anywhere, and in flight once the player is
     * actually piloting with game controls on.
     */
    canToggleInventory() {
        const titleOpen = l.ui
            && l.ui.game_menu
            && l.ui.game_menu.title_screen
            && l.ui.game_menu.title_screen.container
            && l.ui.game_menu.title_screen.container.classList.contains( 'active' );

        if ( titleOpen ) {
            return false;
        }

        if ( ! this.getAircraftInventory() ) {
            return false;
        }

        if ( l.mode === 'hangar' ) {
            return true;
        }

        if ( l.mode !== 'single_player' && l.mode !== 'multi_player' ) {
            return false;
        }

        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        if ( ! player || player.mode !== 'vehicle' ) {
            return false;
        }

        if ( ! l.current_scene || ! l.current_scene.settings || ! l.current_scene.settings.game_controls ) {
            return false;
        }

        if ( l.ui && l.ui.dialog && l.ui.dialog.isShowing() ) {
            return false;
        }

        return true;
    }

    onKeyDown( event ) {
        if ( event.repeat ) {
            return;
        }

        const isInventoryKey = event.key === 'i' || event.key === 'I';

        // Modal already open: Esc / I dismisses (Esc first clears the context menu).
        if ( this.open ) {
            if ( event.key === 'Escape' ) {
                event.preventDefault();
                if ( ! this.menu.hidden ) {
                    this.hideMenu();
                    return;
                }
                this.hide();
                return;
            }

            if ( isInventoryKey ) {
                event.preventDefault();
                this.hide();
            }
            return;
        }

        if ( isInventoryKey && this.canToggleInventory() ) {
            event.preventDefault();
            this.toggleAircraftInventory();
        }
    }

    onClick( event ) {
        // Drop that just finished should not also count as a backdrop click.
        if ( this.suppressClick ) {
            this.suppressClick = false;
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if ( event.target.closest( '[data-action="close-item-screen"]' ) ) {
            this.hide();
            return;
        }

        const menuAction = event.target.closest( '[data-menu]' );
        if ( menuAction ) {
            this.runMenuAction( menuAction.dataset.menu );
            return;
        }

        if ( ! this.menu.hidden && ! event.target.closest( '.item_screen_menu' ) ) {
            this.hideMenu();
        }

        const clickedInside = event.target.closest( '.item_screen_shell' )
            || event.target.closest( '.item_screen_menu' );
        if ( ! clickedInside ) {
            this.hide();
        }
    }

    onContextMenu( event ) {
        const slot = event.target.closest( '.item_slot[data-bag][data-slot]' );
        if ( ! slot || slot.classList.contains( 'empty' ) ) {
            return;
        }

        event.preventDefault();
        this.openMenu( slot.dataset.bag, Number( slot.dataset.slot ), event.clientX, event.clientY );
    }

    onPointerDown( event ) {
        // Right-click is handled by contextmenu.
        if ( event.button === 2 ) {
            return;
        }

        const slot = event.target.closest( '.item_slot[data-bag][data-slot]' );
        if ( ! slot || slot.classList.contains( 'empty' ) ) {
            return;
        }

        const bag = slot.dataset.bag;
        const index = Number( slot.dataset.slot );

        this.selected = { bag, index };
        this.render();
        this.hideMenu();

        // Arm a drag; if the pointer stays still, a long-press opens the menu instead.
        this.drag = {
            pointerId: event.pointerId,
            bag,
            index,
            startX: event.clientX,
            startY: event.clientY,
            active: false,
            ghost: null,
        };

        this.clearLongPress();
        this.longPress = window.setTimeout( () => {
            if ( ! this.drag || this.drag.active ) {
                return;
            }
            this.openMenu( bag, index, this.drag.startX, this.drag.startY );
            this.suppressClick = true;
            this.clearDrag();
        }, LONG_PRESS_MS );

        if ( slot.setPointerCapture ) {
            slot.setPointerCapture( event.pointerId );
        }
    }

    onPointerMove( event ) {
        if ( ! this.drag || this.drag.pointerId !== event.pointerId ) {
            return;
        }

        const dx = event.clientX - this.drag.startX;
        const dy = event.clientY - this.drag.startY;

        // Small wobble still counts as a press; past the threshold we start dragging.
        if ( ! this.drag.active ) {
            if ( Math.hypot( dx, dy ) < DRAG_THRESHOLD ) {
                return;
            }
            this.clearLongPress();
            this.startDragGhost( event.clientX, event.clientY );
            this.drag.active = true;
        }

        if ( this.drag.ghost ) {
            this.drag.ghost.style.left = event.clientX + 'px';
            this.drag.ghost.style.top = event.clientY + 'px';
        }
    }

    onPointerUp( event ) {
        if ( ! this.drag || this.drag.pointerId !== event.pointerId ) {
            return;
        }

        const drag = this.drag;
        this.clearLongPress();

        if ( drag.active ) {
            this.suppressClick = true;

            const underPointer = document.elementFromPoint( event.clientX, event.clientY );
            const dropSlot = underPointer
                && underPointer.closest
                && underPointer.closest( '.item_slot[data-bag][data-slot]' );

            if ( dropSlot ) {
                const fromBag = this.getBag( drag.bag );
                const toBag = this.getBag( dropSlot.dataset.bag );
                if ( fromBag && toBag ) {
                    fromBag.transferTo( drag.index, toBag, Number( dropSlot.dataset.slot ) );
                    this.selected = {
                        bag: dropSlot.dataset.bag,
                        index: Number( dropSlot.dataset.slot ),
                    };
                }
            }

            this.render();
        }

        this.clearDrag();
    }

    onPointerCancel( event ) {
        if ( ! this.drag || this.drag.pointerId !== event.pointerId ) {
            return;
        }
        this.clearLongPress();
        this.clearDrag();
    }

    startDragGhost( x, y ) {
        const bag = this.getBag( this.drag.bag );
        const item = bag && bag.get( this.drag.index );
        if ( ! item ) {
            return;
        }

        const ghost = document.createElement( 'div' );
        ghost.className = 'item_slot_ghost';
        ghost.textContent = this.itemLabel( bag, item );
        ghost.style.left = x + 'px';
        ghost.style.top = y + 'px';
        this.container.appendChild( ghost );
        this.drag.ghost = ghost;
        this.container.classList.add( 'dragging' );
    }

    clearDrag() {
        if ( this.drag && this.drag.ghost && this.drag.ghost.parentNode ) {
            this.drag.ghost.parentNode.removeChild( this.drag.ghost );
        }
        this.drag = null;
        this.container.classList.remove( 'dragging' );
    }

    clearLongPress() {
        if ( this.longPress ) {
            window.clearTimeout( this.longPress );
            this.longPress = null;
        }
    }

    openMenu( bag, index, x, y ) {
        const inventory = this.getBag( bag );
        const item = inventory && inventory.get( index );
        if ( ! item ) {
            return;
        }

        this.menuTarget = { bag, index };
        this.selected = { bag, index };

        const transferButton = this.menu.querySelector( '[data-menu="transfer"]' );
        const splitButton = this.menu.querySelector( '[data-menu="split"]' );
        const neighbour = this.otherBag( bag );
        const neighbourBag = this.getBag( neighbour );

        // Transfer only makes sense when both windows are on screen.
        transferButton.hidden = this.mode !== 'transfer' || ! neighbourBag;
        transferButton.textContent = neighbour === 'hangar'
            ? 'Transfer to hangar'
            : 'Transfer to aircraft';
        splitButton.disabled = inventory.qtyOf( item ) < 2;
        splitButton.hidden = false;

        this.menu.hidden = false;

        const pad = 8;
        const rect = this.menu.getBoundingClientRect();
        const left = Math.min( x, window.innerWidth - rect.width - pad );
        const top = Math.min( y, window.innerHeight - rect.height - pad );
        this.menu.style.left = Math.max( pad, left ) + 'px';
        this.menu.style.top = Math.max( pad, top ) + 'px';

        this.render();
    }

    hideMenu() {
        this.menu.hidden = true;
        this.menuTarget = null;
    }

    runMenuAction( action ) {
        if ( ! this.menuTarget ) {
            this.hideMenu();
            return;
        }

        const { bag, index } = this.menuTarget;
        const inventory = this.getBag( bag );
        if ( ! inventory ) {
            this.hideMenu();
            return;
        }

        if ( action === 'transfer' ) {
            const neighbour = this.getBag( this.otherBag( bag ) );
            if ( neighbour ) {
                inventory.transferToFirstEmpty( index, neighbour );
            }
        }
        else if ( action === 'split' ) {
            inventory.split( index );
        }
        else if ( action === 'delete' ) {
            inventory.remove( index );
            this.selected = null;
        }

        this.hideMenu();
        this.render();
    }

    itemLabel( inventory, item ) {
        if ( ! item ) {
            return 'Empty';
        }
        const qty = inventory ? inventory.qtyOf( item ) : 1;
        return qty > 1 ? ( item.name + ' ×' + qty ) : item.name;
    }

    renderGrid( grid, bag, inventory ) {
        grid.innerHTML = '';
        if ( ! inventory ) {
            return;
        }

        for ( let i = 0; i < inventory.size; i++ ) {
            const item = inventory.get( i );
            const isSelected = this.selected
                && this.selected.bag === bag
                && this.selected.index === i;

            const button = document.createElement( 'button' );
            button.type = 'button';
            button.className = 'item_slot'
                + ( item ? '' : ' empty' )
                + ( isSelected ? ' selected' : '' );
            button.dataset.bag = bag;
            button.dataset.slot = String( i );

            const indexMark = document.createElement( 'span' );
            indexMark.className = 'item_slot_index';
            indexMark.textContent = String( i + 1 );

            const label = document.createElement( 'span' );
            label.className = 'item_slot_label';
            label.textContent = this.itemLabel( inventory, item );

            button.appendChild( indexMark );
            button.appendChild( label );
            grid.appendChild( button );
        }
    }

    renderDetail( el, bag ) {
        if ( this.selected && this.selected.bag === bag ) {
            const inventory = this.getBag( bag );
            const item = inventory ? inventory.get( this.selected.index ) : null;
            el.textContent = item ? this.itemLabel( inventory, item ) : 'Empty slot';
            return;
        }
        el.textContent = 'Empty slot';
    }

    render() {
        if ( this.mode === 'transfer' ) {
            this.renderGrid( this.hangarGrid, 'hangar', this.hangarInventory );
            this.renderDetail( this.hangarDetail, 'hangar' );
        }
        else {
            this.hangarGrid.innerHTML = '';
            this.hangarDetail.textContent = 'Empty slot';
        }

        this.renderGrid( this.aircraftGrid, 'aircraft', this.aircraftInventory );
        this.renderDetail( this.aircraftDetail, 'aircraft' );
    }

}
