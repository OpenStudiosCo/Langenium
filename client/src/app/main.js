/**
 * Classes and helpers.
 */
import l from './helpers/l.js';
import Config from "./config.js";
import Controls from "./controls.js";
import Materials from "./materials.js";
import Multiplayer from "./multiplayer.js";
import Scenograph from "./scenograph.js";
import UI from "./ui.js";

/**
 * Config.
 */
l.config = new Config();

/**
 * Controls.
 */
l.controls = new Controls();

/**
 * Custom materials.
 */
l.materials = new Materials();

/**
 * Multiplayer allows connecting to server.
 */
l.multiplayer = new Multiplayer();

/**
 * Scenograph controls the current scene
 */
l.scenograph = new Scenograph();

/**
 * Manages all overlay UIs for gameplay and client controls.
 */
l.ui = new UI();

l.init = function() {
    /**
     * Load up the overworld by default.
     */
    l.current_scene = l.scenograph.load( "Overworld" );

    l.scenograph.init();
}
