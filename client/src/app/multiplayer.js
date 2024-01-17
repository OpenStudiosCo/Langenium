/***
 * Multiplayer code for connecting to Langenium server instances.
 */

export default class Multiplayer {
    constructor() {
        this.connected = false;
        this.serverLocation = false;
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
    }
}
