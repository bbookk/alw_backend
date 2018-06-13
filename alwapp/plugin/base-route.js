var employee = require('../router/employee');
var holiday = require('../router/holiday');
var txSummary = require('../router/tx-summary');
var payroll = require('../router/payroll');
var agent = require('../router/agent');
var authentication = require('../router/authentication');
var organize = require('../router/organize');

var routes = [].concat(employee,holiday,txSummary,payroll,agent,authentication,organize);


// log service to write access log
var logService = require('../service/log-service');

const baseRoute = {
    name : 'base-route',
    version: '0.0.0',
    register: function (server, options) {
        // set routes
        server.route(routes);

        // stamp start time
        server.ext('onRequest', (request, h) => {
            request.headers['x-req-start'] = Date.now();

            // set info.id to session_id in case unauthenthicated request
            if (request.info) {
                logService.addContext('session_id', request.info.id);
                logService.addContext('pin', 'N/A');
            } else {
                logService.addContext('session_id', 'N/A');
                logService.addContext('pin', 'N/A');
            }

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
        
            logService.clearContext();

            return h.continue;
        });
    }
};

module.exports = baseRoute;