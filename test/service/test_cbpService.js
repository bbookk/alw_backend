var cbpService = require('../../alwapp/service/cbp-service');
var objectService = require('../../alwapp/service/object-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('cbp-service', function() {
  describe('#getAgentByPin()', function() {
    it('search pin = 20881 should return pin = 00020881', async function() {
      // mapping json response to EmployeeInfo
      var pin = '20881';
      await cbpService.getAgentByPin(pin)
      .then(agentInfoResp => {
        assert.equal(agentInfoResp.pin, '00020881');
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });

    it('search pin = 00020881 should return pin = 00020881', async function() {
      // mapping json response to EmployeeInfo
      var pin = '00020881';
      await cbpService.getAgentByPin(pin)
      .then(agentInfoResp => {
        assert.equal(agentInfoResp.pin, pin);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });

  });

  describe('#getAgentByUser()', function() {
    it('should return saiwarob', async function() {
      // mapping json response to EmployeeInfo
      var username = 'saiwarob';
      await cbpService.getAgentByUser(username)
      .then(agentInfoResp => {
        assert.equal(agentInfoResp.username, username);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('#getAllAgents()', function() {
    it('should return pin = 00010057', async function() {
      await cbpService.getAllAgents()
      .then(agentInfoList => {
        console.log(agentInfoList.size);
        // convert list to map by using loginId as key
        var agentMap = objectService.listToMap('loginId', agentInfoList);
        assert.ok(agentMap.get('31867').pin == '00010057');
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('#getManagerByPin()', function() {
    it('search pin = 21087 should return pin = 21087', async function() {
      // mapping json response to EmployeeInfo
      var pin = '21087';
      await cbpService.getManagerByPin(pin)
      .then(agentInfoResp => {
        assert.equal(agentInfoResp.pin, '00021087');
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });

    it('search pin = 20180 (agent) should not found', async function() {
      // mapping json response to EmployeeInfo
      var pin = '20180';
      await cbpService.getManagerByPin(pin)
      .then(agentInfoResp => {
        assert.fail(true, 'This is wrong answer');
      })
      .catch(err => {
        assert.ok(err.message == 'Not found');
      });
    });
  });

  describe('#getAllManager()', function() {
    it('search all manager should has 34 records', async function() {
      await cbpService.getAllManagers()
      .then(managerInfoMap => {

        // managerInfoMap.forEach( function (managerInfo, pin) {
        //   var supervisorPinList = [];

        //   managerInfo.agentLowerInfoList.forEach( function (supervisorInfo) {
        //     supervisorPinList.push(supervisorInfo.pin);
        //   });

        //   console.log(pin + " " + supervisorPinList);
        // });

        assert.equal(managerInfoMap.size, 34);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });
});
