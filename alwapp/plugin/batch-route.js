var txSummary = require('../router/batch-tx-summary');
var summaryService = require('../service/summary-service');

var routes = [].concat(txSummary,summaryService);


// log service to write access log
var logService = require('../service/log-service');

const baseRoute = {
    name : 'batch-route',
    version: '0.0.0',
    register: function (server, options) {
        // set routes
        server.route(routes);

        // stamp start time
        server.ext('onRequest', (request, h) => {
            request.headers['x-req-start'] = Date.now();

            return h.continue;
          });

        // write access log
        server.ext('onPreResponse', function (request, h) {
            const response = request.response;

            var start_time = request.headers['x-req-start'] || 0;
            var end_time = Date.now();

            // uncomment code below to check request
            //console.log(request)
            logService.log_access(request, response, end_time-start_time);
        
            return h.continue;
        });
    }
};

module.exports = baseRoute;