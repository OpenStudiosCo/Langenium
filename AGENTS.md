# Agent instructions

Guidance for coding agents working in the Langenium repository.

Langenium is a long-running creative and technical project. Its architecture has evolved through experimentation, practical experience and successive generations of implementation.

**Prefer comprehensibility, craftsmanship and collaboration over merely producing code that works.**

The objective is not to produce the most conventional, compact or sophisticated implementation. It is to contribute software that is coherent, understandable, maintainable and appropriate to the world it represents.

An agent should approach this repository as a thoughtful collaborator, not a code generator.

## 1. Engineering philosophy

### Code as architectural storytelling

Treat code as architectural storytelling.

The structure of a system should reveal its essential concepts, responsibilities and relationships. Another developer should be able to understand how something works by exploring the shape of the code itself.

- Name elements after their abstract domain counterparts.
- Organise related concepts into folders that communicate their purpose.
- Prefer structures that make the relationships between elements apparent.
- Write methods that describe meaningful actions rather than implementation mechanics.
- Make important behaviour discoverable through names, structure and composition.
- Choose clarity over cleverness, even when the clever implementation is shorter.

Code should be satisfying to read, not just successful to execute.

### Elemental architecture

Langenium favours an elemental approach to software architecture.

Concepts are composed from smaller, meaningful parts. Their names and responsibilities should reflect the domain they represent.

Do not impose mainstream architectural conventions such as MVC, controllers, services or repositories simply because they are familiar.

Follow the natural boundaries of the domain and the established patterns of the project.

For example, Langenium distinguishes between:

- **Objects** — physical entities, properties and capabilities.
- **Actors** — agency, intent and behaviour.
- **Systems** — specialised behaviours and mechanisms.
- **Routes** — transitions between game modes and experiences.
- **Scenograph** — visual representation and presentation.
- **UI** — interfaces for interaction with the application.

These concepts are more meaningful here than forcing everything into generic models, views and controllers.

The architecture should describe Langenium, not the framework used to implement it.

### Structure with judgment

Good architecture requires judgment rather than conformity.

- Do not introduce abstractions without a meaningful responsibility.
- Avoid thoughtless boilerplate, unnecessary inheritance and speculative generalisation.
- Do not create an interface, manager, service or utility merely to satisfy a design pattern.
- Prefer composition where it makes relationships clearer.
- Extend an existing concept when it naturally accommodates the new responsibility.
- Introduce a new concept when doing so genuinely improves the architecture.

Originality and experimentation are welcome when the result remains coherent and understandable.

**Simplicity does not mean minimal code. It means minimising the effort required to understand the system.**

### Collaboration and continuity

Software quality includes teamwork, transparency and the ability for others to understand and extend a contribution.

Write code for the next developer, including someone encountering the project for the first time.

Assume that future contributors may not have access to the original author's knowledge or context.

- Prefer discoverability over documentation that merely compensates for unclear code.
- Preserve useful architectural knowledge when modifying existing systems.
- Explain non-obvious decisions and trade-offs.
- Avoid dependencies on undocumented assumptions.
- Make the code easier to understand through the contribution.

Knowledge should survive its original author.

### Evolution over conformity

Langenium has evolved over many years. Some conventions represent deliberate architectural decisions; others are remnants of earlier implementations.

Do not confuse historical precedent with architectural intent.

- Respect existing contracts and working behaviour.
- Follow current reference implementations for new work.
- Match local conventions when extending an existing subsystem.
- Recognise technical debt without automatically reproducing it.
- Do not perform unrelated refactoring under the guise of consistency.
- Do not preserve an awkward design merely because it already exists if the task specifically calls for reconsidering it.

The goal is to evolve the software responsibly, not freeze it in time.

## 2. Working principles

### Investigate before implementing

Before writing or modifying code:

1. Inspect the relevant implementation and neighbouring modules.
2. Identify how the existing system is composed and where responsibilities belong.
3. Find the call sites, dependencies, registrations and consumers of the affected functionality.
4. Consult Git history when an architectural decision or unusual convention is unclear.
5. Consider whether the requested change fits an existing concept or warrants a new one.

