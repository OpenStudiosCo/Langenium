/**
 * Shared item instance shape.
 *
 * Crystals carry optional charge / capacity (kW). Other payloads
 * can reuse the same fields later.
 */

export type ItemId = string;

export interface ItemInstance {
    id: ItemId;
    name: string;
    // Stack size. Missing / undefined means 1.
    qty?: number;
    // Stored energy in kW (Langenium crystals).
    charge?: number;
    // Maximum energy in kW.
    capacity?: number;
}
