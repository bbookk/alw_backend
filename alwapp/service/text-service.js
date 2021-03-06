'use strict';
var crypto = require('crypto');
var pool = 31 * 128; // 36 chars minus 4 dashes and 1 four
var r = crypto.randomBytes(pool);
var j = 0;
var str = "10000000-1000-4000-8000-100000000000";
var len = str.length; // 36
var strs = [];

strs.length = len;
strs[8] = '-';
strs[13] = '-';
strs[18] = '-';
strs[23] = '-';

function uuid(){
  var ch;
  var chi;

  for (chi = 0; chi < len; chi++) {
    ch = str[chi];
    if ('-' === ch || '4' === ch) {
      strs[chi] = ch;
      continue;
    }

    // no idea why, but this is almost 4x slow if either
    // the increment is moved below or the >= is changed to >
    j++;
    if (j >= r.length) {
      r = crypto.randomBytes(pool);
      j = 0;
    }

    if ('8' === ch) {
      strs[chi] = (8 + r[j] % 4).toString(16);
      continue;
    }

    strs[chi] = (r[j] % 16).toString(16);
  }

  return strs.join('');
}

function encodeBase64(algorithm, key, text) {
  var cipher = crypto.createCipher(algorithm,key)
  var crypted = cipher.update(text,'utf8','base64')
  crypted += cipher.final('base64');
  return crypted;
}

function decodeBase64(algorithm, key, text) {
  var decipher = crypto.createDecipher(algorithm,key)
  var dec = decipher.update(text,'base64','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = { uuid, encodeBase64, decodeBase64 };