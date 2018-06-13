var rdpService = require('../../alwapp/service/rdp-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('rdp-service', function() {
  describe('#getHolidayByDate()', function() {
    it('should return list of holiday', async function() {
      await rdpService.getHolidayByDate('2018/01/01', '2018/01/31')
      .then(holidayList => {
        assert.ok(holidayList.length == 2);
        assert.ok(holidayList[0].id == 100);
      })
      .catch(err => {
        // console.log(err);
        assert.fail(err);
      });
    });
  });
});
