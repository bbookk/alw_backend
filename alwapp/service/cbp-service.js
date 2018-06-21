const AgentInfo = require('../class/agent-info');
const ServiceError = require('../class/service-error');
const Constant = require('../class/constant').Constant;
const HashMap = require('hashmap');

var soap = require('strong-soap').soap;
var textService = require('./text-service');

/**
 * Logging service
 */
const logService = require('../service/log-service');

const SERVICE_ID = 'CBP';

/**
 * Return single record of AgentInfo
 * @param {*} pin for example 00900164
 */
module.exports.getAgentByPin = (pin) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        var methodName = 'GetAgentByPIN';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: cbp-service.getAgentByPin');
            }
            // TODO: read configuration from db
            var confUrl = 'http://10.239.220.104/Payroll_GetUserInfo/WS_GetData.asmx?WSDL';
            var confTo = 'http://tempuri.org/GetAgentByPIN';

            // remove leading '0'
            var requestArgs = {
                PinCode: pin.replace(/^0+/, ''),
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
                    throw err;
                }


                if (logService.isDebugEnabled()) {
                    logService.debug('after addSoapHeader');
                }

                var method = client['WS_GetData']['WS_GetDataSoap'][methodName];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                if (logService.isDebugEnabled()) {
                    logService.debug('Before call soap');
                }
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (logService.isDebugEnabled()) {
                            logService.debug('after call soap');
                        }

                        if (err) {
                            throw err;
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
                            errorCode = Constant.SERVICE.ERROR_CODE_SUCCESS;

                            if (result.GetAgentByPINResult.diffgram != null) {
                                // agentInfoResp.GetAgentByPINResult.diffgram.NewDataSet.Table
                                var agentInfoResp = toAgentInfo(result.GetAgentByPINResult.diffgram.NewDataSet.Table);

                                resolve(agentInfoResp);
                            } else {
                                logService.debug("Not found");

                                throw new Error('Not found');
                            }
                        } else {
                            reject(result);
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        if (! errorCode) {
                            errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;
                        }

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));                        
                    } finally {
                        if (logService.isDebugEnabled()) {
                            logService.debug('End cbp-service.getAgentByPin');
                        }

                        logService.log_service(
                            {
                                id: SERVICE_ID,
                                name: methodName,
                                req: 'REQUEST',
                                res: 'RESPONSE',
                                message: errorMessage,
                                statusCode: errorCode,
                                time: (Date.now() - startTime)
                            }
                        );
                    }
                });
              });
        }
        catch (err) {
            logService.error(err);

            var serviceError = null;
            
            if (err.message)
            {
                // check if timeout
                if (err.message.indexOf('ECONNRESET') != -1) {
                    serviceError = new ServiceError(err.message, Constant.SERVICE.ERROR_CODE_CONNECTION_RESET);
                } else {
                    serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
                }
            } else {
                // reject with general error
                serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
            }

            // do log service
            logService.log_service(
                {
                    id: SERVICE_ID,
                    name: methodName,
                    req: JSON.stringify(body),
                    resp: '',
                    message: serviceError.message,
                    statusCode: serviceError.code,
                    time: (Date.now() - startTime)
                }
            );

            reject(err);
        } 
    });
}

/**
 * Return single record of AgentInfo
 * @param {*} username for example 'chatk179'
 */
module.exports.getAgentByUser = (username) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        var methodName = 'GetAgentByUser';
        
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
                    throw err;
                }


                logService.debug('after addSoapHeader');

                var method = client['WS_GetData']['WS_GetDataSoap'][methodName];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                logService.debug('Before call soap');
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    var errorMessage;
                    var errorCode;

                    try {
                        logService.debug('after call soap');

                        if (err) {
                            throw err;
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
                            errorCode = Constant.SERVICE.ERROR_CODE_SUCCESS;

                            if (result.GetAgentByUserResult.diffgram != null) {
                                    // agentInfoResp.GetAgentByUserResult.diffgram.NewDataSet.Table
                                var agentInfoResp = toAgentInfo(result.GetAgentByUserResult.diffgram.NewDataSet.Table);

                                resolve(agentInfoResp);
                            } else {
                                logService.debug("Not found");

                                throw new Error('Not found');
                            }
                        } else {
                            reject(result);
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        if (! errorCode) {
                            errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;
                        }

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));
                    } finally {
                        if (logService.isDebugEnabled()) {
                            logService.debug('End cbp-service.getAgentByUser');
                        }

                        logService.log_service(
                            {
                                id: SERVICE_ID,
                                name: methodName,
                                req: 'REQUEST',
                                res: 'RESPONSE',
                                message: errorMessage,
                                statusCode: errorCode,
                                time: (Date.now() - startTime)
                            }
                        );
                    }
                    
                });
              });
        }
        catch (err) {
            logService.error(err);

            var serviceError = null;
            
            if (err.message)
            {
                // check if timeout
                if (err.message.indexOf('ECONNRESET') != -1) {
                    serviceError = new ServiceError(err.message, Constant.SERVICE.ERROR_CODE_CONNECTION_RESET);
                } else {
                    serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
                }
            } else {
                // reject with general error
                serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
            }

            // do log service
            logService.log_service(
                {
                    id: SERVICE_ID,
                    name: methodName,
                    req: JSON.stringify(body),
                    resp: '',
                    message: serviceError.message,
                    statusCode: serviceError.code,
                    time: (Date.now() - startTime)
                }
            );

            reject(err);
        } 
    });
}

