const OrganizeInfo = require('../class/organize-info');
const EmployeeInfo = require('../class/employee-info');
const ServiceError = require('../class/service-error');
const Constant = require('../class/constant').Constant;

var httpntlm = require('httpntlm');
var sslRootCAs = require('ssl-root-cas').addFile(__dirname + '/../../ssl/test-omws.cer');

// var sslRootCAs = require('ssl-root-cas/latest');
// sslRootCAs.inject();

/**
 * Logging service
 */
const logService = require('../service/log-service');

/**
 * Text service
 */
const textService = require('../service/text-service');

const SERVICE_ID = 'OM';

module.exports.searchEmployeeDetail = (employeeInfoReq) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        const methodName = 'OM_WS_SearchEmployeeDetail';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: om-service.searchEmployeeDetail');
            }

            // TODO: read configuration from db
            var confOmCode = 'OMTESTALLOWANCE';
            var confUrl = 'https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData';
            var confUsername = 'stg-um_ehr';
            var confPassword = 'gSkZ#@D2ax!P';
            var confDomain = 'corp-ais900dev';
            var confWorkstation = '';
            // var confCorporate = 'Advanced Info Service';
            // var confCorporate = 'Advanced Contact Center';
            var confTimeout = '5000'; // in milliseconds

            var body = {} // empty Object
            var key = 'Orientation Sensor';
            body['methodName'] = methodName;
            body['omCode'] = confOmCode;

            // TODO: to complete all search parameters
            body['parameterList'] = [
                {
                    "name": "CO",
                    "value": employeeInfoReq.companyName || '',
                },
                {
                    "name": "BU",
                    "value": ""
                },
                {
                    "name": "DP",
                    "value": ""
                },
                {
                    "name": "SC",
                    "value": ""
                },
                {
                    "name": "FC",
                    "value": ""
                },
                {
                    "name": "NameEN",
                    "value": employeeInfoReq.nameEn || ''
                },
                {
                    "name": "SurnameEN",
                    "value": employeeInfoReq.surnameEn || ''
                },
                {
                    "name": "NameTH",
                    "value": employeeInfoReq.nameTh || ''
                },
                {
                    "name": "SurnameTH",
                    "value": employeeInfoReq.surnameTh || ''
                },
                {
                    "name": "PositionName",
                    "value": ""
                },
                {
                    "name": "NickName",
                    "value": ""
                },        
                {
                    "name": "JobDesc",
                    "value": ""
                },
                {
                    "name": "Pin",
                    "value": employeeInfoReq.pin || '',
                },
                {
                    "name": "Username",
                    "value": ""
                },
                {
                    "name": "TelNo",
                    "value": ""
                },
                {
                    "name": "MobileNo",
                    "value": ""
                },
                {
                    "name": "ManagerName",
                    "value": ""
                }
            ];

            body['transactionID'] = textService.uuid();

            if (logService.isDebugEnabled()) {
                logService.debug("Before calling httpntlm");
            }
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(body));
            }
            
            httpntlm.post(
                {
                    url: confUrl,
                    username: confUsername,
                    password: confPassword,
                    workstation: confWorkstation,
                    domain: confDomain,
                    body: JSON.stringify(body),
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    timeout: confTimeout
                }, function (err, _res) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (err) {
                            throw err;
                        } else {
                            // check response status = 0000 for Success
                            if (logService.isTraceEnabled()) {
                                logService.trace("Response = " + _res.body);
                            }
                            var responeJson = JSON.parse(_res.body);

                            if (responeJson != null 
                                && responeJson.responseHeader != null 
                                && responeJson.responseHeader.status == '0000'
                                && responeJson.responseDataList != '')
                            {
                                var responseDataList = JSON.parse(responeJson.responseDataList);
                                var employeeInfoList = [];

                                // mapping json response to EmployeeInfo
                                responseDataList.forEach(function(item) {
                                    employeeInfoList.push(toEmployeeInfo(item));
                                });

                                // console.log("Result object = " + JSON.stringify(employeeInfoResp));
                                
                                if (logService.isDebugEnabled()) {
                                    logService.debug("employeeInfoList.length = " + employeeInfoList.length);
                                }

                                if (logService.isDebugEnabled()) {
                                    logService.debug('End: om-service.searchEmployeeDetail');
                                }

                                // get status code from om
                                errorCode = responeJson.responseHeader.status;
                                resolve(employeeInfoList);
                            } else {
                                logService.debug("Not found");
                                throw new Error('Not found');
                            }
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));
                    }finally {
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

            reject(serviceError);
        }
    });
}

