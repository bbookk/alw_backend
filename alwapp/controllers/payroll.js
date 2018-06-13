const ApiResponse = require('../class/api-response');
const sapService = require('../service/sap-service');
const Constant = require('../class/constant').Constant;

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
  async submitOTByMonth(request, reply) {
    // mapping json response to EmployeeInfo
    var requestObj = {};

    try {
      logService.info("Start: payroll.submitOTByMonth");      

      await sapService.sendOT(requestObj)
      .then(_responseObj => {
        responseObj = _responseObj;
      })
      .catch(err => {
          throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'response_ot';
      apiResponse.response = responseObj;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: payroll.submitOTByMonth");      
    }
  },

  async submitAllowanceByMonth(request, reply) {
    // mapping json response to EmployeeInfo
    var requestObj = {};

    try {
      logService.info("Start: payroll.submitAllowanceByMonth");      

      await sapService.sendAllowance(requestObj)
      .then(_responseObj => {
        responseObj = _responseObj;
      })
      .catch(err => {
          throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'response_allowance';
      apiResponse.response = responseObj;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: payroll.submitAllowanceByMonth");      
    }
  },

  async receiveCallback(request, reply) {
    // mapping json response to EmployeeInfo
    var requestObj = {};

    try {
      logService.info("Start: payroll.receiveCallback");      

      await sapService.receiveCallback(requestObj)
      .then(_responseObj => {
        responseObj = _responseObj;
      })
      .catch(err => {
          throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'response_callback';
      apiResponse.response = responseObj;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    } finally {
      logService.info("End: payroll.receiveCallback");      
    }
  },
};