Do not replace code simply because its structure is unfamiliar.

Do not assume an apparent inconsistency is a mistake without understanding its context.

### Prefer focused changes

Keep changes relevant to the requested work.

- Avoid unrelated refactoring and formatting changes.
- Do not introduce additional architectural layers without a demonstrated need.
- Do not rewrite neighbouring systems to accommodate a small feature unless their existing contracts genuinely prevent it.
- Preserve public interfaces and established behaviour unless a change is intentional.
- Consider the consequences for other parts of the codebase before changing shared abstractions.

A contribution should leave the codebase more coherent, not merely larger.

### Resolve conflicting guidance

When instructions or conventions appear to conflict, use the following priorities:

1. Preserve correct behaviour and established architectural contracts.
2. Respect the responsibilities and composition of the affected subsystem.
3. Follow local conventions when extending an existing family.
4. Prefer the nominated modern reference implementations for new work.
5. Apply broader craftsmanship and formatting preferences where they do not conflict with the above.

When a change requires breaking an existing convention, make the reason explicit.

### Validate and communicate

A change is complete when it has been implemented coherently and verified to a reasonable extent.

- Run relevant available tests, builds or checks.
- Verify the affected integration points, not just the modified function.
- Account for expected edge cases and failure conditions.
- Do not claim to have tested behaviour that has not been tested.
- Report what changed, why it fits the architecture and what remains unverified.
- Identify relevant technical debt without expanding the task to fix everything.

Prefer concise, meaningful explanations over lengthy reports of routine actions.

## 3. Reference implementations

For new work, prefer the conventions demonstrated by:

- `game/src/items/`
- `client/src/app/ui/inventory.js`
- `client/src/app/ui/dialog.js`
- `client/src/styles/overlays/ui/window.styl`
- `client/src/styles/overlays/ui/item_screen.styl`

These represent preferred approaches to domain modelling, client composition, UI organisation and visual presentation.

Prefer them over older menu modules, `TouchControlUI` and `*2` migration leftovers when designing new features.

However, do not mechanically copy these implementations into unrelated subsystems.

Understand the principles they demonstrate and apply those principles where appropriate.

## 4. Repository architecture

### Repository layout

- `client/` — Eleventy / Three.js presentation, including JavaScript, UI, scenograph, templates and styles.
- `game/` — TypeScript domain rules and simulation logic, shared with the client and used selectively by the server.
- `server/` — Express and Socket.IO multiplayer implementation in TypeScript.

Shared domain logic belongs in `game/`.

DOM manipulation, Three.js materials, GLTF loading and presentation-specific behaviour belong in `client/`.

Several existing `game/` modules still access `l`, `window` or the DOM. Selective use by the server does not mean every game module is headless-safe.

Do not assume the multiplayer server has architectural parity with the single-player World implementation.

### Import aliases

Client:

- `@/` resolves to `client/src/app/`.
- `#/` resolves to the repository root.
- Prefer `#/game/src/...` when importing shared game modules from the client.
- Avoid unnecessarily deep relative paths such as `../../../../game/...`.

Server:

- Use relative imports for shared game modules.
- Do not assume the client `#/` alias exists.

Follow the established import approach of the relevant runtime.

## 5. Composition model

### The `l` singleton

The primary client composition root is `window.l`, bridged through `@/helpers/l.js`.

New client subsystems should normally be integrated into the existing composition tree:

- `l.ui.*`
- `l.scenograph.*`
- `l.routes.*`

The current application mode is a string on `l.mode`, not a composed subsystem.

Do not introduce a parallel global application singleton or dependency injection container simply to avoid working with the established architecture.

The composition root is an integration mechanism, not permission for every module to depend on every other module.

Prefer explicit local dependencies where practical while maintaining compatibility with the existing application.

#### String-based callbacks

Some UI and animation callbacks reference methods through string paths into the `l` tree.

For example:

`'l.ui.score_table.update'`

