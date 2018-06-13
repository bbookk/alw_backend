'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var env = process.env.NODE_ENV || 'local';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure(require('./alwapp/config/app-log4js.json')[env]);

// Start the server
async function start() {
    try {
        const Hapi=require('hapi');
        
        // get port from process.env or set default to 8080
        const HOST = process.env.HOST || '0.0.0.0';
        const RADIX = 10;
        const PORT = parseInt(process.env.PORT, RADIX) || 8080;
        
        // Create a server with a host and port
        const server=new Hapi.Server({  
            host: HOST,
            port: PORT
          });
        
        const plugins = [];
        const registerOptions = { once: true };

        plugins.push(require('hapi-auth-jwt2'));
        plugins.push(require('./alwapp/plugin/auth-jwt'));
        plugins.push({
            plugin: require('./alwapp/plugin/base-route'),
            routes: {
                prefix: '/api'
            }
        });

        await server.register(plugins, registerOptions);

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