/**
 * Return list of AgentInfo
 */
module.exports.getAllAgents = (filterFn) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        var methodName = 'GetAllAgent';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: cbp-service.getAllAgents, filterFn = ' + filterFn);
            }
            // TODO: read configuration from db
            var confUrl = 'http://10.239.220.104/Payroll_GetUserInfo/WS_GetData.asmx?WSDL';
            var confTo = 'http://tempuri.org/GetAllAgent';

            var requestArgs = {};

            var options = {};

            soap.createClient(confUrl, options, function(err, client) {
                logService.debug('Create client');
                // uncomment to check client
                // console.log(client);

                if (err) {
                    throw err;
                }


                logService.debug('after addSoapHeader');

                var method = client['WS_GetData']['WS_GetDataSoap'][methodName];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                logService.debug('Before call soap');
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    var errorMessage;
                    var errorCode;

                    try {
                        logService.debug('after call soap');

                        if (err) {
                            throw err;
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
                            errorCode = Constant.SERVICE.ERROR_CODE_SUCCESS;

                            var agentInfoList = [];
                            // agentInfoResp.GetAgentByUserResult.diffgram.NewDataSet.Table
                            
                            // to support single record
                            if (result.GetAllAgentResult.diffgram.NewDataSet.Table.length == undefined) {
                                if (!filterFn || filterFn(result.GetAllAgentResult.diffgram.NewDataSet.Table)) {
                                    agentInfoList.push(result.GetAllAgentResult.diffgram.NewDataSet.Table);
                                }
                            } else {
                                result.GetAllAgentResult.diffgram.NewDataSet.Table.forEach(function(item) {
                                    if (!filterFn || filterFn(item)) {
                                        agentInfoList.push(toAgentInfo(item));
                                    }
                                });
                                }

                            resolve(agentInfoList);
                        } else {
                            reject(result);
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        if (! errorCode) {
                            errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;
                        }

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));
                    } finally {
                        if (logService.isDebugEnabled()) {
                            logService.debug('End cbp-service.getAllAgents');
                        }

                        logService.log_service(
                            {
                                id: SERVICE_ID,
                                name: methodName,
                                req: 'REQUEST',
                                res: 'RESPONSE',
                                message: errorMessage,
                                statusCode: errorCode,
                                time: (Date.now() - startTime)
                            }
                        );
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

let toAgentInfo = (cbpAgentRecord) => {
    var agentInfo = new AgentInfo();

    agentInfo.updateDate = cbpAgentRecord['UPD_DATE'];
    agentInfo.dateMonth = cbpAgentRecord['DATEMONTH'];
    // to support api get manager which not have this attribute
    if (cbpAgentRecord['PINCODE']) {
        // padding '0' to pin if not 8 digits
        agentInfo.pin = cbpAgentRecord['PINCODE'].padStart(8, '0');
    }
    agentInfo.fullName = cbpAgentRecord['AGENT'];
    agentInfo.username = cbpAgentRecord['USERNAME'];
    agentInfo.loginId = cbpAgentRecord['LOGIN_ID'];
    agentInfo.managerPin = cbpAgentRecord['PINCODE_MANAGER'].padStart(8, '0');
    agentInfo.managerFullName = cbpAgentRecord['MANAGER'];
    agentInfo.supervisorPin = cbpAgentRecord['PINCODE_SUP'].padStart(8, '0');
    agentInfo.supervisorFullName = cbpAgentRecord['SUPERVISOR'];
    agentInfo.cbpTeamId = cbpAgentRecord['CBP_TEAM_ID'];
    agentInfo.cbpTeamName = cbpAgentRecord['CBP_TEAM'];
    agentInfo.cbpGroupId = cbpAgentRecord['CBP_GROUP_ID'];
    agentInfo.cbpGroupName = cbpAgentRecord['CBP_GROUP'];
    agentInfo.effectiveDate = cbpAgentRecord['EFFECTIVE_DATE'];

    return agentInfo;
}

/**
 * Return single record of AgentInfo
 * @param {*} pin for example 00900164
 */
module.exports.getManagerByPin = (pin) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        var methodName = 'GetManagerByPIN';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: cbp-service.getManagerByPin');
            }
            // TODO: read configuration from db
            var confUrl = 'http://10.239.220.104/Payroll_GetUserInfo/WS_GetMngData.asmx?WSDL';
            var confTo = 'http://tempuri.org/GetManagerByPIN';

            // remove leading '0'
            var requestArgs = {
                PinCode: pin.replace(/^0+/, ''),
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
                    throw err;
                }


                if (logService.isDebugEnabled()) {
                    logService.debug('after addSoapHeader');
                }

                var method = client['WS_GetMngData']['WS_GetMngDataSoap'][methodName];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                if (logService.isDebugEnabled()) {
                    logService.debug('Before call soap');
                }
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (logService.isDebugEnabled()) {
                            logService.debug('after call soap');
                        }

                        if (err) {
                            throw err;
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
                            errorCode = Constant.SERVICE.ERROR_CODE_SUCCESS;

                            if (result.GetManagerByPINResult.diffgram != null) {

                                // agentInfoResp.GetManagerByPINResult.diffgram.NewDataSet.Table
                                // create manager (agent) info by using first item in list
                                var agentInfoResp;
                                
                                if (result.GetManagerByPINResult.diffgram.NewDataSet.Table.length) {
                                    agentInfoResp = toAgentInfo(result.GetManagerByPINResult.diffgram.NewDataSet.Table[0]);
                                } else {
                                    agentInfoResp = toAgentInfo(result.GetManagerByPINResult.diffgram.NewDataSet.Table);
                                }

                                // simplify manager to be like agent
                                agentInfoResp.pin = agentInfoResp.managerPin;
                                agentInfoResp.fullName = agentInfoResp.managerFullName;
                                agentInfoResp.supervisorPin = null; // manager doesnt have supervisor
                                agentInfoResp.supervisorFullName = null; // manager doesnt have supervisor
                                agentInfoResp.cbpGroupId = null; // manager has many group, see agentLowerInfoList
                                agentInfoResp.cbpGroupName = null; // manager has many group, see agentLowerInfoList
                                agentInfoResp.cbpTeamId = null; // manager has many team, see agentLowerInfoList
                                agentInfoResp.cbpTeamName = null; // manager has many team, see agentLowerInfoList

                                // next create agent lower info list for each supervisor under this manager
                                var agentLowerInfoList = [];

                                if (result.GetManagerByPINResult.diffgram.NewDataSet.Table.length) {
                                    result.GetManagerByPINResult.diffgram.NewDataSet.Table.forEach( function(item) {
                                        var supervisorInfo = toAgentInfo(item);
                                        supervisorInfo.pin = supervisorInfo.supervisorPin;
                                        supervisorInfo.fullName = supervisorInfo.supervisorFullName;

                                        agentLowerInfoList.push(supervisorInfo);
                                    });
                                }

                                agentInfoResp.agentLowerInfoList = agentLowerInfoList;

                                resolve(agentInfoResp);
                            } else {
                                logService.debug("Not found");

                                throw new Error('Not found');
                            }
                        } else {
                            reject(result);
                        }

                        if (logService.isDebugEnabled()) {
                            logService.debug('End cbp-service.getManagerByPin');
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        if (! errorCode) {
                            errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;
                        }

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));                        
                    } finally {
                        logService.log_service(
                            {
                                id: SERVICE_ID,
                                name: methodName,
                                req: 'REQUEST',
                                res: 'RESPONSE',
                                message: errorMessage,
                                statusCode: errorCode,
                                time: (Date.now() - startTime)
                            }
                        );
                    }
                });
              });
        }
        catch (err) {
            logService.error(err);

            var serviceError = null;
            
            if (err.message)
            {
                // check if timeout
                if (err.message.indexOf('ECONNRESET') != -1) {
                    serviceError = new ServiceError(err.message, Constant.SERVICE.ERROR_CODE_CONNECTION_RESET);
                } else {
                    serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
                }
            } else {
                // reject with general error
                serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
            }

            // do log service
            logService.log_service(
                {
                    id: SERVICE_ID,
                    name: methodName,
                    req: JSON.stringify(body),
                    resp: '',
                    message: serviceError.message,
                    statusCode: serviceError.code,
                    time: (Date.now() - startTime)
                }
            );

            reject(err);
        } 
    });
}

