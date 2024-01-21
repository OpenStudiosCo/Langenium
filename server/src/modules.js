/**
 * Modules
 * 
 * Container for 3rd Party Libs and models and controllers. This allows everything to easily talk to each other
 */

/**
 * Setup Globals
 */
const { Server } = require("socket.io");

/**
 * Setup server modules
 * 
 * @returns an object containing all the globals of the server application.
 */
module.exports = class Modules {
    constructor() {
        let modules = {
            fs: require('fs'),
            express: require('express'),
            app: false,
            settings: false,
            webServer: false
        }

        modules.settings = {
            port: process.env.PORT || 8090,
            ssl_files: {
                key: modules.fs.readFileSync('../client/etc/ssl-cert-snakeoil.key'),
                cert: modules.fs.readFileSync('../client/etc/ssl-cert-snakeoil.pem')
            }
        };

        modules.app = modules.express();
        modules.webServer = require('https').createServer(modules.settings.ssl_files, modules.app);

        modules.io = new Server(modules.webServer, {
            cors: {
                // @todo replace with proper approved domain names
                origin: '*'
            }
        });

        modules.app.get('/', function (req, res) {
            res.send('<h1>Nothing to see here folks!</h1>');
        });

        modules.io.on('connection', (socket) => {
            console.log('user connected');
            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
        })

        modules.webServer.listen(modules.settings.port, function () {
            console.log(`Listening on port ${modules.settings.port}`);
        });

        return modules;
    }

};
