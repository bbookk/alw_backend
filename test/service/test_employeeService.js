var employeeService = require('../../alwapp/service/employee-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('employee-service', function() {
  describe('#getEmployeeDetailWithOrganizeByPin()', function() {
    it('search pin = 4849 should return pin = 00004849', async function() {
      // mapping json response to EmployeeInfo
      var pin = '4849';
      await employeeService.getEmployeeDetailWithOrganizeByPin(pin)
      .then(employeeInfoResp => {
        //   console.log("%j", agentInfoResp);
        assert.equal(employeeInfoResp.pin, '00004849');
        assert.equal(employeeInfoResp.orgCodeCO, '50054188');
        // assert.equal(employeeInfoResp.orgCodeBL, '50054194');
        assert.equal(employeeInfoResp.orgCodeBU, '50054194');
        // assert.equal(employeeInfoResp.orgCodeDP, '50054194');
        assert.equal(employeeInfoResp.orgCodeSC, '50054202');
        assert.equal(employeeInfoResp.orgCodeFC, '50105232');
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });
});
