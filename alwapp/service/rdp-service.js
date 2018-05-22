var soap = require('strong-soap').soap;
var textService = require('./text-service');
/**
 * Logging service
 */
const logService = require('../service/log-service');

module.exports.getHolidayByDate = (start,end) => {
    return new Promise((resolve, reject) => 
    {
        try
        {
            if (logService.isDebugEnabled()) {
                logService.debug('Start: rdp-service.getHolidayByDate');
            }

            // TODO: read configuration from db
            var confUrl = 'https://test-omws.ais.co.th/rdpws/RdpManageService.svc?wsdl';
            // var confUrl = 'http://alws.orcsoft.mockable.io/rdpws/RdpManageService.svc?wsdl';
            var confTo = 'https://test-omws.ais.co.th/rdpws/RdpManageService.svc';

            var requestArgs = {
                desc: '',
                start_date: start,
                end_date: end,
                is_active: 'true'
            };
            // var customRequestHeaders = [{
            //     Sequence : {
            //         Identifier : 's:Sender a:ActionNotSupported',
            //         MessageNumber : '1',
            //         qname : {
            //             nsURI : 'http://docs.oasis-open.org/ws-rx/wsrm/200702',
            //             name : 'wsrm'
            //         }
            //     }
            // }, 
            // {
            //     value : {
            //         Action : 'http://tempuri.org/IRdpManageService/GET_HOLIDAYS'
            //     },
            //     qname : {
            //         nsURI : 'http://www.w3.org/2005/08/addressing',
            //         name : 'wsa'
            //     }
            // },
            // {
            //     value : {
            //         MessageID : 'uuid:' + textService.uuid()
            //     },
            //     qname : {
            //         nsURI : 'http://www.w3.org/2005/08/addressing',
            //         name : 'wsa'
            //     }
            // },
            // {
            //     value : {
            //         To : confTo
            //     },
            //     qname : {
            //         nsURI : 'http://www.w3.org/2005/08/addressing',
            //         name : 'wsa'
            //     }
            // }];
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

                client.addSoapHeader("<wsrm:Sequence xmlns:wsrm=\"http://docs.oasis-open.org/ws-rx/wsrm/200702\"><wsrm:Identifier>s:Sender a:ActionNotSupported</wsrm:Identifier><wsrm:MessageNumber>1</wsrm:MessageNumber></wsrm:Sequence>");
                client.addSoapHeader("<wsa:Action xmlns:wsa=\"http://www.w3.org/2005/08/addressing\">http://tempuri.org/IRdpManageService/GET_HOLIDAYS</wsa:Action>");
                client.addSoapHeader("<wsa:MessageID xmlns:wsa=\"http://www.w3.org/2005/08/addressing\">uuid:" + textService.uuid() + "</wsa:MessageID>");
                client.addSoapHeader("<wsa:To xmlns:wsa=\"http://www.w3.org/2005/08/addressing\">" + confTo + "</wsa:To>");
                // for (let i = 0, n = customRequestHeaders.length; i < n; i++) {
                //     client.addSoapHeader(customRequestHeaders[i]);
                // }

                if (logService.isDebugEnabled()) {
                    logService.debug('after addSoapHeader');
                }
                //                logService.debug('MessageID = ' + customRequestHeader.MessageID);

                // Inspect GetQuote operation. You can inspect Service: {Port: {operation: {
                // console.log(client);
                // var description = client.describe();
                // console.log(client.httptempuriorgIRdpManageServiceGET_HOLIDAYS);
                //console.log(JSON.stringify(description.RdpManageService.RdpManageServiceSoap.GET_HOLIDAYS));
                var method = client['RdpManageService']['WSHttpBinding_IRdpManageService']['GET_HOLIDAYS'];
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
                        logService.debug('End: rdp-service.getHolidayByDate');
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

module.exports.isSpecialDay = async (date) => {

    soap.createClient(url, function (date) {
        console.log(client)
        client.GET_HOLIDAYS(args, function (err, result) {
            console.log(result);
        });
    });
}