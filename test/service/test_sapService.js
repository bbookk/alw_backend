var sapService = require('../../alwapp/service/sap-service');
var assert = require('assert');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('sap-service', function() {
  describe('#sendOT()', function() {
    it('should return status = success', async function() {
      await sapService.sendOT()
      .then(response => {
        assert.ok(response.status == 'success');
      })
      .catch(err => {
        // console.log(err);
        assert.fail(err);
      });
    });
  });

  describe('#sendAllowance()', function() {
    it('should return status = success', async function() {
      await sapService.sendAllowance()
      .then(response => {
        assert.ok(response.status == 'success');
      })
      .catch(err => {
        // console.log(err);
        assert.fail(err);
      });
    });
  });

  describe('#receiveCallback()', function() {
    it('should return status = success', async function() {
      await sapService.receiveCallback()
      .then(response => {
        assert.ok(response.status == 'success');
      })
      .catch(err => {
        // console.log(err);
        assert.fail(err);
      });
    });
  });  
});
