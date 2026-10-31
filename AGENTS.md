# Agent instructions

Guidance for any coding agent working in this repository. Prefer comprehensibility and collaboration over “it works.” Match the craft and style below on every change.

## Code craftsmanship

- Treat code as architectural storytelling. Structures should reveal the system’s essence so another developer can fathom how it works from the shape of the code itself.
- Name elements after their abstract domain counterparts. Encapsulate related pieces in folders that mirror those names (the elemental approach used throughout this project).
- Do not force mainstream dogmas (for example MVC) when the domain wants a different shape. Follow established Langenium patterns first; invent only when a novel structure fits the domain better than a stock pattern.
- Balance structure with judgment. Avoid over-conformity and thoughtless boilerplate. Originality is welcome when it stays clear and coherent.
- Software quality here means teamwork and transparency as much as correct behaviour. Write so others can decipher and appreciate the contribution.

## Langenium style

### Layout

- `client/` — Eleventy / Three.js web client (UI, scenograph, templates, styles)
- `game/` — shared game rules and domain logic used by client and server
- `server/` — Express multiplayer server

Put shared domain logic in `game/`. Mirror concept names across layers (for example `items` → UI → templates → styles).

### Naming and structure

- Domain nouns for types and classes: `Inventory`, `InventoryUI`, `Hangar`, `Person`.
- Method names that read as story: `transferToFirstEmpty`, `blocksInput`, `openAircraftInventory`, `qtyOf`.
- Before inventing structure, find an existing elemental folder or class and extend it rather than introducing a parallel convention.

### Readable logic

- Prefer early returns, named intermediates, and room to breathe.
- Avoid dense one-liners and clever nesting that hide the narrative.
- Short “why / stage / story” comments at file and non-obvious method level — not noise on every line.

### Formatting

- Match surrounding files. Common local habit: spaces inside parentheses and after unary `!` (`if ( ! item )`, `( ItemInstance | null )`).
- When extending client JS modules that use `@name` / `@description` / `@namespace` headers, preserve that style.

### Example

```ts
// Bad — compacted, opaque
const move = (a,b,i,j)=>{const x=a.slots[i];a.slots[i]=b.slots[j];b.slots[j]=x;return!!x||!!b.slots[i]};

// Good — semantic names, clear steps, story intact
transferTo( fromIndex: number, toInventory: Inventory, toIndex: number ): boolean {
    if ( fromIndex < 0 || fromIndex >= this.slots.length ) {
        return false;
    }
    if ( toIndex < 0 || toIndex >= toInventory.slots.length ) {
        return false;
    }

    const fromItem = this.slots[ fromIndex ];
    const toItem = toInventory.slots[ toIndex ];
    this.slots[ fromIndex ] = toItem;
    toInventory.slots[ toIndex ] = fromItem;
    return true;
}
```
