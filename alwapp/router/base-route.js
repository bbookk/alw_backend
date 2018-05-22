var employee = require('./employee');
var holiday = require('./holiday');
var txSummary = require('./tx-summary');

var routes = [].concat(employee,holiday,txSummary);

// log service to write access log
var logService = require('../service/log-service');

var baseRoute = {
    register: function (server, options, next) {
        // set routes
        server.route(routes);

        // stamp start time
        server.ext('onRequest', (request, h) => {
            request.headers['x-req-start'] = Date.now();

            return h.continue();
          });

        // write access log
        server.on('response', function (request) {
            var start_time = request.headers['x-req-start'] || 0;
            var end_time = Date.now();

            // uncomment code below to check request
            //console.log(request)
            logService.log_access(request, request.response, end_time-start_time);
        });

        next();
    }
};

baseRoute.register.attributes = {
    name : 'base-route',
    version: '0.0.0'
};

module.exports = baseRoute;