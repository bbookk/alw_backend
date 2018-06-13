var agentService = require('../../alwapp/service/agent-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('agent-service', function() {
  describe('#getAgentsBySupervisorPin()', function() {
    it('search pin = 40081 should return pin = 00004849', async function() {
      // mapping json response to EmployeeInfo
      var pin = '4849';
      await agentService.getAgentsBySupervisorPin(pin)
      .then(agentInfoResp => {
        //   console.log("%j", agentInfoResp);
        assert.equal(agentInfoResp.pin, '00004849');
        assert.equal(agentInfoResp.agentLowerInfoList.length, 38);
      })
      .catch(err => {
        console.log(err);
        assert.ok(!err);
      });
    });

    // no longer support this error
    // it('search pin = 32269 (agent) should get error not authorize', async function() {
    //     // mapping json response to EmployeeInfo
    //     var pin = '4849';
    //     await agentService.getAgentsBySupervisorPin(pin)
    //     .then(agentInfoResp => {
    //       //   console.log("%j", agentInfoResp);
    //       assert.equal(agentInfoResp.agentLowerInfoList.length, 0);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         assert.ok(!err);
    //     });
    //   });  
    });

    describe('#getAgentsByManagerPin()', function() {
        it('search pin = 20403 should return pin = 00020403', async function() {
        // mapping json response to EmployeeInfo
        var pin = '20403';
        await agentService.getAgentsByManagerPin(pin)
        .then(agentInfoResp => {
            //   console.log("%j", agentInfoResp);
            assert.equal(agentInfoResp.pin, '00020403');
            assert.equal(agentInfoResp.agentLowerInfoList.length, 192);
        })
        .catch(err => {
            console.log(err);
            assert.ok(!err);
        });
        });
    });
});
