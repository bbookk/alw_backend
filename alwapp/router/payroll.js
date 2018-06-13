const payrollController = require('../controllers').payrollController;

/**
 * /payroll/00009218
 */
module.exports = [
    { 
        method: 'POST', path: '/payroll/ot', handler: function (request, reply) {
            return payrollController.submitOTByMonth(request, reply);
        } 
    },
    { 
        method: 'POST', path: '/payroll/allowance', handler: function (request, reply) 
        {  
            return payrollController.submitAllowanceByMonth(request, reply);
        } 
    },
    { 
        // remove "config: { auth: false}" to enable jwt authorization
        // method: 'POST', path: '/payroll/callback', config: { auth: false }, handler: function (request, reply) 
        method: 'POST', path: '/payroll/callback', config: { auth: false }, handler: function (request, reply) 
        {  
            return payrollController.receiveCallback(request, reply);
            // return reply.response('Hello').code(200);
        } 
    }
];