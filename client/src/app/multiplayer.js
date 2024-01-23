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
        const socket = io(window.l.multiplayer.serverLocation);
        socket.on("ping", function(data){
            window.l.multiplayer.latency = data.latency;
        
            socket.emit("pong", data);
        });
    }
}
