/**
 * Classes and helpers.
 */
import l from '@/helpers/l.js';
import Config from "@/config.js";
import Routes from "@/routes.js";
import Scenograph from "@/scenograph.js";
import UI from "@/ui.js";

/**
 * Config.
 */
l.config = new Config();

/**
 * Routes activate game modes and screens.
 */
l.routes = new Routes();

/**
 * Scenograph controls the current 3D scene
 */
l.scenograph = new Scenograph();

/**
 * Manages all overlay UIs for gameplay and client controls.
 */
l.ui = new UI();

l.init = function () {
    /**
     * Load up the overworld by default.
     */
    l.current_scene = l.scenograph.load( "Overworld" );

    l.scenograph.init();
}
