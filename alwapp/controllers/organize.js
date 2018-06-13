const ApiResponse = require('../class/api-response');
const Constant = require('../class/constant').Constant;
const organizeService = require('../service/organize-service');
const ServiceError = require('../class/service-error');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
  async getOrganizeInfoByOrgCode(request, reply) {
    var orgCode = request.params.orgCode;

    try {
      logService.info("Start: organize.getOrganizeInfoByOrgCode");      

      await organizeService.getOrganizeInfoByOrgCode(orgCode)
      .then(_organizeInfoList => {
        // expect to return 1 record
        organizeInfoList = _organizeInfoList;
      })
      .catch(err => {
          throw err;
      });
      
      var apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'organize_info';
      apiResponse.response = organizeInfoList;
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
      logService.info("End: organize.getOrganizeInfoByOrgCode");      
    }
  },

};
