const employeeController = require('../controllers').employeeController;

/**
 * /employee/00009218
 */
module.exports = [
    { 
        method: 'GET', path: '/employee/{pin}', handler: function (request, reply) {
            employeeController.getEmployeeInfoByPin(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/employee', handler: function (request, reply) 
        {  
            reply.response('Not support this api').code(400);
        } 
    }
];