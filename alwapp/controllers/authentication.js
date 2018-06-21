const ApiResponse = require('../class/api-response');
const Constant = require('../class/constant').Constant;
const authenticationService = require('../service/authentication-service');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
    /**
     * 
     * @param {*} request 
     * Sample json
     * login_info: {
     *    pin: '00020180',
     *    username: 'pornthio',
     * }
     * @param {*} reply 
     * Sample json
     * loging_info_resp: {
     *    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaW4iOiIwMTIzNDU2NyIsInVzZXJuYW1lIjoidGVzdCIsInNzb1Rva2VuIjoiQVNERkdISktMIiwiaWF0IjoxNTI3MjIzMTI4fQ.0-y5fsbEhvTalFkzm4RyMOCXlnaygxmXVlYdcGQ7bM0',
     * }
     */
  async login(request, reply) {
    try {
        logService.info("Start: authentication.login");

        if (request.payload) {
            var token = authenticationService.login(request.payload);
        
            var apiResponse = new ApiResponse();
            apiResponse.status = Constant.API.STATUS_SUCCESS;
            apiResponse.name = 'login_info_resp';
            apiResponse.response = {token: token};
            apiResponse.responseTime = new Date();

            // log mapping request.info.id and session_id
            if (request.info &&  request.info.id) {
                var claims = authenticationService.verifyToken(token);

                logService.info("session_id has been changed from [" + request.info.id + "] to [" + claims.session_id + "]");
            }

            return reply.response(apiResponse)
                .code(200)
                // attach token to cookie
                .header('Set-Cookie', 'token=' + token)
                .header('cookie', 'token=' + token);
        } else {
            var apiResponse = new ApiResponse();
            apiResponse.status = Constant.API.STATUS_ERROR;
            apiResponse.statusCode = Constant.API.STATUS_CODE_INVALID_PARAM;
            apiResponse.message = 'Invalid request';
            apiResponse.responseTime = new Date();
    
            return reply.response(apiResponse).code(400);
        }
    } catch (err) {
        logService.error('login', err);
        var apiResponse = new ApiResponse();
        apiResponse.status = Constant.API.STATUS_ERROR;
        apiResponse.message = err.message;
        apiResponse.responseTime = new Date();

        return reply.response(apiResponse).code(400);
    } finally {
        logService.info("End: authentication.login");
    }
  },

  async logout(request, reply) {

    try {
        logService.info("Start: authentication.logout");

        if (request.auth && request.auth.credentials && request.auth.credentials.pin) {
            var pin = request.auth.credentials.pin;

            logService.info("pin = " + pin);

            var apiResponse = new ApiResponse();
            apiResponse.status = Constant.API.STATUS_SUCCESS;
            apiResponse.name = 'logout_info_resp';
            apiResponse.response = {};
            apiResponse.responseTime = new Date();

            return reply.response(apiResponse).code(200)
            .header('Set-Cookie', 'token=; expires='+new Date(new Date().getTime()+86409000).toUTCString());
        } else {
            var apiResponse = new ApiResponse();
            apiResponse.status = Constant.API.STATUS_ERROR;
            apiResponse.statusCode = Constant.API.STATUS_CODE_INVALID_PARAM;
            apiResponse.message = 'Invalid request';
            apiResponse.responseTime = new Date();
    
            return reply.response(apiResponse).code(400);
        }
    } catch (err) {
        logService.error('logout', err);
        var apiResponse = new ApiResponse();
        apiResponse.status = Constant.API.STATUS_ERROR;
        apiResponse.message = err.message;
        apiResponse.responseTime = new Date();

        return reply.response(apiResponse).code(400);
    } finally {
        logService.info("End: authentication.logout");
    }
  },
  async authen(request, reply) {

    try {
        logService.info("Start: authentication.authen");

        var apiResponse = new ApiResponse();
        apiResponse.status = Constant.API.STATUS_SUCCESS;
        apiResponse.responseTime = new Date();

        return reply.response(apiResponse).code(200);
    } finally {
        logService.info("End: authentication.authen");
    }
  },
};