module.exports.getEmployeeDetailByPin = (pin) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        const methodName = 'OM_WS_GetEmployeeProfileByPIN';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: om-service.getEmployeeDetailByPin');
            }


            // TODO: read configuration from db
            var confOmCode = 'OMTESTALLOWANCE';
            var confUrl = 'https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData';
            var confUsername = 'stg-um_ehr';
            var confPassword = 'gSkZ#@D2ax!P';
            var confDomain = 'corp-ais900dev';
            var confWorkstation = '';
            // var confCorporate = 'Advanced Info Service';
            // var confCorporate = 'Advanced Contact Center';
            var confTimeout = '5000'; // in milliseconds

            var body = {} // empty Object
            var key = 'Orientation Sensor';
            body['methodName'] = methodName;
            body['omCode'] = confOmCode;

            // TODO: to complete all search parameters
            body['parameterList'] = [
                {
                    "name": "Pin",
                    "value": pin.padStart(8, '0'),
                }
            ];

            body['transactionID'] = textService.uuid();

            if (logService.isDebugEnabled()) {
                logService.debug("Before calling httpntlm");
            }
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(body));
            }
            
            httpntlm.post(
                {
                    url: confUrl,
                    username: confUsername,
                    password: confPassword,
                    workstation: confWorkstation,
                    domain: confDomain,
                    body: JSON.stringify(body),
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    timeout: confTimeout
                }, function (err, _res) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (err) {
                            throw err;
                        } else {
                            // check response status = 0000 for Success
                            if (logService.isTraceEnabled()) {
                                logService.trace("Response = " + _res.body);
                            }
                            var responeJson = JSON.parse(_res.body);

                            if (responeJson != null 
                                && responeJson.responseHeader != null 
                                && responeJson.responseHeader.status == '0000'
                                && responeJson.responseDataList != '')
                            {
                                var responseDataList = JSON.parse(responeJson.responseDataList);
                                var employeeInfoList = [];

                                // mapping json response to EmployeeInfo
                                responseDataList.forEach(function(item) {
                                    employeeInfoList.push(toEmployeeInfo(item));
                                });

                                // console.log("Result object = " + JSON.stringify(employeeInfoResp));
                                
                                if (logService.isDebugEnabled()) {
                                    logService.debug("employeeInfoList.length = " + employeeInfoList.length);
                                }

                                if (logService.isDebugEnabled()) {
                                    logService.debug('End: om-service.getEmployeeDetailByPin');
                                }

                                // get status code from om
                                errorCode = responeJson.responseHeader.status;
                                resolve(employeeInfoList);
                            } else {
                                logService.debug("Not found");
                                throw new Error('Not found');
                            }
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));
                    }finally {
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

            reject(serviceError);
        }
    });
}

