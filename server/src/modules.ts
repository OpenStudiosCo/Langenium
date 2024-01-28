/**
 * Modules
 * 
 * Container for 3rd Party Libs and models and controllers. This allows everything to easily talk to each other
 */

/**
 * Setup Globals
 */
import { Server } from 'socket.io';
import fs from 'fs';
import express from 'express';
import deepmerge from 'deepmerge';
import https from 'https';

/**
 * Setup server modules
 * 
 * @returns an object containing all the globals of the server application.
 */
module.exports = class Modules {
    constructor() {
        let modules = {
            fs: fs,
            express: express,
            merge: deepmerge,
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

        modules.addClock = (obj, callback) => {
            obj.clock = setInterval(function () { callback(obj); }, 1000 / 66);
        }

        modules.app = modules.express();
        modules.webServer = https.createServer(modules.settings.ssl_files, modules.app);

        modules.io = new Server(modules.webServer, {
            cors: {
                // @todo replace with proper approved domain names
                origin: '*'
            }
        });

        modules.app.get('/', function (req, res) {
            res.send('<h1>Nothing to see here folks!</h1>');
        });

        modules.webServer.listen(modules.settings.port, function () {
            console.log(`Listening on port ${modules.settings.port}`);
        });

        return modules;
    }

};
