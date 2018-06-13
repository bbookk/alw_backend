const organizeController = require('../controllers').organizeController;

/**
 * /organize/50054188
 */
module.exports = [
    { 
        // support bot orgCode is null or not null
        method: 'GET', path: '/organize/{orgCode}', handler: function (request, reply) {
            return organizeController.getOrganizeInfoByOrgCode(request, reply);
        },
    },
    {
        // support bot orgCode is null or not null
        method: 'GET', path: '/organize', handler: function (request, reply) {
            return organizeController.getOrganizeInfoByOrgCode(request, reply);
        } 
    }
];