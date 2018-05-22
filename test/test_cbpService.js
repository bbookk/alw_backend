var cbpService = require('../alwapp/service/cbp-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/debug-log4js.json');

describe('cbp-service', function() {
  describe('#getAgentByPIN()', function() {
    it('should return 539453', async function() {
      // mapping json response to EmployeeInfo
      var pin = '539453';
      await cbpService.getAgentByPIN(pin)
      .then(agentInfoResp => {
        assert.equal(agentInfoResp.GetAgentByPINResult.diffgram.NewDataSet.Table.PINCODE, pin);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });

  describe('#getAgentByUser()', function() {
    it('should return chayanom', async function() {
      // mapping json response to EmployeeInfo
      var username = 'chayanom';
      await cbpService.getAgentByUser(username)
      .then(agentInfoResp => {
        assert.equal(agentInfoResp.GetAgentByUserResult.diffgram.NewDataSet.Table.USERNAME, username);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });
  });
});
