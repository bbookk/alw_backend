const employeeController = require('../controllers').employeeController;

/**
 * /employee/00009218
 */
module.exports = [
    { 
        method: 'GET', path: '/employee/{pin}', handler: function (request, reply) {
            return employeeController.getEmployeeInfoByPin(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/employee', handler: function (request, reply) 
        {  
            return employeeController.getEmployeeInfoByToken(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/employee-agent', handler: function (request, reply) 
        {  
            return employeeController.getAllEmployeeAndAgentInfo(request, reply);
        } 
    }
];