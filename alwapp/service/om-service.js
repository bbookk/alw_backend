var httpntlm = require('httpntlm');
var sslRootCAs = require('ssl-root-cas').addFile(__dirname + '/../../ssl/test-omws.cer');
// var sslRootCAs = require('ssl-root-cas/latest');
// sslRootCAs.inject();

/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports.searchEmployeeDetail = (employeeInfoReq) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: om-service.searchEmployeeDetail');
            }

            const methodName = 'OM_WS_SearchEmployeeDetail';

            // TODO: read configuration from db
            var confOmCode = 'OMTESTALLOWANCE';
            var confUrl = 'https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData';
            var confUsername = 'stg-um_ehr';
            var confPassword = 'gSkZ#@D2ax!P';
            var confDomain = 'corp-ais900dev';
            var confWorkstation = '';
            var confCorporate = 'Advanced Info Service';

            var body = {} // empty Object
            var key = 'Orientation Sensor';
            body['methodName'] = methodName;
            body['omCode'] = confOmCode;

            // TODO: to complete all search parameters
            body['parameterList'] = [
                {
                    "name": "CO",
                    "value": confCorporate
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
                    "value": ""
                },
                {
                    "name": "SurnameEN",
                    "value": ""
                },
                {
                    "name": "NameTH",
                    "value": ""
                },
                {
                    "name": "SurnameTH",
                    "value": ""
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
            ];

            if (employeeInfoReq.pin != null)
            {
                body['parameterList'].push(
                    {
                        "name": "Pin",
                        "value": employeeInfoReq.pin,
                    });
            }

            body['parameterList'].push(
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
            );        

            body['transactionID'] = "8e1f2a96-69d5-4bc4-ac01-99e771c024e3";

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
                    }
                }, function (err, _res) {
                if (err) {
                    logService.error(err);

                    reject(err);
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
                        var employeeInfoJson = JSON.parse(responeJson.responseDataList)[0];

                        // mapping json response to EmployeeInfo
                        var employeeInfoResp = new (require('../class').employeeInfo)();
                        employeeInfoResp.engName = employeeInfoJson.ENGNAME;
                        employeeInfoResp.engSurname = employeeInfoJson.ENGSURNAME;
                        employeeInfoResp.thName = employeeInfoJson.THNAME;
                        employeeInfoResp.thSurname = employeeInfoJson.THSURNAME;
                        employeeInfoResp.pin = employeeInfoJson.PIN;

                        // console.log("Result object = " + JSON.stringify(employeeInfoResp));
                        
                        resolve(employeeInfoResp);

                        if (logService.isDebugEnabled()) {
                            logService.debug('End: om-service.searchEmployeeDetail');
                        }
                        // return await employeeInfoResp;
                    } else {
                        logService.debug("Not found");
                        reject(new Error('Not found'));
                    }
                }
            });
        }
        catch (err) {
            logService.error(err);
            reject(err);
        }
    });
}