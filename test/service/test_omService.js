var omService = require('../../alwapp/service/om-service');
var EmployeeInfo= require('../../alwapp/class/employee-info');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('om-service', function() {
  describe('#searchEmployeeDetail()', function() {
    it('should return 00009218', async function() {
      // mapping json response to EmployeeInfo
      var employeeInfoReq = new EmployeeInfo();
      employeeInfoReq.pin = "00009218";
      //employeeInfoReq.companyName = "Advanced Info Service";
      await omService.searchEmployeeDetail(employeeInfoReq)
      .then(employeeInfoList => {
        assert.ok(employeeInfoList.length == 2);
        employeeInfoList.forEach( function(employeeInfo) {
          assert.ok(employeeInfo.pin, employeeInfoReq.pin);
        });
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('#getAllCompany()', function() {
    it('should return all company', async function() {
      await omService.getAllCompany()
      .then(companyInfoList => {
        assert.equal(companyInfoList.length, 14);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('#getLowerOrganizeInfoListByOrgCode()', function() {
    it('should return all organize under orgCode = 50048290', async function() {
      await omService.getLowerOrganizeInfoListByOrgCode('50048290')
      .then(companyInfoList => {
        assert.equal(companyInfoList.length, 11);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('#getUpperOrganizeInfoListByOrgCode()', function() {
    it('should return all organize upper orgCode = 50048290', async function() {
      await omService.getUpperOrganizeInfoListByOrgCode('50048290')
      .then(companyInfoList => {
        assert.equal(companyInfoList.length, 10);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('om-service', function() {
    describe('#getEmployeeDetailByPin()', function() {
      it('should return 00009218', async function() {
        var pin = "9218";
        await omService.getEmployeeDetailByPin(pin)
        .then(employeeInfoList => {
          assert.ok(employeeInfoList.length == 1);
          employeeInfoList.forEach( function(employeeInfo) {
            assert.ok(employeeInfo.pin == pin.padStart(8, '0'));
          });
        })
        .catch(err => {
          console.log(err);
          assert.ok(!err);
        });
      });
    });
  });
});
