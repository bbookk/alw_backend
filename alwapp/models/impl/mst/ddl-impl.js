const modelTrHeader = require('../../../models').TxTrHeader;
const modelTrDetail = require('../../../models').TxTrDetail;

module.exports = {
    insert: async function (objTR) {
        return await modelTrHeader.create(objTR
            // {
            // fileName: 'TR20170301',
            // recSuccess: '2500',
            // recFail: '0',
            // status: 'success',
            // errorMsg: '',
            // createDt: '2017-03-03',
            // createBy: 'batch',
            // TxTrDetailHeaderIdFkeys: objTR
            // [{
            //     organizeName: 'ACC',
            //     agentName: 'worawud',
            //     activity: objTR.activity_name,
            //     startDt: objTR.start_time,
            //     stopDt: objTR.end_time,
            //     createDt: '2017-03-03',
            //     createBy: 'batch',
            // }]
            // }
            , {
                include: [{
                    model: modelTrDetail,
                    as: 'TxTrDetailHeaderIdFkeys'
                }]
            })
    },
    update: async function () {

    },
    delete: async function () {

    },
    list: async function () {

    }
}




