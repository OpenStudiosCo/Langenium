/**
 * @name            GameLog
 * @description     Session feed for events and dialog; compact overlay shows events only
 * @namespace       l.ui.gameLog
 * @memberof        l.ui
 * @global
 */

import { formatPower } from '#/game/src/items/langeniumCrystal';
import { itemIconUrl } from '@/ui/item_icon.js';

const MAX_ENTRIES = 10000;

export default class GameLog {

    entries;
    nextId;
    compactRoot;
    compactFeed;
    fullRoot;
    fullBody;
    fullTabs;
    stickToBottom;
    activeTab;

    constructor() {
        this.entries = [];
        this.nextId = 1;
        this.stickToBottom = true;
        this.activeTab = 'events';

        this.compactRoot = document.querySelector( '#game_log' );
        this.compactFeed = this.compactRoot
            ? this.compactRoot.querySelector( '[data-game-log="feed"]' )
            : null;
        this.fullRoot = document.querySelector( '#game_log_full' );
        this.fullBody = this.fullRoot
            ? this.fullRoot.querySelector( '[data-game-log="full"]' )
            : null;
        this.fullTabs = this.fullRoot
            ? this.fullRoot.querySelectorAll( '[data-log-tab]' )
            : [];

        if ( this.compactRoot ) {
            this.compactRoot.addEventListener( 'click', ( event ) => {
                if ( event.target.closest( '[data-action="open-game-log"]' ) ) {
                    this.openFull();
                }
            } );
        }

        if ( this.compactFeed ) {
            this.compactFeed.addEventListener( 'scroll', () => {
                this.stickToBottom = this.isPinnedToBottom( this.compactFeed );
            } );
        }

        if ( this.fullRoot ) {
            this.fullRoot.addEventListener( 'click', ( event ) => {
                const tab = event.target.closest( '[data-log-tab]' );
                if ( tab ) {
                    this.setTab( tab.dataset.logTab );
                    return;
                }
                if ( event.target.closest( '[data-action="close-game-log"]' ) ) {
                    this.hideFull();
                    return;
                }
                if ( ! event.target.closest( '.game_log_full_frame' ) ) {
                    this.hideFull();
                }
            } );
        }

        document.addEventListener( 'keydown', ( event ) => {
            if ( event.key !== 'Escape' || ! this.isFullOpen() ) {
                return;
            }
            event.preventDefault();
            this.hideFull();
        } );
    }

    /**
     * Dialog / narration — modal Messages + All only (not the compact overlay).
     */
    appendText( text ) {
        this.appendMessage( text );
    }

    appendMessage( text ) {
        const trimmed = ( text || '' ).toString().trim();
        if ( ! trimmed ) {
            return;
        }

        this.pushEntry( {
            channel: 'message',
            kind: 'text',
            plain: trimmed,
            build: ( row ) => {
                row.appendChild( document.createTextNode( trimmed ) );
            },
        } );
    }

    /**
     * Plain gameplay event for the compact overlay and Events / All tabs.
     */
    appendEvent( text ) {
        const trimmed = ( text || '' ).toString().trim();
        if ( ! trimmed ) {
            return;
        }

        this.pushEntry( {
            channel: 'event',
            kind: 'text',
            plain: trimmed,
            build: ( row ) => {
                row.appendChild( document.createTextNode( trimmed ) );
            },
        } );
    }

    /**
     * Item event with icon, bold qty+name, and optional power / suffix.
     *
     * @param {string} verb e.g. Picked up / Deleted / Transferred
     * @param {object} item inventory item snapshot
     * @param {number} [qty]
     * @param {string} [suffix] trailing plain text (e.g. "to hangar")
     */
    appendItemEvent( verb, item, qty, suffix ) {
        if ( ! item || ! item.name ) {
            return;
        }

        const count = qty === undefined
            ? ( item.qty === undefined ? 1 : Math.max( 1, Math.floor( item.qty ) ) )
            : Math.max( 1, Math.floor( qty ) );
        const emphasis = 'x' + count + ' ' + item.name;
        const power = formatPower( item );
        const iconUrl = itemIconUrl( item );
        const suffixText = suffix ? String( suffix ) : '';

        let plain = verb + ' ' + emphasis;
        if ( power ) {
            plain += ' ' + power;
        }
        if ( suffixText ) {
            plain += ' ' + suffixText;
        }

        this.pushEntry( {
            channel: 'event',
            kind: 'item',
            plain,
            build: ( row ) => {
                row.appendChild( document.createTextNode( verb + ' ' ) );

                if ( iconUrl ) {
                    const icon = document.createElement( 'img' );
                    icon.className = 'game_log_icon';
                    icon.src = iconUrl;
                    icon.alt = '';
                    icon.width = 16;
                    icon.height = 16;
                    icon.style.width = '1em';
                    icon.style.height = '1em';
                    icon.style.maxWidth = '1em';
                    icon.style.maxHeight = '1em';
                    icon.style.objectFit = 'contain';
                    icon.style.verticalAlign = 'baseline';
                    row.appendChild( icon );
                }

                const strong = document.createElement( 'strong' );
                strong.className = 'game_log_emphasis';
                strong.textContent = emphasis;
                row.appendChild( strong );

                if ( power ) {
                    row.appendChild( document.createTextNode( ' ' + power ) );
                }
                if ( suffixText ) {
                    row.appendChild( document.createTextNode( ' ' + suffixText ) );
                }
            },
        } );
    }

