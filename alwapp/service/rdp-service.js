
let soap = require('soap');
let url = 'https://test-omws.ais.co.th/rdpws/RdpManageService.svc?wsdl';
let args = { name: 'value' };


module.exports.isSpecialDay = async (date) => {

    soap.createClient(url, function (date) {
        console.log(client)
        client.GET_HOLIDAYS(args, function (err, result) {
            console.log(result);
        });
    });


}