const cbpService = require('../service/cbp-service');
const ServiceError = require('../class/service-error');
const Constant = require('../class/constant').Constant;

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
    getAgentsBySupervisorPin: async function (supervisorPin) {
        try {
            logService.debug("Start: agent-service.getAgentsBySupervisorPin");

            var supervisorPinNoZeroLeading = supervisorPin.replace(/^0+/, '');
            var agentInfoList;
            var supervisorInfo;

            await cbpService.getAgentByPin(supervisorPin)
            .then(_agentInfo => {
                supervisorInfo = _agentInfo;
            })
            .catch(err => {
                throw err;
            });

            // check if supervisor
            // if (supervisorInfo.pin == supervisorInfo.supervisorPin) {
            await cbpService.getAllAgents(
                // filter only agent with specific PINCODE_SUP
                function (item) {
                    return item['PINCODE_SUP'] == supervisorPinNoZeroLeading;
                })
            .then(_agentInfoList => {
                // list of agents
                agentInfoList = _agentInfoList;
            })
            .catch(err => {
                throw err;
            });
            supervisorInfo.agentLowerInfoList = agentInfoList;

            return supervisorInfo;
            // } else {
            //     throw new ServiceError('Not authorize', Constant.SERVICE.ERROR_CODE_NOT_AUTHORIZE);
            // }
        } finally {
            logService.debug("End: agent-service.getAgentsBySupervisorPin");
        }
    },

    getAgentsByManagerPin: async function (managerPin) {
        try {
            logService.debug("Start: agent-service.getAgentsByManagerPin");
            
            var managerPinNoZeroLeading = managerPin.replace(/^0+/, '');
            var agentInfoList;
            var managerInfo;

            await cbpService.getManagerByPin(managerPin)
            .then(_agentInfo => {
                managerInfo = _agentInfo;
            })
            .catch(err => {
                throw err;
            });

            // clear agent lower info list which currently is supervisor
            managerInfo.agentLowerInfoList = null;

            await cbpService.getAllAgents(
                // filter only agent with specific PINCODE_SUP
                function (item) {
                    return item['PINCODE_MANAGER'] == managerPinNoZeroLeading;
                })
            .then(_agentInfoList => {
                // list of agents
                agentInfoList = _agentInfoList;
            })
            .catch(err => {
                throw err;
            });
            managerInfo.agentLowerInfoList = agentInfoList;

            return managerInfo;
        } finally {
            logService.debug("End: agent-service.getAgentsByManagerPin");
        }
    },
}