Callbacks may also target `l.scenograph.*` and other branches of the composition tree.

These paths are effectively runtime contracts.

Renaming, relocating or replacing a method without updating its string-based references may cause silent failures.

Search for indirect references before changing public methods or properties.

### Client and game composition

Client classes own Three.js representation and presentation.

Game classes own simulation state and domain behaviour.

The established bridge commonly uses:

- `mesh.userData.object` — game object containing physics, inventory or similar state.
- `mesh.userData.actor` — game actor containing agency, controls or systems.

Hangar is an exception. Its client implementation holds simulation state through `this.objectClass`, rather than `mesh.userData.object`.

This should not be confused with `mesh.userData.objectClass`, which is commonly used as a string tag identifying the type of mesh. The Hangar `objectClass` property references a game object instance.

When extending an existing family, follow its established integration pattern rather than imposing a different one.

For new abstractions, prefer clear ownership and avoid unnecessarily coupling domain behaviour to mesh representation.

### UI and scenograph overlays

The client distinguishes between application UI and scenograph overlays, although not every element follows a strict container boundary.

#### `l.ui`

- Most menus, dialogs and inventory modals live under `#ui_overlay`.
- Application UI commonly uses `l.ui.update_queue`.
- Some UI chrome, including flight instruments, score tables and weapon controls, sits outside the primary overlay containers.
- HUD-adjacent UI can interact with `#game_overlay`; for example, the hangar inventory button may attach there.

#### `l.scenograph.overlays`

- Primarily associated with `#game_overlay`, including elements such as `#hud` and `#map`.
- Commonly uses `l.current_scene.animation_queue`.
- Responsible for scenograph-related HUD elements and in-world presentation.

Preserve the distinction between application interfaces and in-world presentation without assuming that DOM placement alone determines architectural ownership.

Inspect the relevant host, update queue and lifecycle before introducing or relocating overlay behaviour.

Avoid moving UI or HUD responsibilities between subsystems merely to enforce a superficial organisational rule.

### Routes, modes, objects, actors and systems

#### Modes and routes

Modes describe the current application state through `l.mode`.

Known mode strings include:

- `home`
- `hangar`
- `single_player`
- `multi_player`

These are mode values, not route class names.

Routes coordinate transitions into and between experiences.

Existing route classes include:

- `hangarRoute`
- `singlePlayerRoute`
- `multiPlayerRoute`

Their constructors are registered through `l.routes`, including `l.routes.hangar`, `l.routes.singlePlayer` and `l.routes.multiPlayer`. Routes are entered with `new l.routes.hangar()` (and similarly for the others). Some route classes also expose static helpers invoked directly on the constructor.

There is no corresponding `home` route class. Returning home can involve setting `l.mode = 'home'`.

Routes activate the appropriate controls, interfaces and overlays.

They should not become the long-term owners of unrelated simulation state or world meshes.

Distinguish route lifecycle responsibilities from the mode values used to describe application state.

#### Objects

Objects represent physical entities and their properties or capabilities, such as bodies, physics and inventories.

#### Actors

Actors represent agency, intent and behaviour.

Examples include players, pirates and cargo ships.

Actors may attach specialised systems such as weapons and scanners.

#### Systems

Systems encapsulate specialised behaviours and capabilities within the existing object and actor architecture.

Follow the composition and lifecycle patterns established by the relevant implementation. Keep responsibilities clear without imposing an entity-component-system architecture or introducing unnecessary abstraction layers.

Objects, actors and systems are Langenium's own domain concepts, not an invitation to reinterpret the architecture through ECS conventions.

Do not create independent state stores or competing update loops when an existing system already owns that behaviour.

#### Adding world entities

There is no single generic entity pipeline that applies to every object in Langenium.

Before introducing a new world entity, inspect a comparable implementation and identify how it is created, represented and managed.

- `World.loadObject` currently constructs specific supported types, including `person` and `hangar`. New World-loaded entities may require an explicit loader case.
- The director contains explicit branches for selected structures and bots. Entities instantiated through that path may require a new director branch.
- Many models referenced by scene YAML have no corresponding game class.
- Hangar presentation is largely coordinated through its route rather than a generic entity factory.

