var soap = require('strong-soap').soap;
var textService = require('./text-service');
/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports.getAgentByPIN = (pin) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: cbp-service.getAgentByPIN');
            }
            // TODO: read configuration from db
            var confUrl = 'http://10.239.220.104/Payroll_GetUserInfo/WS_GetData.asmx?WSDL';
            var confTo = 'http://tempuri.org/GetAgentByPIN';

            var requestArgs = {
                PinCode: pin,
            };

            var options = {};

            soap.createClient(confUrl, options, function(err, client) {
                if (logService.isDebugEnabled()) {
                    logService.debug('Create client');
                }

                if (logService.isTraceEnabled()) {
                    logService.trace(client);
                }

                if (err) {
                    reject(err);
                }


                if (logService.isDebugEnabled()) {
                    logService.debug('after addSoapHeader');
                }

                var method = client['WS_GetData']['WS_GetDataSoap']['GetAgentByPIN'];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                if (logService.isDebugEnabled()) {
                    logService.debug('Before call soap');
                }
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    if (logService.isDebugEnabled()) {
                        logService.debug('after call soap');
                    }

                    if (err) {
                    //    console.log(err);
                        reject(err);
                    }
                    
                    //response envelope
                    if (logService.isTraceEnabled()) {
                        logService.trace('Response Envelope: \n' + envelope);
                    }
                    //'result' is the response body
                    if (logService.isTraceEnabled()) {
                        logService.trace('Result: \n' + JSON.stringify(result));
                    }

                    if (result) {
                        resolve(result);
                    } else {
                        reject(result);
                    }

                    if (logService.isDebugEnabled()) {
                        logService.debug('End cbp-service.getAgentByPIN');
                    }
                });
              });
        }
        catch (err) {
            logService.error(err);
            reject(err);
        } 
    });
}

module.exports.getAgentByUser = (username) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: cbp-service.getAgentByUser');
            }
            // TODO: read configuration from db
            var confUrl = 'http://10.239.220.104/Payroll_GetUserInfo/WS_GetData.asmx?WSDL';
            var confTo = 'http://tempuri.org/GetAgentByUser';

            var requestArgs = {
                UserName: username,
            };

            var options = {};

            soap.createClient(confUrl, options, function(err, client) {
                logService.debug('Create client');
                // uncomment to check client
                // console.log(client);

                if (err) {
                    console.log(err);
                    reject(err);
                }


                logService.debug('after addSoapHeader');

                var method = client['WS_GetData']['WS_GetDataSoap']['GetAgentByUser'];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                logService.debug('Before call soap');
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    logService.debug('after call soap');

                    if (err) {
                    //    console.log(err);
                        reject(err);
                    }
                    
                    //response envelope
                    if (logService.isTraceEnabled()) {
                        logService.trace('Response Envelope: \n' + envelope);
                    }
                    //'result' is the response body
                    if (logService.isTraceEnabled()) {
                        logService.trace('Result: \n' + JSON.stringify(result));
                    }

                    if (result) {
                        resolve(result);
                    } else {
                        reject(result);
                    }

                    if (logService.isDebugEnabled()) {
                        logService.debug('End cbp-service.getAgentByUser');
                    }
                });
              });
        }
        catch (err) {
            logService.error(err);
            reject(err);
        } 
    });
}