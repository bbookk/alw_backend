const employeeController = require('../controllers').employeeController;

/**
 * /holiday?start=2018/01/01&end=2018/01/31
 */
module.exports = [
    { 
        method: 'GET', path: '/holiday', handler: async function (request, reply) {
            employeeController.getHolidayByDate(request, reply);
        } 
    }
];