Do not assume every new entity requires YAML, a game class, a client factory and a director branch.

Introduce only the layers genuinely required by the entity's responsibilities and integration path.

## 6. Elemental mirroring

Mirror concepts across layers rather than insisting on identical filenames.

For example, the inventory concept appears as:

| Layer | Implementation |
|---|---|
| Domain | `game/src/items/` |
| Client UI | `ui/inventory.js` |
| Template | `partials/ui/item_screen.pug` |
| Styles | `overlays/ui/item_screen.styl` |

These elements represent different responsibilities belonging to one conceptual feature.

### UI feature composition

New overlay features should align the relevant:

- Pug template.
- Stylus styling.
- JavaScript behaviour.

Add or modify the necessary layers together when a feature crosses them.

Do not generate unnecessary files when existing infrastructure already provides the required functionality.

Reuse shared `.window` chrome where appropriate.

Prefer semantic `data-*` hooks such as:

- `data-window`
- `data-grid`
- `data-action`

Avoid inventing new ID conventions when a suitable existing convention is available.

### Folder naming reflects context

The client uses:

`scenograph/objects/vehicles/`

This includes representations such as aircraft and people.

The game uses:

`objects/aircraft/`

It also includes a top-level `person.ts`.

Do not introduce `game/src/objects/vehicles/` merely to make the directory structures identical.

Mirroring applies to concepts and responsibilities, not superficial folder symmetry.

### Domain names and presentation metaphors

DOM and CSS may use presentation-oriented names such as `#item_screen`, while the corresponding application class uses a domain-oriented name such as `InventoryUI`.

This is acceptable.

Do not rename working templates, selectors or public interfaces simply to enforce textual consistency.

## 7. Modules and naming

### Module organisation

Prefer default-exported classes for stateful, long-lived subsystems.

Examples:

- `Inventory`
- `InventoryUI`
- `Dialog`

Prefer named function exports for reusable procedures without independent lifecycle or state.

Examples include mathematical operations, material helpers, tweens and particle creation or animation functions.

Choose the module structure that communicates responsibility most clearly.

### Naming conventions

- Use PascalCase domain nouns for new types and classes.
- Use camelCase for method names.
- Prefer story-shaped method names that describe meaningful actions.
- Client UI, template and stylesheet filenames are generally `snake_case`.
- Some game actor files use camelCase, such as `cargoShip.ts`; follow the local family.
- Properties registered on `l` commonly use `snake_case`, even when their classes use PascalCase.

Examples of meaningful method names:

- `transferToFirstEmpty`
- `blocksInput`
- `openAircraftInventory`
- `qtyOf`

Prefer a name that reveals the purpose of a method over a generic description of its mechanics.

Avoid introducing new `Title_Screen`-style underscore class names or lowercase class names such as `hangarRoute`, unless deliberately extending a family that already uses them.

### British English

Use British English in new comments, documentation and commit messages.

Examples:

- `colour`
- `behaviour`
- `finalising`
- `normalise`

Do not rename existing APIs, external interfaces or established domain terminology merely to change spelling.

## 8. Readable logic

Write logic that can be followed naturally from top to bottom.

- Prefer early returns over deeply nested conditions.
- Use descriptive intermediate variables where they reveal intent.
- Separate meaningful stages of an operation.
- Avoid dense one-liners and clever expressions that obscure behaviour.
- Do not compress several independent operations into one statement simply to reduce line count.

Methods should read like a coherent sequence of actions.

### Failure handling

Use early returns for expected absence, invalid input and recoverable conditions.

Do not silently conceal programming errors or broken architectural assumptions.

- Return `false` or `null` when those values meaningfully represent the operation's outcome.
- Use exceptions when failures must be propagated or explicitly recovered from.
- Avoid defensive try/catch boilerplate that adds no meaningful recovery.
- Do not allow an invalid state to masquerade as successful execution.

