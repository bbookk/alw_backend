var omService = require('../alwapp/service/om-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/debug-log4js.json');

describe('om-service', function() {
  describe('#searchEmployeeDetail()', function() {
    it('should return 00009218', async function() {
      // mapping json response to EmployeeInfo
      var employeeInfoReq = new (require('../alwapp/class').employeeInfo)();
      employeeInfoReq.pin = "00009218";
      await omService.searchEmployeeDetail(employeeInfoReq)
      .then(employeeInfoResp => {
        assert.equal(employeeInfoResp.pin, employeeInfoReq.pin);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });
});
