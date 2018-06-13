var authService = require('../../alwapp/service/authorization-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('authorization-service', function() {
  describe('#getUserRolesByPin()', function() {
    it('00020061 has 2 roles, 16 functions', function() {
        var userRoles = authService.getUserRolesByPin('00020061');

        assert.ok(userRoles.roles.length == 2);
        assert.ok(userRoles.functions.length == 17);
    });
  });  

  describe('#getUserRolesByPin()', function() {
    it('00020062 not have authorize', function() {
        var userRoles = authService.getUserRolesByPin('00020062');

        console.log(userRoles);
        
        assert.ok(userRoles.roles == null);
        assert.ok(userRoles.functions == null);
    });
  });  

});