Failure handling should be proportionate to the responsibility of the code.

### Comments and documentation

Prefer comments that explain intent, context or a non-obvious decision.

Useful comments describe:

- Why an implementation exists.
- How a particular stage relates to the larger operation.
- An architectural constraint or dependency.
- A non-obvious domain rule.
- A known limitation or deliberate compromise.

Avoid comments that merely repeat the next line of code.

Client modules that already use documentation headers should preserve:

- `@name`
- `@description`
- `@namespace`
- `@memberof`

Game TypeScript commonly uses plain prose stage headers.

Follow the relevant local convention.

**Code should explain what it does. Comments should explain why it does it.**

## 9. Formatting

Match the surrounding first-party code.

Common conventions include:

- Four-space indentation.
- Single quotes.
- Semicolons.
- Spaces inside parentheses.
- Spaces after unary `!`.
- Strict equality (`===`) in new code.

Examples:

```ts
if ( ! item ) {
    return false;
}

const inventory = ( actor.inventory || null );
```

Use the project's established spacing rather than automatically applying generic formatter defaults.

Do not reformat unrelated code as part of a functional change.

### Example: readable operations

Avoid compact implementations that obscure the operation:

```ts
const swap = (a,b,i,j)=>{const x=a.slots[i];a.slots[i]=b.slots[j];b.slots[j]=x;};
```

Prefer code that communicates the operation through its structure:

```ts
swapWith( fromIndex: number, toInventory: Inventory, toIndex: number ): void {
    const fromItem = this.slots[ fromIndex ];
    const toItem = toInventory.slots[ toIndex ];

    this.slots[ fromIndex ] = toItem;
    toInventory.slots[ toIndex ] = fromItem;
}
```

This example illustrates readability and naming, not a complete validated inventory operation. Real implementations should preserve the relevant slot validation and domain rules.

### Stylus

New overlay styles should follow the indented Stylus approach used by:

- `dialog.styl`
- `window.styl`
- `item_screen.styl`

Avoid reproducing older brace-based formatting from parent stylesheets when creating new overlay features.

## 10. Historical architecture and legacy systems

Langenium contains multiple generations of implementation.

These coexist for historical and practical reasons.

Do not automatically normalise them during unrelated work.

Historical implementations are useful for understanding why the code evolved, but removed architectures should not be treated as precedents for new work. Git history provides context, not architectural authority.

### Actor generations

The repository includes two existing actor families with different composition and ownership patterns.

#### Mesh-coupled vehicle actors

Examples include:

- `actors/base.ts`
- `player.ts`
- Pirate and cargo ship actors.

These are typically coupled to mesh-based representations through `mesh.userData.actor`.

#### World-driven person actors

Examples include:

- `base2.ts`
- `player2.ts`
- `objects/person.ts`

These follow the World-driven person architecture.

Both actor families may create or use YUKA entities. YUKA usage is not the defining distinction between them.

Extend the architectural family already used by the relevant sibling.

Do not invent a `*3` generation merely to avoid understanding the existing implementations.

For genuinely new simulation work, evaluate which existing architecture best supports the intended behaviour rather than selecting a path solely because it contains more examples.

Architectural consolidation should be deliberate, not incidental.

### Module generations

Prefer ESM `export default` for new game modules where a default class export is appropriate.

Some older modules still use `module.exports`.

When modifying these modules, preserve compatibility with their existing consumers and neighbouring conventions.

Do not perform incidental module-system migrations.

### Legacy UI

Leave existing `TouchControlUI`, `Title_Screen`, `Flight_Instruments` and similar legacy conventions alone unless the requested work explicitly involves replacing or modernising them.

New work should generally follow the nominated modern reference implementations instead.

### Shared game coupling

Although `game/` is conceptually shared, some existing modules still access:

- `l`
- `window`
- DOM APIs.

Treat this as historical coupling rather than a desirable requirement for new shared logic.

Where practical, new domain and simulation code should remain independent of browser globals and rendering APIs.

