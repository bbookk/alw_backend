var textService = require('../alwapp/service/text-service');
var assert = require('assert');

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/debug-log4js.json');

describe('text-service', function() {
  describe('#uuid()', function() {
    it('should return uuid', function() {
        var uuid = textService.uuid();
        assert.ok(uuid != null);
    });
  });
});
