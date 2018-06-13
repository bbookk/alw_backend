const omService = require('../service/om-service');
const ServiceError = require('../class/service-error');
const Constant = require('../class/constant').Constant;

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {    
    getEmployeeDetailWithOrganizeByPin: async function (pin) {
        try {
            logService.debug("Start: employee-service.getEmployeeDetailWithOrganizeByPin");
            var employeeInfo;

            await omService.getEmployeeDetailByPin(pin)
            .then(_employeeInfoList => {
                employeeInfo = _employeeInfoList[0];
            })
            .catch(err => {
                throw err;
            });

            // get organization
            await omService.getUpperOrganizeInfoListByOrgCode(employeeInfo.orgCode)
            .then(_organizeInfoList => {
                // list of agents
                employeeInfo.organizeInfoList = _organizeInfoList;
            })
            .catch(err => {
                throw err;
            });

            return employeeInfo;
            // } else {
            //     throw new ServiceError('Not authorize', Constant.SERVICE.ERROR_CODE_NOT_AUTHORIZE);
            // }
        } finally {
            logService.debug("End: employee-service.getEmployeeDetailWithOrganizeByPin");
        }
    },

}