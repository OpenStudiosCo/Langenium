/**
 * Aircraft hangar.
 */

import BaseStructure from './base';

class Hangar extends BaseStructure {

    designs;

    constructor() {
      super(); // Call the constructor of the base class

      let corridorScale = 0.125;
      this.designs = [
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
    }

    detectCollision ()  {
    }

}

module.exports = Hangar;
