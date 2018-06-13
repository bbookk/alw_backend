const HashMap = require('hashmap');
var env = process.env.NODE_ENV || 'local';
var authorizeConfig = require('../config/role-authorize.json')[env];
var functionConfig = require('../config/role-authorize.json').Function;
var objectService = require('../service/object-service');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
    getUserRolesByPin: function (pin) {
        try {
            logService.debug("Start: authorization-service.getUserRolesByPin");
            var userAuthorizeList = authorizeConfig.Authorization;

            var functionConfigMap = objectService.listToMap('id', functionConfig);

            var roles;
            userAuthorizeList.forEach( function (record) {
                // search record of provided pin
                if (record[pin]) {
                    roles = record[pin];
                }
            });

            // use map to ignore duplicate functions
            var functionMap = new HashMap();
            if (roles) {
                roles.forEach( function(rolesOfPin) {
                    logService.debug("role = " + rolesOfPin);

                    var roleAuthorizeList = authorizeConfig.Role;

                    if (roleAuthorizeList) {
                        roleAuthorizeList.forEach( function(roleInConfig) {
                            if (roleInConfig[rolesOfPin]){
                                var functionIdList = roleInConfig[rolesOfPin];

                                functionIdList.forEach( function (functionId) {
                                    functionMap.set(functionId, functionConfigMap.get(functionId));    
                                });
                            }
                        });
                    }
                });

                var functionList = [];
                functionMap.forEach( function(value, key) {
                    functionList.push(value);
                });
            }
            
            return {
                pin : pin,
                roles : roles,
                functions : functionList
            };
        } finally {
            logService.debug("End: authorization-service.getUserRolesByPin");
        }
    },
}