/**
 * Shared item instance shape.
 */

export type ItemId = string;

export interface ItemInstance {
    id: ItemId;
    name: string;
    // Stack size. Missing / undefined means 1.
    qty?: number;
    // Stored energy in kW.
    charge?: number;
    // Maximum energy in kW.
    capacity?: number;
}
