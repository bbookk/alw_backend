var organizeService = require('../../alwapp/service/organize-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('organize-service', function() {
  describe('#getOrganizeInfoByOrgCode()', function() {
    it('has return 3 company when orgCode is null',async function() {

        var organizeInfoData = await organizeService.getOrganizeInfoByOrgCode();

        // only 3 company in app-config.json
        assert.equal(organizeInfoData.co_list.length, 3);
    });
  });

  describe('#getOrganizeInfoByOrgCode()', function() {
    it('has return 3 company when orgCode = 50054188 (ACC)',async function() {

        var organizeInfoData = await organizeService.getOrganizeInfoByOrgCode('50054188');

        // only 1 company in app-config.json
        assert.equal(organizeInfoData.co_list.length, 1);
        assert.equal(organizeInfoData.bu_list.length, 2);
        assert.equal(organizeInfoData.dp_list.length, 2);
        assert.equal(organizeInfoData.sc_list.length, 0);
        assert.equal(organizeInfoData.fc_list.length, 0);
    });
  });
});
