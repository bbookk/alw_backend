const agentController = require('../controllers').agentController;

/**
 * /agent/00009218
 */
module.exports = [
    { 
        method: 'GET', path: '/agent/{pin}', handler: function (request, reply) {
            return agentController.getAgentInfoByPin(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/manager', handler: function (request, reply) {
            return agentController.getAllManagers(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/supervisor/{pin}', handler: function (request, reply) {
            return agentController.getSupervisorByPin(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/manager/{pin}', handler: function (request, reply) {
            return agentController.getManagerByPin(request, reply);
        } 
    },
];