    openFull() {
        if ( ! this.fullRoot ) {
            return;
        }
        this.fullRoot.hidden = false;
        this.setTab( this.activeTab || 'events' );
        const close = this.fullRoot.querySelector( '[data-action="close-game-log"]' );
        if ( close ) {
            close.focus();
        }
    }

    hideFull() {
        if ( ! this.fullRoot ) {
            return;
        }
        this.fullRoot.hidden = true;
    }

    isFullOpen() {
        return !! this.fullRoot && ! this.fullRoot.hidden;
    }

    setTab( tab ) {
        const next = tab === 'messages' || tab === 'all' ? tab : 'events';
        this.activeTab = next;

        for ( const button of this.fullTabs ) {
            const selected = button.dataset.logTab === next;
            button.classList.toggle( 'is-active', selected );
            button.setAttribute( 'aria-selected', selected ? 'true' : 'false' );
        }

        this.renderFull();
    }

    /**
     * Compact feed follows session chrome — hidden on title / boot, shown in-game.
     */
    setVisible( visible ) {
        if ( ! this.compactRoot ) {
            return;
        }
        this.compactRoot.hidden = ! visible;
        if ( ! visible ) {
            this.hideFull();
        }
    }

    /**
     * Wipe the session feed so the next playthrough starts empty.
     */
    clear() {
        this.entries = [];
        this.nextId = 1;
        this.stickToBottom = true;

        if ( this.compactFeed ) {
            this.compactFeed.textContent = '';
        }
        if ( this.fullBody ) {
            this.fullBody.textContent = '';
        }

        this.hideFull();
    }

    pushEntry( spec ) {
        const entry = {
            id: this.nextId++,
            channel: spec.channel === 'message' ? 'message' : 'event',
            kind: spec.kind,
            plain: spec.plain,
            build: spec.build,
            at: Date.now(),
        };

        this.entries.push( entry );
        if ( this.entries.length > MAX_ENTRIES ) {
            this.entries.splice( 0, this.entries.length - MAX_ENTRIES );
            this.renderCompact( true );
            if ( this.isFullOpen() ) {
                this.renderFull();
            }
            return;
        }

        if ( entry.channel === 'event' ) {
            this.appendRow( this.compactFeed, entry, true );
        }
        if ( this.isFullOpen() && this.matchesTab( entry, this.activeTab ) ) {
            this.appendRow( this.fullBody, entry, false );
            this.scrollToBottom( this.fullBody );
        }
    }

    matchesTab( entry, tab ) {
        if ( tab === 'all' ) {
            return true;
        }
        if ( tab === 'messages' ) {
            return entry.channel === 'message';
        }
        return entry.channel === 'event';
    }

    renderCompact( force ) {
        if ( ! this.compactFeed ) {
            return;
        }
        const pin = force || this.stickToBottom;
        this.compactFeed.textContent = '';
        for ( const entry of this.entries ) {
            if ( entry.channel !== 'event' ) {
                continue;
            }
            this.appendRow( this.compactFeed, entry, false );
        }
        if ( pin ) {
            this.scrollToBottom( this.compactFeed );
            this.stickToBottom = true;
        }
    }

    renderFull() {
        if ( ! this.fullBody ) {
            return;
        }
        this.fullBody.textContent = '';
        for ( const entry of this.entries ) {
            if ( ! this.matchesTab( entry, this.activeTab ) ) {
                continue;
            }
            this.appendRow( this.fullBody, entry, false );
        }
        this.scrollToBottom( this.fullBody );
    }

    appendRow( host, entry, autoScroll ) {
        if ( ! host || ! entry || ! entry.build ) {
            return;
        }

        const row = document.createElement( 'p' );
        row.className = 'game_log_entry';
        row.dataset.logId = String( entry.id );
        row.dataset.logChannel = entry.channel;
        entry.build( row );
        host.appendChild( row );

        if ( autoScroll && ( host !== this.compactFeed || this.stickToBottom ) ) {
            this.scrollToBottom( host );
        }
    }

    isPinnedToBottom( element ) {
        if ( ! element ) {
            return true;
        }
        const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
        return remaining <= 8;
    }

    scrollToBottom( element ) {
        if ( ! element ) {
            return;
        }
        element.scrollTop = element.scrollHeight;
    }

}
