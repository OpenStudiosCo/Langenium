/**
 * Objects.
 * 
 * Composes scene meshes from gltf and procedural code.
 */

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers
 */
import l from '@/helpers/l.js';


/**
 * Objects
 */

// Environment
import Ocean from "@/scenograph/objects/environment/ocean";
import Sky from "@/scenograph/objects/environment/sky";
import Sky2 from "@/scenograph/objects/environment/sky2";

/**
 * Preloader objects
 */
import { createDoor, createOfficeRoom, doorHeight, doorWidth } from "@/scenograph/objects/structures/office_room";

// Projectiles
import Missile from "@/scenograph/objects/projectiles/missile";

// Structures
import Extractor from "@/scenograph/objects/structures/extractor";
import Hangar from "@/scenograph/objects/structures/hangar";
import Platform from "@/scenograph/objects/structures/platform";
import Refineries from "@/scenograph/objects/structures/refineries";

// Vehicles
import CargoShip from "@/scenograph/objects/vehicles/cargo_ship";
import Person from "@/scenograph/objects/vehicles/person";
import Raven from "@/scenograph/objects/vehicles/raven";
import Valiant from "@/scenograph/objects/vehicles/valiant";

export default class Objects {

    this.environment = false;
    this.preloader = false;
    this.projectiles = false;
    this.structures = false;
    this.vehicles = false;

    constructor() {
        this.environment = {
            ocean: Ocean,
            sky: Sky,
        };
        this.preloader = {
            createDoor: createDoor,
            createOfficeRoom: createOfficeRoom,
            doorHeight: doorHeight,
            doorWidth: doorWidth,
        };
        this.projectiles = {
            missile: Missile
        };
        this.structures = {
            extractor: Extractor,
            hangar: Hangar,
            platform: Platform,
            refineries: Refineries,
        };
        this.vehicles = {
            cargoShip: CargoShip,
            person: Person,
            raven: Raven,
            valiant: Valiant,
        };
      
    }

}
