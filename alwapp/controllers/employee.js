const ApiResponse = require('../class/api-response');
const Constant = require('../class/constant').Constant;
const omService = require('../service/om-service');
const rdpService = require('../service/rdp-service');
const EmployeeInfo = require('../class/employee-info');
const ServiceError = require('../class/service-error');
const authService = require('../service/authorization-service');

// for testing
const objectService = require('../service/object-service');
const cbpService = require('../service/cbp-service');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
  async getEmployeeInfoByPin(request, reply) {
    // mapping json response to EmployeeInfo
    var pin = request.params.pin;

    try {
      logService.info("Start: employee.getEmployeeInfoByPin");

      await omService.getEmployeeDetailByPin(pin)
      .then(_employeeInfoList => {
        // expect to return 1 record
          employeeInfoResp = _employeeInfoList[0];
      })
      .catch(err => {
          throw err;
      });
      
      // get authorize
      employeeInfoResp.authorizeInfo = authService.getUserRolesByPin(pin)

      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'employee_info';
      apiResponse.response = employeeInfoResp;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;

      if (err instanceof ServiceError) {
        apiResponse.statusCode = err.code;
      } else {
        apiResponse.statusCode = Constant.API.STATUS_CODE_UNKNOWN;
      }
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: employee.getEmployeeInfoByPin");      
    }
  },

  async getEmployeeInfoByToken(request, reply) {
    // mapping json response to EmployeeInfo
    var pin = request.auth.credentials.pin;

    try {
      logService.info("Start: employee.getEmployeeInfoByToken");      

      await omService.getEmployeeDetailByPin(pin)
      .then(_employeeInfoList => {
        // expect to return 1 record
          employeeInfoResp = _employeeInfoList[0];
      })
      .catch(err => {
          throw err;
      });
      
      // get authorize
      employeeInfoResp.authorizeInfo = authService.getUserRolesByPin(pin)

      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'employee_info';
      apiResponse.response = employeeInfoResp;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;

      if (err instanceof ServiceError) {
        apiResponse.statusCode = err.code;
      } else {
        apiResponse.statusCode = Constant.API.STATUS_CODE_UNKNOWN;
      }
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: employee.getEmployeeInfoByToken");      
    }
  },

  async getHolidayByDate(request, reply) {
    var holidayList = null;
    try {
        logService.info("Start: employee.getHolidayByDate");      

        // get start / end from http request parameter
        var start = request.query.start;
        var end = request.query.end;
    
        await rdpService.getHolidayByDate(start, end)
        .then(_holidayList => {
            holidayList = _holidayList;
        })
        .catch(err => {
          throw err;
        });

        var apiResponse = new ApiResponse();
        apiResponse.status = Constant.API.STATUS_SUCCESS;
        apiResponse.name = 'holiday_info_list';
        apiResponse.response = holidayList;
        apiResponse.responseTime = new Date();
  
        return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: employee.getHolidayByDate");
    }
  },
  async getAllEmployeeAndAgentInfo(request, reply) {

    // mapping json response to EmployeeInfo
    var employeeInfoReq = new EmployeeInfo();

    var employeeInfoMap = {};

    try {
      logService.info("Start: employee.getAllEmployeeAndAgentInfo");      

      // get all employee from om
      await omService.searchEmployeeDetail(employeeInfoReq)
      .then(_employeeInfoList => {
        // convert list to map
        employeeInfoMap = objectService.listToMap('pin', _employeeInfoList);
      })
      .catch(err => {
          throw err;
      });

      var agentInfoMap = {};
      await cbpService.getAllAgents()
      .then(_agentInfoList => {
        // convert list to map
        agentInfoMap = objectService.listToMap('pin', _agentInfoList);
      })
      .catch(err => {
          throw err;
      });      
      // merge employee and agent
      var employeeAgentInfoList = [];

      agentInfoMap.forEach( function (agentInfo, pin) {
        var employeeInfo = employeeInfoMap.get(pin);
        
        // skip if not found
        if (employeeInfo) {
          var employeeAgentInfoResp = Object.assign(JSON.parse(JSON.stringify(employeeInfo)), JSON.parse(JSON.stringify(agentInfo)));
          employeeAgentInfoList.push(employeeAgentInfoResp);
        } else {
          console.log('Missing pin on OM, pin = ' + pin);
        }
      });

      // employeeInfoMap.forEach( function (employeeInfo, pin) {
      //   var agentInfo = agentInfoMap.get(pin);
        
      //   // skip if not found
      //   if (agentInfo) {
      //     var employeeAgentInfoResp = Object.assign(employeeInfo, agentInfo);
      //     employeeAgentInfoList.push(employeeAgentInfoResp);
      //   } else {
      //     console.log('Missing pin on CBP, pin = ' + pin);
      //   }
      // });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'employee_agent_info';
      apiResponse.response = employeeAgentInfoList;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: employee.getAllEmployeeAndAgentInfo");      
    }
  },
};