let toEmployeeInfo = (omEmployeeRecord) => {
    var employeeInfo = new EmployeeInfo();

    // support map parameter from both service, search employee and get employee
    employeeInfo.nameEng = omEmployeeRecord['ENGNAME'] || omEmployeeRecord['ENFIRSTNAME'];
    employeeInfo.surnameEng = omEmployeeRecord['ENGSURNAME'] || omEmployeeRecord['ENLASTNAME'];
    employeeInfo.nameTh = omEmployeeRecord['THNAME'] || omEmployeeRecord['THFIRSTNAME'];
    employeeInfo.surnameTh = omEmployeeRecord['THSURNAME'] || omEmployeeRecord['THLASTNAME'];
    employeeInfo.pin = omEmployeeRecord['PIN'].padStart(8, '0');
    employeeInfo.position = omEmployeeRecord['POSITION'] || omEmployeeRecord['POSITIONDESC'];
    employeeInfo.orgDesc = omEmployeeRecord['ORGDESC'];
    employeeInfo.orgCode = omEmployeeRecord['ORGCODE'] || omEmployeeRecord['ORGID'];
    employeeInfo.orgName = omEmployeeRecord['ORGNAME'];
    employeeInfo.nickname = omEmployeeRecord['NICKNAME'];
    employeeInfo.jobDesc = omEmployeeRecord['JOBDESC'];
    employeeInfo.positionId = omEmployeeRecord['POSITIONID'] || omEmployeeRecord['POSITIONCODE'];
    employeeInfo.email = omEmployeeRecord['EMAIL'];
    employeeInfo.pgGroup = omEmployeeRecord['PGGROUP'];
    employeeInfo.mobileNo = omEmployeeRecord['MOBILENO'];
    employeeInfo.telNo = omEmployeeRecord['TELNO'];
    employeeInfo.dpDesc = omEmployeeRecord['DPDESC'];
    employeeInfo.managerName = omEmployeeRecord['MANAGERNAME'] || omEmployeeRecord['MANAGER'];
    employeeInfo.buildingName = omEmployeeRecord['BUILDINGNAME'];
    employeeInfo.provinceCode = omEmployeeRecord['PROVINCECODE'];
    employeeInfo.floor = omEmployeeRecord['FLOOR'];
    employeeInfo.employeeType = omEmployeeRecord['EMPLOYEETYPE'];
    employeeInfo.idCard = omEmployeeRecord['IDCARD'];
    employeeInfo.companyCode = omEmployeeRecord['COMPANYCODE'];
    employeeInfo.companyName = omEmployeeRecord['COMPANYNAME'];
    employeeInfo.employeeGroup = omEmployeeRecord['EMPLOYEEGROUP'];
    
    return employeeInfo;
}

module.exports.getAllCompany = () => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        const methodName = 'OM_WS_ListCompanyInWireless';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: om-service.getAllCompany');
            }

            // TODO: read configuration from db
            var confOmCode = 'OMTESTALLOWANCE';
            var confUrl = 'https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData';
            var confUsername = 'stg-um_ehr';
            var confPassword = 'gSkZ#@D2ax!P';
            var confDomain = 'corp-ais900dev';
            var confWorkstation = '';
            var confTimeout = '5000'; // in milliseconds

            var body = {} // empty Object
            var key = 'Orientation Sensor';
            body['methodName'] = methodName;
            body['omCode'] = confOmCode;
            body['transactionID'] = textService.uuid();

            if (logService.isDebugEnabled()) {
                logService.debug("Before calling httpntlm");
            }
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(body));
            }
            
            httpntlm.post(
                {
                    url: confUrl,
                    username: confUsername,
                    password: confPassword,
                    workstation: confWorkstation,
                    domain: confDomain,
                    body: JSON.stringify(body),
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    timeout: confTimeout
                }, function (err, _res) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (err) {
                            throw err;
                        } else {
                            // check response status = 0000 for Success
                            if (logService.isTraceEnabled()) {
                                logService.trace("Response = " + _res.body);
                            }
                            var responeJson = JSON.parse(_res.body);

                            if (responeJson != null 
                                && responeJson.responseHeader != null 
                                && responeJson.responseHeader.status == '0000'
                                && responeJson.responseDataList != '')
                            {
                                var responseDataList = JSON.parse(responeJson.responseDataList);
                                var organizeInfoList = [];

                                // mapping json response to EmployeeInfo
                                responseDataList.forEach(function(item) {
                                    organizeInfoList.push(toOrganizeInfo(item));
                                });

                                // console.log("Result object = " + JSON.stringify(employeeInfoResp));
                                
                                if (logService.isDebugEnabled()) {
                                    logService.debug("organizeInfoList.length = " + organizeInfoList.length);
                                }

                                if (logService.isDebugEnabled()) {
                                    logService.debug('End: om-service.getAllCompany');
                                }

                                // get status code from om
                                errorCode = responeJson.responseHeader.status;
                                resolve(organizeInfoList);

                            } else {
                                logService.debug("Not found");
                                throw new Error('Not found');
                            }
                        }
                    } catch (err) {
                        logService.error(err);

                        errorMessage = err.message;
                        errorCode = Constant.SERVICE.ERROR_CODE_UNKNOWN;

                        // check if timeout
                        if (err.message.indexOf('timed out') != -1) {
                            errorCode = Constant.SERVICE.ERROR_CODE_CONNECTION_TIMEOUT;
                        }

                        reject (new ServiceError(errorMessage, errorCode));
                    }finally {
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

            reject(serviceError);
        }
    });
}

