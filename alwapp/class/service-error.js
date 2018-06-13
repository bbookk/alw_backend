'use strict';

var util = require('util');

module.exports = function ServiceError(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.code = code;
};

util.inherits(module.exports, Error);