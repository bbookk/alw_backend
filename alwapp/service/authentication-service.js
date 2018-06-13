const jwt   = require('jsonwebtoken');
const Constant = require('../class/constant').Constant;
const authService = require('../service/authorization-service');
const textService = require('../service/text-service');
const ServiceError = require('../class/service-error');

var env = process.env.NODE_ENV || 'local';
var secret = require('../config/jwt-key.json')[env].secret;
var c2aConfig = require('../config/c2a.json')[env];

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports = {
    generateToken: function (claims) {
        try {
            logService.debug("Start: authentication-service.generateToken");
            var payload = {};

            payload = Object.assign(claims, payload);

            return jwt.sign(payload, secret, {algorithm: 'HS256'});
        } finally {
            logService.debug("End: authentication-service.generateToken");
        }
    },

    verifyToken: function (token) {
        return jwt.verify(token, secret, {algorithm: 'HS256'});
    },

    verifyClaims: function (decoded, request) {
        // get claims from jwt to print log
        if (decoded) {
            logService.addContext('session_id', decoded.session_id);
            logService.addContext('pin', decoded.pin);
        } else {
            logService.addContext('session_id', 'N/A');
            logService.addContext('pin', 'N/A');
        }
            
        try {
            logService.debug("Start: authentication-service.verifyClaims");

            if (logService.isTraceEnabled()) {
                logService.trace("claims = " + decoded);
            }

            // console.log(decoded);
            // TODO: implement user validation
            // to access token's claim, using "request.auth.credentials"
            var pin = decoded.pin;

            if (logService.isDebugEnabled()) {
                logService.debug("pin = " + pin);
            }

            // check user role
            var userRoles = authService.getUserRolesByPin(pin);

            if (userRoles == null || userRoles.roles == null || userRoles.functions == null) {
                return {isValid: false};
            } else {
                return {isValid: true};
            }               
        } finally {
            logService.debug("End: authentication-service.verifyClaims");            
        }
    },

    // {
    //     "login_info": {
    //         "pin": "00020180",
    //         "username": "pornthio"
    //     }
    // }

    login: function (payload) {
        try {
            logService.debug("Start: authentication-service.login");            

            if (logService.isDebugEnabled())
            {
                logService.debug(payload);
            }

            var loginInfo
            
            // check if payload is object or string
            if (typeof payload == 'object')
            {
                loginInfo = payload['login_info'];
            } else {
                loginInfo = JSON.parse(payload)['login_info'];
            }

            var pin = loginInfo['pin'];
            var username = loginInfo['username'];
            var sso_token = loginInfo['sso_token'];
            var enable = c2aConfig['enable'];
            var key = c2aConfig['key_base'];

            // decode pin and username
            if (enable == 'true') {
                if (logService.isDebugEnabled()) {
                    logService.debug('Decode username and pin');
                }

                pin = textService.decodeBase64('aes-256-ctr', key, pin);
                username = textService.decodeBase64('aes-256-ctr', key, username);
            }

            if (logService.isTraceEnabled()) {
                logService.trace("pin = " + pin);
                logService.trace("username = " + username);
            }

            // check user role
            var userRoles = authService.getUserRolesByPin(pin);

            if (userRoles == null || userRoles.roles == null || userRoles.functions == null) {
                throw new ServiceError('Not authorize', Constant.SERVICE.ERROR_CODE_NOT_AUTHORIZE);
            } else {
                return this.generateToken({
                    pin: pin,
                    username: username,
                    sso_token: sso_token,
                    session_id: textService.uuid()
                });
            }
        } finally {
            logService.debug("End: authentication-service.login");            
        }
    }
}