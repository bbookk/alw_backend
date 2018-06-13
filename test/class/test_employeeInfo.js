var EmployeeInfo = require('../../alwapp/class/employee-info');
var assert = require('assert');

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('employee-info', function() {
  describe('#toJSON()', function() {
    it('should return json object', function() {
        var employeeInfo = new EmployeeInfo();

        employeeInfo.nameEng ='ENGNAME';
        employeeInfo.surnameEng ='ENGSURNAME';
        employeeInfo.nameTh ='THNAME';
        employeeInfo.surnameTh ='THSURNAME';
        employeeInfo.pin ='PIN';
        employeeInfo.position ='POSITION';
        employeeInfo.orgDesc ='ORGDESC';
        employeeInfo.orgCode ='ORGCODE';
        employeeInfo.orgName ='ORGNAME';
        employeeInfo.nickname ='NICKNAME';
        employeeInfo.jobDesc ='JOBDESC';
        employeeInfo.positionId ='POSITIONID';
        employeeInfo.email ='EMAIL';
        employeeInfo.pgGroup ='PGGROUP';
        employeeInfo.mobileNo ='MOBILENO';
        employeeInfo.telNo ='TELNO';
        employeeInfo.dpDesc ='DPDESC';
        employeeInfo.managerName ='MANAGERNAME';
        employeeInfo.buildingName ='BUILDINGNAME';
        employeeInfo.provinceCode ='PROVINCECODE';
        employeeInfo.floor ='FLOOR';
        employeeInfo.employeeType ='EMPLOYEETYPE';
        employeeInfo.idCard ='IDCARD';

        assert.ok(JSON.parse(JSON.stringify(employeeInfo)).pin == 'PIN');
    });
  });
});
