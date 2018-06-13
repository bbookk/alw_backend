var AgentInfo = require('../../alwapp/class/agent-info');
var assert = require('assert');

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('agent-info', function() {
  describe('#toJSON()', function() {
    it('should return json object', function() {
        var agentInfo = new AgentInfo();

        agentInfo.updateDate ='UPD_DATE';
        agentInfo.dateMonth = 'DATEMONTH';
        agentInfo.pin = 'PINCODE';
        agentInfo.fullName = 'AGENT';
        agentInfo.username = 'USERNAME';
        agentInfo.loginId = 'LOGIN_ID';
        agentInfo.managerPin = 'PINCODE_MANAGER';
        agentInfo.managerFullName = 'MANAGER';
        agentInfo.supervisorPin = 'PINCODE_SUP';
        agentInfo.supervisorFullName = 'SUPERVISOR';
        agentInfo.cbpTeamId = 'CBP_TEAM_ID';
        agentInfo.cbpTeamName = 'CBP_TEAM';
        agentInfo.cbpGroupId = 'CBP_GROUP_ID';
        agentInfo.cbpGroupName = 'CBP_GROUP';
        agentInfo.effectiveDate = 'EFFECTIVE_DATE';

        assert.ok(JSON.parse(JSON.stringify(agentInfo)).pin == 'PINCODE');
    });
  });
});
