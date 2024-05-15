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

        window.l.multiplayer.socket.on('update', async ( processed_changes ) => {
            await processed_changes.forEach(async (update) => {
                if (update.type == 'move_ship') {
                    await window.l.multiplayer.move_ship(update.data);
                }
            });
            
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
     * Move a ship based on server calculations.
     */

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

    /**
     * Move a ship
     */
    move_ship(data) {
        if (data.socket_id == window.l.multiplayer.socket.id) {
            // Update stored ship state, don't punch out as functions aren't transmitted.
            window.l.current_scene.scene_objects.ship.state.airSpeed = data.airSpeed;
            window.l.current_scene.scene_objects.ship.state.altitude = data.altitude;
            window.l.current_scene.scene_objects.ship.state.heading = data.heading;
            window.l.current_scene.scene_objects.ship.state.horizon = data.horizon;
            window.l.current_scene.scene_objects.ship.state.position.x = data.position.x;
            window.l.current_scene.scene_objects.ship.state.position.y = data.position.y;
            window.l.current_scene.scene_objects.ship.state.position.z = data.position.z;
            window.l.current_scene.scene_objects.ship.state.rotation = data.rotation;
            window.l.current_scene.scene_objects.ship.state.verticalSpeed = data.verticalSpeed;
        }
        else {
            window.l.current_scene.scene_objects.ships.forEach( ( ship ) => {

                if (ship.socket_id == data.socket_id) {
                    // Update stored ship state, don't punch out as functions aren't transmitted.
                    ship.state.airSpeed = data.airSpeed;
                    ship.state.altitude = data.altitude;
                    ship.state.heading = data.heading;
                    ship.state.horizon = data.horizon;
                    ship.state.position.x = data.position.x;
                    ship.state.position.y = data.position.y;
                    ship.state.position.z = data.position.z;
                    ship.state.rotation = data.rotation;
                    ship.state.verticalSpeed = data.verticalSpeed;

                    ship.mesh.position.x = data.position.x;
                    ship.mesh.position.y = data.position.y;
                    ship.mesh.position.z = data.position.z;
                    ship.mesh.rotation.x = data.rotation.x;
                    ship.mesh.rotation.y = data.rotation.y;
                    ship.mesh.rotation.z = data.rotation.z;
                }
            });
        }
        //console.log(data);
    }
}
