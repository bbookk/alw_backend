const authController = require('../controllers').authController;

/**
 * /login
 */
module.exports = [
    { 
        method: 'POST', path: '/login', config: { auth: false }, handler: function (request, reply) {
            return authController.login(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/logout', handler: function (request, reply) {
            return authController.logout(request, reply);
        } 
    },
    { 
        method: 'GET', path: '/authen', handler: function (request, reply) {
            return authController.authen(request, reply);
        } 
    },
];