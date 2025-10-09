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
import Refinery from "@/scenograph/objects/structures/refinery";

// Vehicles
import CargoShip from "@/scenograph/objects/vehicles/cargo_ship";
import Person from "@/scenograph/objects/vehicles/person";
import Raven from "@/scenograph/objects/vehicles/raven";
import Valiant from "@/scenograph/objects/vehicles/valiant";

export default class Objects {

    environment = false;
    preloader = false;
    projectiles = false;
    structures = false;
    vehicles = false;

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
            missile: new Missile()
        };
        this.structures = {
            extractor: new Extractor(),
            hangar: new Hangar(),
            platform: new Platform(),
            refinery: new Refinery(),
        };
        this.vehicles = {
            cargoShip: CargoShip,
            person: Person,
            raven: Raven,
            valiant: Valiant,
        };
      
    }

    /**
     * @todo: Conditionally switching off loading some objects on scenes where not needed.
     */
    async init () {
        await this.structures.extractor.load();
        await this.structures.platform.load();
        await this.structures.refinery.load();
        await this.projectiles.missile.load();
        //await this.vehicles.cargoShip.load();
        console.log("Objects loaded");
    }

    /**
     * Animate hook.
     * 
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Objects
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( currentTime ) {
        l.scenograph.objects.structures.extractor.animate( currentTime );
        l.scenograph.objects.structures.platform.animate( currentTime );
        l.scenograph.objects.structures.refinery.animate( currentTime );
        l.scenograph.objects.projectiles.missile.animate( currentTime );
    }

}
