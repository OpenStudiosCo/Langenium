/***
 * Multiplayer code for connecting to Langenium server instances.
 * 
 * Connects to the servers public socket.io JS script.
 */

export default class Multiplayer {
    constructor() {
        this.connected = false;
        this.serverLocation = false;
        this.latency = 0;
        this.socket = false;
    }

    connect( serverLocation ) {
        window.l.multiplayer.serverLocation = serverLocation;

        var remote_script = 
        {
			name: "socket.io",
			files: [ { path: serverLocation + '/socket.io/socket.io.js', callback: "window.l.multiplayer.start" } ]
		};
        _load_modules([remote_script], 'l');
    }

    start() {
        window.l.multiplayer.socket = io(window.l.multiplayer.serverLocation);
        window.l.multiplayer.socket.on("ping", (data) => {
            window.l.multiplayer.latency = data.latency;
        
            window.l.multiplayer.socket.emit("pong", data);
        });

        window.l.multiplayer.socket.on('load_scene', ( instance_obj ) => {
            console.log(instance_obj);
        });
    }

    disconnect() {
        window.l.multiplayer.socket.close();
    }
}
