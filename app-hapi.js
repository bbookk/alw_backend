'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var env = process.env.NODE_ENV || 'development';
var log4js = require('log4js');
log4js.configure(require('./alwapp/config/app-log4js.json')[env]);

const Hapi=require('hapi');

// Create a server with a host and port
const server=new Hapi.Server();

// get port from process.env or set default to 8080
const HOST = process.env.HOST || '0.0.0.0';
const RADIX = 10;
const PORT = parseInt(process.env.PORT, RADIX) || 8080;

// add server’s connection information
server.connection({  
    host: HOST,
    port: PORT
  });

// Start the server
async function start() {
    try {
        // register route for api
        await server.register({
            register: require('./alwapp/router/base-route'),
            routes: {
                prefix: '/api'
            }
        });

        await server.start();

        console.log('Server running on', server.info.uri)

        // // Add the route
        // await server.route(routes);

        // await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();