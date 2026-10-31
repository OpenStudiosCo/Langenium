/**
 * Aircraft hangar.
 *
 * Layout, AABB containment and design components only.
 */

import ObjectBase from '../base';

import { AABB } from '../types';

class Hangar extends ObjectBase {

    // Walkable room volumes.
    public aabb: AABB[];

    // Solid prop volumes that block walking.
    public obstacles: AABB[];

    // Hangar component configuration.
    public design: any;

    constructor(config = {}) {
        super(); // Call the constructor of the base class

        if (config.design) {
            this.design = this.getDesign(config.design);
        } else {
            this.design = this.getDesign();
        }
        if (config.position) {
            this.position.x = config.position.x;
            this.position.y = config.position.y;
            this.position.z = config.position.z;
        }
        if (config.rotation) {
            this.rotation.x = config.rotation.x;
            this.rotation.y = config.rotation.y;
            this.rotation.z = config.rotation.z;
        }

        this.aabb = this.getWalkableAABBs();
        this.obstacles = this.getObstacleAABBs();
    }

    detectCollision ()  {
    }

    getDesign( designIndex = 0 ) {
        const designs = [
          {
            name: 'Bay with quarters',
            size: 5,
            components: [
              {
                  name: 'Main Bay',
                  width: 10,
                  height: 5,
                  depth: 10,
                  position: {
                      x: 0,
                      y: 0,
                      z: 0
                  },
                  rotation: {
                      x: 0,
                      y: 0,
                      z: 0
                  }
              },
              {
                  name: 'Quarters',
                  width: 5,
                  height: 2.5,
                  depth: 5,
                  position: {
                      x: -8.375,
                      y: -1.25,
                      z: -2.5
                  },
                  rotation: {
                      x: 0,
                      y: 0,
                      z: 0
                  }
              },
              {
                // Depth is the walkable hallway width (30% wider than 1.25).
                // Width/X is extended and nudged so the walkable AABB bridges
                // Main Bay and Quarters — the old box left a gap the person
                // halfSize could not cross under containment.
                name: 'Corridor',
                width: 3.5,
                height: 2.55,
                depth: 1.625,
                position: {
                    x: -5.25,
                    y: -1.225,
                    z: -1.25
                },
                rotation: {
                    x: 0,
                    y: 0, // 90 degrees or half pi
                    z: 0
                }
              },
              {
                  // Obstacle box must cover standing player height: design Y sits
                  // near the pedestal base, so height is authored tall enough that
                  // the AABB overlaps person halfSize on Y as well as XZ.
                  name: 'Terminal',
                  walkable: false,
                  width: 1.15,
                  height: 3,
                  depth: 1.15,
                  position: {
                      x: -4.5,
                      y: -1.85,
                      z: 2.5
                  },
                  rotation: {
                      x: 0,
                      y: Math.PI / 2,
                      z: 0
                  }
              }
            ]
          }
        ];
        return designs[designIndex];
    }

    /**
     * Walkable room volumes (components that are not marked walkable: false).
     */
    public getWalkableAABBs(): AABB[] {
        return this.getComponentAABBs( ( component ) => component.walkable !== false );
    }

    /**
     * Solid prop volumes that block walking.
     */
    public getObstacleAABBs(): AABB[] {
        return this.getComponentAABBs( ( component ) => component.walkable === false );
    }

    /**
     * Returns world-space AABBs for design components matching the filter.
     * Yaw turns local offsets onto the same side as the mesh. Both bays
     * face along Z, so the box sizes stay as authored.
     */
    public getComponentAABBs( filter?: ( component: any ) => boolean ): AABB[] {
        const cos = Math.cos( this.rotation.y || 0 );
        const sin = Math.sin( this.rotation.y || 0 );
        const components = filter
            ? this.design.components.filter( filter )
            : this.design.components;

        return components.map( component => {
            const halfSize = {
                x: component.width,
                y: component.height,
                z: component.depth
            };
            const localX = component.position.x * 2.5;
            const localZ = component.position.z * 2.5;

            const worldPos = {
                x: this.position.x + localX * cos + localZ * sin,
                y: this.position.y + component.position.y * 2.5,
                z: this.position.z - localX * sin + localZ * cos
            };

            return {
                min: {
                    x: worldPos.x - halfSize.x,
                    y: worldPos.y - halfSize.y,
                    z: worldPos.z - halfSize.z
                },
                max: {
                    x: worldPos.x + halfSize.x,
                    y: worldPos.y + halfSize.y,
                    z: worldPos.z + halfSize.z
                }
            };
        });
    }

}

module.exports = Hangar;
