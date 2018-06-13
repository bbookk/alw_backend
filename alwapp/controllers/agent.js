const ApiResponse = require('../class/api-response');
const Constant = require('../class/constant').Constant;
const cbpService = require('../service/cbp-service');
const agentService = require('../service/agent-service');
const AgentInfo = require('../class/agent-info');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
  async getAgentInfoByPin(request, reply) {
    var pin = request.params.pin;

    try {
      logService.info("Start: agent.getAgentInfoByPin");

      var agentInfo;
      // try get agent with pin
      await cbpService.getAgentByPin(pin)
      .then(_agentInfo => {
        // expect to return 1 record
        agentInfo = _agentInfo;
      })
      .catch(err => {
          logService.info('Agent not found, try check if manager');
      });
      
      // if not found then try get manager with the same pin
      if (agentInfo == undefined)
      {
        await cbpService.getManagerByPin(pin)
        .then(_agentInfo => {
          // expect to return 1 record
          agentInfo = _agentInfo;
        })
        .catch(err => {
          throw err;
        });
      }

      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'agent_info';
      apiResponse.response = agentInfo;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: agent.getAgentInfoByPin");
    }

  },
  async getAllManagers(request, reply) {
    var pin = request.params.pin;

    try {
      logService.info("Start: agent.getAllManagers");

      var agentInfo;

      await cbpService.getAllManagers()
      .then(_agentInfo => {
        // expect to return 1 record
        agentInfo = _agentInfo;
      })
      .catch(err => {
        throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'manager_info';
      apiResponse.response = agentInfo;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: agent.getAllManagers");
    }
  },
  async getManagerByPin(request, reply) {
    var pin = request.params.pin;

    try {
      logService.info("Start: agent.getManagerByPin");

      var agentInfo;

      await agentService.getAgentsByManagerPin(pin)
      .then(_agentInfo => {
        // expect to return 1 record
        agentInfo = _agentInfo;
      })
      .catch(err => {
        throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'manager_info';
      apiResponse.response = agentInfo;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: agent.getManagerByPin");
    }
  },
  async getSupervisorByPin(request, reply) {
    var pin = request.params.pin;

    try {
      logService.info("Start: agent.getSupervisorByPin");

      var agentInfo;

      await agentService.getAgentsBySupervisorPin(pin)
      .then(_agentInfo => {
        // expect to return 1 record
        agentInfo = _agentInfo;
      })
      .catch(err => {
        throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'supervisor_info';
      apiResponse.response = agentInfo;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: agent.getSupervisorByPin");
    }
  },
};
