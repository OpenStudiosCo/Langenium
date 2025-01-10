/***
 * Multiplayer code for connecting to Langenium server instances.
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import Valiant from "@/scenograph/objects/aircraft/valiant";

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
        l.scenograph.modes.multiplayer.serverLocation = serverLocation;

        var remote_script =
        {
            name: "socket.io",
            files: [ { path: serverLocation + '/socket.io/socket.io.js', callback: "l.scenograph.modes.multiplayer.start" } ]
        };
        _load_modules( [ remote_script ], 'l' );
    }

    /**
     * Start the socket.io session and bind handlers.
     */
    start() {
        l.scenograph.modes.multiplayer.socket = io( l.scenograph.modes.multiplayer.serverLocation );

        l.scenograph.modes.multiplayer.connected = true;

        l.scenograph.modes.multiplayer.socket.on( "ping", ( data ) => {
            l.scenograph.modes.multiplayer.latency = data.latency;

            l.scenograph.modes.multiplayer.socket.emit( "pong", data );
        } );

        l.scenograph.modes.multiplayer.socket.on( 'add_player', async ( data ) => {
            await l.scenograph.modes.multiplayer.add_player( data );
        } );

        l.scenograph.modes.multiplayer.socket.on( 'update', async ( processed_changes ) => {
            await processed_changes.forEach( async ( update ) => {
                if ( update.type == 'move_ship' ) {
                    await l.scenograph.modes.multiplayer.move_ship( update.data );
                }
            } );

        } );

        l.scenograph.modes.multiplayer.socket.on( 'remove_player', async ( data ) => {
            await l.scenograph.modes.multiplayer.remove_player( data );
        } );
    }

    /**
     * Disconnect the multiplayer.
     */
    disconnect() {
        l.scenograph.modes.multiplayer.connected = false;
        l.scenograph.modes.multiplayer.socket.close();
    }

    /**
     * Move a ship based on server calculations.
     */

    /**
     * Add a new remote player to the client session.
     */
    async add_player( data ) {
        let newPlayer = new Valiant();
        await newPlayer.load();
        newPlayer.socket_id = data.socket_id;
        newPlayer.mesh.position.x = 0;
        newPlayer.mesh.position.y = 8.5;
        newPlayer.mesh.position.z = 0;

        l.current_scene.scene.add(
            newPlayer.mesh
        );
        // @todo Allow animation on other ships, currently it's hardcoded to the player ship in the function itself.
        // l.current_scene.animation_queue.push(
        //     newPlayer.animate
        // );
        l.current_scene.objects.players.push( newPlayer );

    }

    /**
     * Remove a disconnected remote player from the client session.
     */
    async remove_player( data ) {
        l.current_scene.objects.players.forEach( ( ship ) => {
            if ( ship.socket_id == data.socket_id ) {
                l.current_scene.scene.remove( ship.mesh );
            }
        } );
    }

    /**
     * Move a ship
     */
    move_ship( data ) {
        if ( data.socket_id == l.scenograph.modes.multiplayer.socket.id ) {
            // Update stored ship state, don't punch out as functions aren't transmitted.
            l.current_scene.objects.player.state.airSpeed = data.airSpeed;
            l.current_scene.objects.player.state.altitude = data.altitude;
            l.current_scene.objects.player.state.heading = data.heading;
            l.current_scene.objects.player.state.horizon = data.horizon;
            l.current_scene.objects.player.state.position.x = data.position.x;
            l.current_scene.objects.player.state.position.y = data.position.y;
            l.current_scene.objects.player.state.position.z = data.position.z;
            l.current_scene.objects.player.state.rotation = data.rotation;
            l.current_scene.objects.player.state.verticalSpeed = data.verticalSpeed;
        }
        else {
            l.current_scene.objects.players.forEach( ( ship ) => {

                if ( ship.socket_id == data.socket_id ) {
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
            } );
        }
        //console.log(data);
    }
}
