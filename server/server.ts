/**
 * Langenium Server
 * 
 * Version: 6
 */

import 'dotenv/config';

import Modules from './src/modules';
import Instance from './src/instance';

let server = {};

server.start = () => {
  this.modules = new Modules();
  this.instance = new Instance( this.modules );

  // This should go into some kind of utility class... it applies to both admin and game.. maybe website? 
  var pong = function(socket, data) {
    var time = new Date().getTime(); 
    var latency = time - data.time;
    socket.emit("ping", { time: new Date().getTime(), latency: latency });
  }

  this.modules.io.on('connection', (socket) => {
    socket.emit('ping', { time: new Date().getTime(), latency: 0 });
    socket.on('pong', (data) => { pong(socket, data) });

    socket.on('disconnect', () => { this.instance.remove_player(socket) } );

    socket.on('input', (data) => { this.instance.input(socket, data); } );

    // @todo: Unhardcode the instance ID when others are setup
    this.instance.subscribe( socket, this.instance.active_scenes[0] );
  });


  // @todo: Implement some kind of storage system for scene configs.
  let defaultOverworldScene = {
    _id: new Date().getTime(),
    name: 'Overworld',
    description: 'The main outdoor scene',
    environment: 'outdoor'
  };

  // Start the default overworld scene instance.
  this.instance.create(defaultOverworldScene, (index) => {
    this.modules.addClock(
      this.instance.active_scenes[index],
      this.instance.update
    );
  });

}

server.start();