module.exports.getLowerOrganizeInfoListByOrgCode = (orgCode, level) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        const methodName = 'OM_WS_ListOrganizeLower';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: om-service.getOrganizeInfoListByOrgCode');
            }

            if (logService.isDebugEnabled()) {
                logService.debug('orgCode = ' + orgCode);
                logService.debug('level = ' + level);
            }

            // TODO: read configuration from db
            var confOmCode = 'OMTESTALLOWANCE';
            var confUrl = 'https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData';
            var confUsername = 'stg-um_ehr';
            var confPassword = 'gSkZ#@D2ax!P';
            var confDomain = 'corp-ais900dev';
            var confWorkstation = '';
            var confTimeout = '5000'; // in milliseconds

            var body = {} // empty Object
            var key = 'Orientation Sensor';
            body['methodName'] = methodName;
            body['omCode'] = confOmCode;
            body['transactionID'] = textService.uuid();

            // TODO: to complete all search parameters
            body['parameterList'] = [
                {
                    "name": "OrgCode",
                    "value": orgCode
                },
                {
                    "name": "Level",
                    "value": level | "0"
                }
            ];

            if (logService.isDebugEnabled()) {
                logService.debug("Before calling httpntlm");
            }
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(body));
            }
            
            httpntlm.post(
                {
                    url: confUrl,
                    username: confUsername,
                    password: confPassword,
                    workstation: confWorkstation,
                    domain: confDomain,
                    body: JSON.stringify(body),
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    timeout: confTimeout
                }, function (err, _res) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (err) {
                            throw err;
                        } else {
                            // check response status = 0000 for Success
                            if (logService.isTraceEnabled()) {
                                logService.trace("Response = " + _res.body);
                            }
                            var responeJson = JSON.parse(_res.body);

                            if (responeJson != null 
                                && responeJson.responseHeader != null 
                                && responeJson.responseHeader.status == '0000'
                                && responeJson.responseDataList != '')
                            {
                                var responseDataList = JSON.parse(responeJson.responseDataList);
                                var organizeInfoList = [];

                                // mapping json response to EmployeeInfo
                                responseDataList.forEach(function(item) {
                                    organizeInfoList.push(toOrganizeInfo(item));
                                });

                                // console.log("Result object = " + JSON.stringify(employeeInfoResp));
                                
                                if (logService.isDebugEnabled()) {
                                    logService.debug("organizeInfoList.length = " + organizeInfoList.length);
                                }

                                if (logService.isDebugEnabled()) {
                                    logService.debug('End: om-service.getOrganizeInfoListByOrgCode');
                                }

                                // get status code from om
                                errorCode = responeJson.responseHeader.status;
                                resolve(organizeInfoList);
                            } else {
                                // get status code from om
                                errorCode = responeJson.responseHeader.status;

                                logService.debug("Not found");
                                throw new Error('Not found');
                            }
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
                    }finally {
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

            reject(serviceError);
        }
    });
}