/**
 * Return map of <pin, AgentInfo>
 */
module.exports.getAllManagers = () => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        var methodName = 'GetAllManager';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: cbp-service.getAllManagers');
            }
            // TODO: read configuration from db
            var confUrl = 'http://10.239.220.104/Payroll_GetUserInfo/WS_GetMngData.asmx?WSDL';
            var confTo = 'http://tempuri.org/GetAllManager';

            var requestArgs = {};

            var options = {};

            soap.createClient(confUrl, options, function(err, client) {
                if (logService.isDebugEnabled()) {
                    logService.debug('Create client');
                }

                if (logService.isTraceEnabled()) {
                    logService.trace(client);
                }

                if (err) {
                    throw err;
                }


                if (logService.isDebugEnabled()) {
                    logService.debug('after addSoapHeader');
                }

                var method = client['WS_GetMngData']['WS_GetMngDataSoap'][methodName];
                // var method = client['rdpwsRdpManageServicesvcService']['rdpwsRdpManageServicesvcPort']['httptempuriorgIRdpManageServiceGET_HOLIDAYS'];

                if (logService.isDebugEnabled()) {
                    logService.debug('Before call soap');
                }
                method(requestArgs, function(err, result, envelope, soapHeader) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (logService.isDebugEnabled()) {
                            logService.debug('after call soap');
                        }

                        if (err) {
                            throw err;
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
                            errorCode = Constant.SERVICE.ERROR_CODE_SUCCESS;

                            if (result.GetAllManagerResult.diffgram != null) {

                                // agentInfoResp.GetAllManagerResult.diffgram.NewDataSet.Table
                                // create manager (agent) info by using first item in list
                                var managerMap = new HashMap();

                                result.GetAllManagerResult.diffgram.NewDataSet.Table.forEach( function(item) {
                                    var supervisorInfo = toAgentInfo(item);
                                    supervisorInfo.pin = supervisorInfo.supervisorPin;
                                    supervisorInfo.fullName = supervisorInfo.supervisorFullName;

                                    // check if has manager pin in map
                                    if (managerMap.get(supervisorInfo.managerPin) == undefined) {
                                        var managerInfo = toAgentInfo(item);
                                        // simplify manager to be like agent
                                        managerInfo.pin = managerInfo.managerPin;
                                        managerInfo.fullName = managerInfo.managerFullName;
                                        managerInfo.supervisorPin = null; // manager doesnt have supervisor
                                        managerInfo.supervisorFullName = null; // manager doesnt have supervisor
                                        managerInfo.cbpGroupId = null; // manager has many group, see agentLowerInfoList
                                        managerInfo.cbpGroupName = null; // manager has many group, see agentLowerInfoList
                                        managerInfo.cbpTeamId = null; // manager has many team, see agentLowerInfoList
                                        managerInfo.cbpTeamName = null; // manager has many team, see agentLowerInfoList
                                        // next create agent lower info list for each supervisor under this manager

                                        // initial list of supervisor under this manager
                                        managerInfo.agentLowerInfoList = [];
                                        managerMap.set(supervisorInfo.managerPin, managerInfo);
                                    }

                                    managerInfo = managerMap.get(supervisorInfo.managerPin);

                                    managerInfo.agentLowerInfoList.push(supervisorInfo);
                                });

                                resolve(managerMap);
                            } else {
                                logService.debug("Not found");

                                throw new Error('Not found');
                            }
                        } else {
                            reject(result);
                        }

                        if (logService.isDebugEnabled()) {
                            logService.debug('End cbp-service.getAllManagers');
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        if (! errorCode) {
                            errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;
                        }

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));                        
                    } finally {
                        logService.log_service(
                            {
                                id: SERVICE_ID,
                                name: methodName,
                                req: 'REQUEST',
                                res: 'RESPONSE',
                                message: errorMessage,
                                statusCode: errorCode,
                                time: (Date.now() - startTime)
                            }
                        );
                    }
                });
              });
        }
        catch (err) {
            logService.error(err);

            var serviceError = null;
            
            if (err.message)
            {
                // check if timeout
                if (err.message.indexOf('ECONNRESET') != -1) {
                    serviceError = new ServiceError(err.message, Constant.SERVICE.ERROR_CODE_CONNECTION_RESET);
                } else {
                    serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
                }
            } else {
                // reject with general error
                serviceError = new ServiceError(err, Constant.SERVICE.ERROR_CODE_UNKNOWN);
            }

            // do log service
            logService.log_service(
                {
                    id: SERVICE_ID,
                    name: methodName,
                    req: JSON.stringify(body),
                    resp: '',
                    message: serviceError.message,
                    statusCode: serviceError.code,
                    time: (Date.now() - startTime)
                }
            );

            reject(err);
        } 
    });
}