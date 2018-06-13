var Client = require('node-rest-client').Client;

/**
 * Logging service
 */
const logService = require('../service/log-service');

/**
 * Text service
 */
const textService = require('../service/text-service');

module.exports.sendOT = (request) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: sap-service.sendOT');
            }

            // TODO: read configuration from db
            var confUrl = 'http://10.138.47.137/sapgw/otRequisition';
            var confCallbackUrl = 'http://10.138.47.77/api/payroll/callback';
            var confTimeout = 5000; // in milliseconds

            var restClient = new Client();
 
            // set content-type header and data as json in args parameter
            var args = {
                data: { 
                    system : 'Allowance System',
                    requestId : textService.uuid() ,
                    requestTime : '',
                    callbackUrl : confCallbackUrl,
                    payload : {
                        "REQUEST_LIST":{
                                    "ITEM":[{
                                                "PERNR":"27591",
                                                "BEGDA":"01052018",
                                                "LGART":"ZT01",
                                                "ANZHL":"10"
                                    }]
                             }
                        }
                    // TODO: complete request object
                    },
                headers: { "Content-Type": "application/json" },
                timeout: confTimeout
            };
             
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(args));
            }

            var req = restClient.post(confUrl, args, function (data, response) {
                // check response status = 0000 for Success
                if (logService.isTraceEnabled()) {
                    logService.trace("Response = " + response);
                }
                var responseJson =data;

                if (responseJson != null
                    && responseJson.status == 'success')
                {
                    resolve(responseJson);

                    if (logService.isDebugEnabled()) {
                        logService.debug('End: sap-service.sendOT');
                    }
                    // return await employeeInfoResp;
                } else {
                    reject(responseJson);
                }
            });

            // handle  error while requesting
            req.on('requestTimeout', function (req) {
                logService.error('request has expired');
                req.abort();
                reject(new Error('request has expired'));
            });
             
            req.on('responseTimeout', function (res) {
                logService.error('response has expired');
                reject(new Error('response has expired'));
            });
             
            //it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts
            req.on('error', function (err) {
                logService.error('request error', err);
                reject(new Error(err));
            });
             
            // // registering remote methods
            // restClient.registerMethod("postMethod", "http://remote.site/rest/json/method", "POST");
             
            // client.methods.postMethod(args, function (data, response) {
            //     // parsed response body as js object
            //     console.log(data);
            //     // raw response
            //     console.log(response);
            // });
        }
        catch (err) {
            logService.error(err);
            reject(err);
        }
    });
}

module.exports.sendAllowance = (request) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: sap-service.sendAllowance');
            }

            // TODO: read configuration from db
            var confUrl = 'http://10.138.47.137/sapgw/allowanceRequisition';
            var confCallbackUrl = 'http://10.138.47.77/api/payroll/callback';
            var confTimeout = 5000; // in milliseconds

            var restClient = new Client();
 
            // set content-type header and data as json in args parameter
            var args = {
                data: { 
                    system : 'Allowance System',
                    requestId : textService.uuid() ,
                    requestTime : '',
                    callbackUrl : confCallbackUrl,
                    payload : {
                        "REQUEST_LIST":{
                                    "ITEM":[{
                                                "PERNR":"27591",
                                                "BEGDA":"01052018",
                                                "LGART":"ZT01",
                                                "ANZHL":"10"
                                    }]
                             }
                        }
                    // TODO: complete request object
                },
                headers: { "Content-Type": "application/json" },
                timeout: confTimeout
            };
             
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(args));
            }

            var req = restClient.post(confUrl, args, function (data, response) {
                // check response status = 0000 for Success
                if (logService.isTraceEnabled()) {
                    logService.trace("Response = " + response);
                }
                var responseJson =data;

                if (responseJson != null
                    && responseJson.status == 'success')
                {
                    resolve(responseJson);

                    if (logService.isDebugEnabled()) {
                        logService.debug('End: sap-service.sendAllowance');
                    }
                    // return await employeeInfoResp;
                } else {
                    reject(responseJson);
                }
            });

            // handle  error while requesting
            req.on('requestTimeout', function (req) {
                logService.error('request has expired');
                req.abort();
                reject(new Error('request has expired'));
            });
             
            req.on('responseTimeout', function (res) {
                logService.error('response has expired');
                reject(new Error('response has expired'));
            });
             
            //it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts
            req.on('error', function (err) {
                logService.error('request error', err);
                reject(new Error(err));
            });
             
            // // registering remote methods
            // restClient.registerMethod("postMethod", "http://remote.site/rest/json/method", "POST");
             
            // client.methods.postMethod(args, function (data, response) {
            //     // parsed response body as js object
            //     console.log(data);
            //     // raw response
            //     console.log(response);
            // });
        }
        catch (err) {
            logService.error(err);
            reject(err);
        }
    });
}

module.exports.receiveCallback = (request) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: sap-service.receiveCallback');
            }

            // TODO: handle receive callback

            resolve({ status:'success'});

            if (logService.isDebugEnabled()) {
                logService.debug('End: sap-service.receiveCallback');
            }
        }
        catch (err) {
            logService.error(err);
            reject(err);
        }
    });
}