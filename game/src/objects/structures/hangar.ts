/**
 * Aircraft hangar.
 */

import ObjectBase from '../base';

class Hangar extends ObjectBase {

    // Hangar component configuration.
    design;

    constructor(config = {}) {
        super(); // Call the constructor of the base class

        let corridorScale = 0.125;
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
                width: 1.025,
                height: 2.55,
                depth: 2.5,
                position: {
                    x: -5,
                    y: -1.225,
                    z: -1.25
                },
                rotation: {
                    x: 0,
                    y: 1.5708, // 90 degrees or half pi
                    z: 0
                }
              },
            ]
          }
        ];
        return designs[designIndex];
    }

}

module.exports = Hangar;
