/***
 * Multiplayer code for connecting to Langenium server instances.
 */

import Ship from "./scene_assets/ship";

export default class Multiplayer {

    constructor() {
        this.connected = false;
        this.latency = 0;
        this.serverLocation = false;
        this.socket = false;

    }

    /**
     * Connect to multiplayer server by hot loading the socket.io JS script being served.
     */
    connect( serverLocation ) {
        window.l.multiplayer.serverLocation = serverLocation;

        var remote_script = 
        {
			name: "socket.io",
			files: [ { path: serverLocation + '/socket.io/socket.io.js', callback: "window.l.multiplayer.start" } ]
		};
        _load_modules([remote_script], 'l');
    }

    /**
     * Start the socket.io session and bind handlers.
     */
    start() {
        window.l.multiplayer.socket = io(window.l.multiplayer.serverLocation);

        window.l.multiplayer.connected = true;

        window.l.multiplayer.socket.on("ping", (data) => {
            window.l.multiplayer.latency = data.latency;
        
            window.l.multiplayer.socket.emit("pong", data);
        });

        window.l.multiplayer.socket.on('add_player', async ( data ) => {
            await window.l.multiplayer.add_player(data);
        });

        window.l.multiplayer.socket.on('remove_player', async ( data ) => {
            await window.l.multiplayer.remove_player(data);
        });
    }

    /**
     * Disconnect the multiplayer.
     */
    disconnect() {
        window.l.multiplayer.connected = false;
        window.l.multiplayer.socket.close();
    }

    /**
     * Add a new remote player to the client session.
     */
    async add_player(data) {
        let newShip = new Ship();
        await newShip.load();
        newShip.socket_id = data.socket_id;
        newShip.mesh.position.x = 0;
        newShip.mesh.position.y = 8.5;
        newShip.mesh.position.z = 0;

        window.l.current_scene.scene.add(
            newShip.mesh
        );
        // @todo Allow animation on other ships, currently it's hardcoded to the player ship in the function itself.
        // window.l.current_scene.animation_queue.push(
        //     newShip.animate
        // );
        window.l.current_scene.scene_objects.ships.push(newShip);
        
    }

    /**
     * Remove a disconnected remote player from the client session.
     */
    async remove_player(data) {
        window.l.current_scene.scene_objects.ships.forEach( ( ship ) => {
            if (ship.socket_id == data.socket_id) {
                window.l.current_scene.scene.remove(ship.mesh);
            }
        });
    }
}
