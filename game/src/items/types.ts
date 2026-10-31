/**
 * Shared item instance shape.
 *
 * Stage 1: slots may be empty (null). Fuel cells and other
 * typed payloads land in a later stage.
 */

export type ItemId = string;

export interface ItemInstance {
    id: ItemId;
    name: string;
    // Stack size. Missing / undefined means 1.
    qty?: number;
}
