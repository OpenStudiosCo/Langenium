/**
 * Aircraft hangar.
 */

import ObjectBase from '../base';

import { AABB } from '../types';

class Hangar extends ObjectBase {

    // axis aligned bounding box
    public aabb: AABB;

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

        this.aabb = this.getComponentAABBs();
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
                name: 'Corridor',
                width: 2.5,
                height: 2.55,
                depth: 1.25,
                position: {
                    x: -5,
                    y: -1.225,
                    z: -1.25
                },
                rotation: {
                    x: 0,
                    y: 0, // 90 degrees or half pi
                    z: 0
                }
              },
            ]
          }
        ];
        return designs[designIndex];
    }

    /**
     * Returns world-space AABBs for all solid components
     */
    public getComponentAABBs(): AABB[] {
        return this.design.components.map(component => {
            const halfSize = {
                x: component.width,
                y: component.height,
                z: component.depth
            };

            const worldPos = {
                x: this.position.x + component.position.x * 2.5,
                y: this.position.y + component.position.y * 2.5,
                z: this.position.z + component.position.z  * 2.5
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
