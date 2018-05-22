const log4js = require('log4js');
const path = require('path');
var dotenv = require('dotenv');

const accessLog = log4js.getLogger('http');
const appLog = log4js.getLogger('app');
const serviceLog = log4js.getLogger('service');

module.exports.log_access = (req, res, time) => {
    // accessLog.info(req);
    accessLog.info([
        req.headers ['x-forwarded-for'] ||  req.info.remoteAddress,
        req.method,
        req.url.href,
        req.info.referer  ||  '-' ,
        req.id  ||  '-' ,
        time,
        '-', // reserve for content length
        res.statusCode,
        ]. join ( '|' ));
}  

module.exports.isInfoEnabled = () => {
    return appLog.isInfoEnabled();
}

module.exports.info = (msg) => {
    var scriptName = __filename.slice(__dirname.length + 1);
    appLog.addContext('script', scriptName);

    appLog.info(msg);
} 

module.exports.isDebugEnabled = () => {
    return appLog.isDebugEnabled();
}

module.exports.debug = (msg) => {
    var scriptName = __filename.slice(__dirname.length + 1);
    appLog.addContext('script', scriptName);

    appLog.debug(msg);
}

module.exports.isFatalEnabled = () => {
    return appLog.isFatalEnabled();
}

module.exports.fatal = (msg, err) => {
    var scriptName = __filename.slice(__dirname.length + 1);
    appLog.addContext('script', scriptName);

    if (err != null) {
        appLog.fatal(msg, err);
    } else {
        appLog.fatal(msg);
    }
}

module.exports.isErrorEnabled = () => {
    return appLog.isErrorEnabled();
}

module.exports.error = (msg, err) => {
    var scriptName = __filename.slice(__dirname.length + 1);
    appLog.addContext('script', scriptName);

    if (err != null) {
        appLog.error(msg, err);
    } else {
        appLog.error(msg);
    }
}

module.exports.isTraceEnabled = () => {
    return appLog.isTraceEnabled();
}

module.exports.trace = (msg) => {
    var scriptName = __filename.slice(__dirname.length + 1);
    appLog.addContext('script', scriptName);

    appLog.trace(msg);
}

module.exports.log_service = (service) => {
    serviceLog.info([
        service.id,
        service.name,
        service.req,
        service.res || '-',
        service.statusCode,
        time || '-',
    ]. join ( '|' ));

}