module.exports.getUpperOrganizeInfoListByOrgCode = (orgCode, level) => {
    return new Promise((resolve, reject) => 
    {
        // to calculate procesing time
        var startTime = Date.now();
        const methodName = 'OM_WS_ListOrganizeUpper';

        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: om-service.getOrganizeInfoListByOrgCode');
            }

            if (logService.isDebugEnabled()) {
                logService.debug('orgCode = ' + orgCode);
                logService.debug('level = ' + level);
            }

            // TODO: read configuration from db
            var confOmCode = 'OMTESTALLOWANCE';
            var confUrl = 'https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData';
            var confUsername = 'stg-um_ehr';
            var confPassword = 'gSkZ#@D2ax!P';
            var confDomain = 'corp-ais900dev';
            var confWorkstation = '';
            var confTimeout = '5000'; // in milliseconds

            var body = {} // empty Object
            var key = 'Orientation Sensor';
            body['methodName'] = methodName;
            body['omCode'] = confOmCode;
            body['transactionID'] = textService.uuid();

            // TODO: to complete all search parameters
            body['parameterList'] = [
                {
                    "name": "OrgCode",
                    "value": orgCode
                },
                {
                    "name": "Level",
                    "value": level | "0"
                }
            ];

            if (logService.isDebugEnabled()) {
                logService.debug("Before calling httpntlm");
            }
            if (logService.isTraceEnabled()) {
                logService.trace("Request: " + JSON.stringify(body));
            }
            
            httpntlm.post(
                {
                    url: confUrl,
                    username: confUsername,
                    password: confPassword,
                    workstation: confWorkstation,
                    domain: confDomain,
                    body: JSON.stringify(body),
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    timeout: confTimeout
                }, function (err, _res) {
                    var errorMessage;
                    var errorCode;

                    try {
                        if (err) {
                            throw err;
                        } else {
                            // check response status = 0000 for Success
                            if (logService.isTraceEnabled()) {
                                logService.trace("Response = " + _res.body);
                            }
                            var responeJson = JSON.parse(_res.body);

                            if (responeJson != null 
                                && responeJson.responseHeader != null 
                                && responeJson.responseHeader.status == '0000'
                                && responeJson.responseDataList != '')
                            {
                                var responseDataList = JSON.parse(responeJson.responseDataList);
                                var organizeInfoList = [];

                                // mapping json response to EmployeeInfo
                                responseDataList.forEach(function(item) {
                                    organizeInfoList.push(toOrganizeInfo(item));
                                });

                                // console.log("Result object = " + JSON.stringify(employeeInfoResp));
                                
                                if (logService.isDebugEnabled()) {
                                    logService.debug("organizeInfoList.length = " + organizeInfoList.length);
                                }

                                if (logService.isDebugEnabled()) {
                                    logService.debug('End: om-service.getOrganizeInfoListByOrgCode');
                                }

                                // get status code from om
                                errorCode = responeJson.responseHeader.status;
                                resolve(organizeInfoList);
                            } else {
                                // get status code from om
                                errorCode = responeJson.responseHeader.status;

                                logService.debug("Not found");
                                throw new Error('Not found');
                            }
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
                    }finally {
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

            reject(serviceError);
        }
    });
}

let toOrganizeInfo = (omOrganizeRecord) => {
    var organizeInfo = new OrganizeInfo();

    organizeInfo.orgCode = omOrganizeRecord['ORGCODE'] || omOrganizeRecord['OBJECTID'];
    organizeInfo.orgName = omOrganizeRecord['ORGNAME'];
    organizeInfo.orgDesc = omOrganizeRecord['ORGDESC'];
    organizeInfo.orgLevel = omOrganizeRecord['ORGLEVEL'];
    organizeInfo.higherOrg= omOrganizeRecord['HIGHERORG'];
    organizeInfo.higherOrgName = omOrganizeRecord['HIGHERORGNAME'];
    organizeInfo.higherOrgDesc = omOrganizeRecord['HIGHERORGDESC'];
    organizeInfo.higherOrgLevel = omOrganizeRecord['HIGHERORGLEVEL'];
    organizeInfo.displayLevel = omOrganizeRecord['DISPLAYLEVEL'];
    organizeInfo.objectId = omOrganizeRecord['OBJECTID'];
    organizeInfo.companyCode = omOrganizeRecord['COMPANYCODE'];
    organizeInfo.companyDescEn = omOrganizeRecord['DESCRIPTION_EN'];
    organizeInfo.companyDescTh = omOrganizeRecord['DESCRIPTION_TH'];

    return organizeInfo;
}