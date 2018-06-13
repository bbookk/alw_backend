
var moment = require('moment');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./alwapp/config/test-log4js.json');

describe('moment', function() {
    describe('#moment(\'01/01/2018\', \'DD/MM/YYYY\').utc(7).toDate()', function() {
        it('should return 1 Jan 2018', async function() {
            console.log(moment('01/01/2018', 'DD/MM/YYYY').utc(7).toDate());
        });
    });

    describe('#moment(new Date()).utc(7).toDate()', function() {
        it('should return current date', async function() {
            console.log(moment(new Date()).utc(7).toDate());
        });
    });

    describe('#moment(new Date()).subtract(1,\'day\').utc(7).toDate()', function() {
        it('should return current date', async function() {
            console.log(moment(new Date()).subtract(1,'day').utc(7).toDate());
        });
    });

    describe('#moment(new Date()).utc(7).format(\'MMYYYY\')', function() {
        it('should return current date string in format MMYYYY', async function() {
            console.log(moment(new Date()).utc(7).format('MMYYYY'));
        });
    });

    describe('#moment(new Date()).utc(7).set({hour:0,minute:0,second:0,millisecond:0})', function() {
        it('should return current date 00:00:00.000', async function() {
            console.log(moment(new Date()).utc(7).set({hour:0,minute:0,second:0,millisecond:0}));
        });
    });

});
