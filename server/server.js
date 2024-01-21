/**
 * Langenium Server
 * 
 * Version: 6
 */

const Modules = require('./src/modules');
const Instance = require('./src/instance');

let server = {};

server.start = () => {
  this.modules = new Modules();
  this.instance = new Instance( this.modules );

  // @todo: Implement some kind of storage system for scene configs.
  let defaultOverworldScene = {
    _id: new Date().getTime(),
    name: 'Overworld',
    description: 'The main outdoor scene',
    environment: 'outdoor'
  };
  this.instance.create(defaultOverworldScene, function(index) {
    this.modules.addClock(
      this.instance.active_scene[index],
      this.instance.update
    );
  });

  console.log(this.instance);
}

server.start();
