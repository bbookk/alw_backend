var rdpService = require('../alwapp/service/rdp-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

describe('rdp-service', function() {
  describe('#getHolidayByDate()', function() {
    it('should return list of holiday', async function() {
      await rdpService.getHolidayByDate('2018/01/01', '2018/01/31')
      .then(holidayList => {
        assert.ok(holidayList.GET_HOLIDAYSResult.Holiday.length == 2);
        assert.ok(holidayList.GET_HOLIDAYSResult.Holiday[0].ID == 100);
      })
      .catch(err => {
        // console.log(err);
        assert.fail(err);
      });
    });
  });
});
