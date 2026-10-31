/**
 * @name            InventoryEvents
 * @description     Click, keyboard, pointer select, long-press and drag handlers
 * @namespace       l.ui.inventory.events
 * @memberof        l.ui.inventory
 */

import l from '@/helpers/l.js';

const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD = 8;

/**
 * DOM event story for the storage modal: chrome clicks, keyboard toggle,
 * and slot select → long-press menu or drag to another slot.
 * Owns drag / long-press / suppressClick state; mutates parent selection
 * and calls parent intents / menu / contents.
 */
export default class InventoryEvents {

    ui;
    drag;
    longPress;
    suppressClick;

    constructor( ui ) {
        this.ui = ui;
        this.drag = null;
        this.longPress = null;
        this.suppressClick = false;
    }

    /**
     * [I] is live in person mode (hangar / indoors), and in flight once
     * the player is piloting with game controls on.
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

        if ( ! this.ui.intents.getAircraftInventory() ) {
            return false;
        }

        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;

        if ( player && player.mode === 'person' ) {
            return true;
        }

        if ( l.mode !== 'single_player' && l.mode !== 'multi_player' ) {
            return false;
        }

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
        if ( this.ui.open ) {
            if ( event.key === 'Escape' ) {
                event.preventDefault();
                if ( ! this.ui.menu.hidden ) {
                    this.ui.menuUI.hide();
                    return;
                }
                this.ui.hide();
                return;
            }

            if ( isInventoryKey ) {
                event.preventDefault();
                this.ui.hide();
            }
            return;
        }

        if ( isInventoryKey && this.canToggleInventory() ) {
            event.preventDefault();
            this.ui.toggleAircraftInventory();
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
            this.ui.hide();
            return;
        }

        const menuAction = event.target.closest( '[data-menu]' );
        if ( menuAction ) {
            this.ui.menuUI.runAction( menuAction.dataset.menu );
            return;
        }

        if ( ! this.ui.menu.hidden && ! event.target.closest( '.item_screen_menu' ) ) {
            this.ui.menuUI.hide();
        }

        const clickedInside = event.target.closest( '.item_screen_shell' )
            || event.target.closest( '.item_screen_menu' );
        if ( ! clickedInside ) {
            this.ui.hide();
        }
    }

    onContextMenu( event ) {
        const slot = event.target.closest( '.item_slot[data-bag][data-slot]' );
        if ( ! slot || slot.classList.contains( 'empty' ) ) {
            return;
        }

        event.preventDefault();
        this.ui.menuUI.open( slot.dataset.bag, Number( slot.dataset.slot ), event.clientX, event.clientY );
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

        this.ui.selected = { bag, index };
        this.ui.contents.render();
        this.ui.menuUI.hide();

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
            this.ui.menuUI.open( bag, index, this.drag.startX, this.drag.startY );
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
                const fromBag = this.ui.intents.getBag( drag.bag );
                const toBag = this.ui.intents.getBag( dropSlot.dataset.bag );
                if ( fromBag && toBag ) {
                    this.ui.intents.transferSlot(
                        fromBag,
                        drag.index,
                        toBag,
                        Number( dropSlot.dataset.slot )
                    );
                    this.ui.selected = {
                        bag: dropSlot.dataset.bag,
                        index: Number( dropSlot.dataset.slot ),
                    };
                }
            }

            this.ui.contents.render();
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
        const bag = this.ui.intents.getBag( this.drag.bag );
        const item = bag && bag.get( this.drag.index );
        if ( ! item ) {
            return;
        }

        const ghost = document.createElement( 'div' );
        ghost.className = 'item_slot_ghost';
        this.ui.contents.fillSlotContents( ghost, bag, item );
        ghost.style.left = x + 'px';
        ghost.style.top = y + 'px';
        this.ui.container.appendChild( ghost );
        this.drag.ghost = ghost;
        this.ui.container.classList.add( 'dragging' );
    }

    clearDrag() {
        if ( this.drag && this.drag.ghost && this.drag.ghost.parentNode ) {
            this.drag.ghost.parentNode.removeChild( this.drag.ghost );
        }
        this.drag = null;
        this.ui.container.classList.remove( 'dragging' );
    }

    clearLongPress() {
        if ( this.longPress ) {
            window.clearTimeout( this.longPress );
            this.longPress = null;
        }
    }

}
