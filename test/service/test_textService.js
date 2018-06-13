var textService = require('../../alwapp/service/text-service');
var assert = require('assert');
var env = process.env.NODE_ENV || 'local';
var c2aConfig = require('../../alwapp/config/c2a.json')[env];


/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('text-service', function() {
  describe('#uuid()', function() {
    it('should return uuid', function() {
        var uuid = textService.uuid();
        assert.ok(uuid != null);
    });
  });

  describe('#encodeBase64()', function() {
    it('should return 6CANqy9zSr4=', function() {
        var key = c2aConfig['key_base'];
        var cipher = textService.encodeBase64('aes-256-ctr', key, '00020180');
        assert.ok(cipher == '6CANqy9zSr4=');
    });
  });

  describe('#decodeBase64()', function() {
    it('should return uuid', function() {
        var key = c2aConfig['key_base'];
        var text = textService.decodeBase64('aes-256-ctr', key, '6CANqy9zSr4=');
        assert.ok(text == '00020180');
    });
  });

});
