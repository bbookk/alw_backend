var authService = require('../../alwapp/service/authentication-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('authentication-service', function() {
  describe('#generateToken()', function() {
    it('token must not be null', function() {
        var claims = {
            pin: '01234567',
            username: 'test',
            ssoToken: 'ASDFGHJKL'
        };

        var token = authService.generateToken(claims);

        console.log(token);
        
        assert.ok(token != null);
    });
  });

  
  describe('#verifyToken()', function() {
    it('token has pin = 01234567', function() {
        var claims = {
            pin: '01234567',
            username: 'test',
            ssoToken: 'ASDFGHJKL'
        };

        var token = authService.generateToken(claims);

        var tokenClaims = authService.verifyToken(token);

        assert.ok(tokenClaims.pin == '01234567');
    });
  });

  describe('#login()', function() {
    it('test', function() {
    // {
    //     "login_info": {
    //         "pin": "00020180",
    //         "username": "pornthio"
    //     }
    // }
        var token = authService.login(JSON.stringify({
            "login_info": {
                "pin": "00020180",
                "username": "pornthio"
            }
        }));
        
        console.log(token);

        assert.ok(true);
    });
  });
});
