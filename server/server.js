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
  this.instance = new Instance();
}

server.start();