When modifying a historically coupled module, preserve compatibility and identify unavoidable coupling as technical debt.

Do not attempt sweeping decoupling as part of unrelated work.

## 11. Object registry conventions

`l.scenograph.objects` contains a mixture of pre-constructed instances and classes instantiated at their use sites.

For example, some structures are registered as instances, while objects such as `valiant` and `person` are registered as classes.

Before adding a new registration:

1. Inspect the closest comparable object.
2. Determine whether the registry expects an instance or a constructor.
3. Identify where construction and lifecycle ownership occur.
4. Follow the appropriate pattern for that object family.

Do not assume a single uniform registry contract where none currently exists.

## 12. Interactive and real-time systems

Langenium is an interactive 3D application. The quality of the implementation includes its runtime behaviour, responsiveness and maintainability.

### Respect runtime ownership

Understand which subsystem owns an update loop, animation queue or lifecycle before introducing new behaviour.

- Avoid competing update loops for the same responsibility.
- Do not attach repeated listeners or schedule repeated work without considering cleanup.
- Avoid unnecessary work inside frequently executed update paths.
- Preserve appropriate separation between simulation state and visual representation.
- Consider object creation, disposal and resource ownership when modifying Three.js functionality.

Do not introduce elaborate optimisation machinery without a demonstrated need.

### Prefer understandable performance

Performance matters, but optimisations should remain comprehensible.

- Prefer straightforward algorithms and sensible resource use.
- Measure or establish a plausible bottleneck before adding complexity.
- Keep performance-sensitive code understandable through naming and composition.
- Explain trade-offs where a less obvious implementation is genuinely necessary.

A theoretically faster implementation is not automatically better if its complexity makes further development difficult.

### Preserve the player's experience

When modifying gameplay or interfaces, consider the complete interaction rather than only the underlying function.

Changes should account for relevant controls, visual feedback, input states, transitions and cleanup.

Do not assume a feature is complete merely because the domain operation succeeds.

Where applicable, validate its behaviour in the client.

## 13. Experimentation and maintainability

Langenium is also a place for technical exploration.

Novel approaches are welcome, particularly when they enable new gameplay, richer worlds or better ways of representing complex systems.

Experimentation should remain intentional.

- Understand the limitation a new approach is intended to overcome.
- Prefer contained experiments over speculative architectural rewrites.
- Avoid adding dependencies when existing capabilities already provide a suitable solution.
- Keep experimental decisions understandable and reversible where practical.
- Document discoveries that would help future contributors.

Do not reject an approach merely because it is unconventional.

Equally, do not adopt an approach solely because it is new or fashionable.

The best solution is the one that serves the project and remains practical to maintain.

## 14. Completing a contribution

Before considering work complete, review the contribution against the following questions.

**Architecture**

- Does the change belong in the subsystem where it was implemented?
- Does it respect existing ownership and lifecycle responsibilities?
- Does it reuse appropriate concepts without introducing competing abstractions?
- Have relevant integration points and indirect references been checked?

**Craftsmanship**

- Can another developer understand the implementation from its structure and names?
- Are the important decisions discoverable?
- Is the logic easy to follow?
- Does the contribution avoid unnecessary complexity?

**Behaviour**

- Does the change satisfy the requested behaviour?
- Are relevant edge cases and failure conditions handled?
- Have appropriate checks or tests been run?
- Has the surrounding functionality been considered?

**Collaboration**

- Is the change focused and understandable?
- Have any significant trade-offs or limitations been explained?
- Has existing behaviour been preserved where required?
- Is the codebase left in a state that another contributor can confidently continue working with?

Summarise meaningful changes and any unverified behaviour at the end of the task.

Do not manufacture confidence, unnecessary documentation or additional work to make a contribution appear more substantial.

---

## Guiding principle

Langenium should be understandable not only as a collection of functions and classes, but as a coherent world of interacting concepts.

Its architecture should reflect the things it represents, its code should communicate its intentions, and its development should preserve knowledge for the people who build upon it.

**Build software that works, makes sense, and is worth continuing.**