const HashMap = require('hashmap');

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports.listToMap = (keyAttribute, objectList) => {
    try {
        logService.debug("Start: object-service.listToMap");
        
        var map = new HashMap();
        var keyAttributeStr = String(keyAttribute);

        if (objectList != null) {
            // to handle single object
            if (objectList.length == undefined) {
                map.set(getNestedAttributes(keyAttributeStr, objectList), objectList);
            } else {
                for (var i = 0; i < objectList.length; i++) {
                    var object = objectList[i];

                    map.set(getNestedAttributes(keyAttributeStr, object), object);
                }
            }
        }

        return map;
    } finally {
        logService.debug("End: object-service.listToMap");
    }
}

let getNestedAttributes = (keyAttribute, object) => {
    if (keyAttribute.indexOf('.') != -1)
    {
        // split . and recursive
        var key = keyAttribute.substring(0, keyAttribute.indexOf('.'));
        var nestedObject = object[key];
        return getNestedAttributes(keyAttribute.substring(keyAttribute.indexOf('.')+1), nestedObject);
    } else {
        return object[keyAttribute];
    }
}