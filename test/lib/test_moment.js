var assert = require('assert');
var moment = require('moment');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('moment', function() {
    describe('#moment.utc(\'01/01/2018\', \'DD/MM/YYYY\').toDate()', function() {
        it('should return 1 Jan 2018', async function() {
            console.log(moment.utc('01/01/2018', 'DD/MM/YYYY').toDate());
        });
    });

    describe('#moment.utc(new Date()).toDate()', function() {
        it('should return current date', async function() {
            console.log(moment.utc(new Date()).toDate());
        });
    });

    describe('#moment.utc(new Date()).subtract(1,\'day\').toDate()', function() {
        it('should return current date', async function() {
            console.log(moment.utc(new Date()).subtract(1,'day').toDate());
        });
    });

    describe('#moment.utc(new Date()).format(\'MMYYYY\')', function() {
        it('should return string 012018', async function() {
            assert.equal(moment.utc('01/01/2018', 'DD/MM/YYYY').format('MMYYYY'), '012018');
        });
    });

    describe('#moment.utc(new Date()).set({hour:0,minute:0,second:0,millisecond:0})', function() {
        it('should return current date 00:00:00.000', async function() {
            console.log(moment.utc(new Date()).set({hour:0,minute:0,second:0,millisecond:0}));
        });
    });

    describe('#moment.utc(new Date()).startOf(\'day\'))', function() {
        it('should return current date 00:00:00.000', async function() {
            console.log(moment.utc(new Date()).startOf('day'));
        });
    });

    describe('#moment.utc(new Date()).endOf(\'day\'))', function() {
        it('should return current date 23:59:59.999', async function() {
            console.log(moment.utc(new Date()).endOf('day'));
        });
    });

});
