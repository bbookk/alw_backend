var objectService = require('../../alwapp/service/object-service');
var assert = require('assert');

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('object-service', function() {
  describe('#listToMap()', function() {
    it('should return map object (simple key)', function() {
        var objectList = [{someKey: '1', someValue: 'A'}, {someKey: '2', someValue: 'B'}];
      
        var objectMap = objectService.listToMap('someKey', objectList);
    
        var count = 0;
        objectMap.forEach(function (value, key) {
            var found = false;
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                if (object['someKey'] == key && object['someValue'] == value['someValue']) {
                    found = true;
                    break;
                }
            }

            assert.ok(found);
        });
    });
  });

  describe('#listToMap()', function() {
    it('should return map object (nested key)', function() {
        var objectList = [{
            someObject: {
                someKey: '1', someValue: 'A'
            }
        }, {
            someObject: {
                someKey: '2', someValue: 'B'
            }
        }];
      
        var objectMap = objectService.listToMap('someObject.someKey', objectList);
    
        var count = 0;
        objectMap.forEach(function (value, key) {
            var found = false;
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                if (object['someObject']['someKey'] == key && object['someObject']['someValue'] == value['someObject']['someValue']) {
                    found = true;
                    break;
                }
            }

            assert.ok(found);
        });
    });
  });

});
