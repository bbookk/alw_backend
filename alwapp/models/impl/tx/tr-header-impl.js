const modelTrHeader = require('../../../models').TxTrHeader;
const modelTrDetail = require('../../../models').TxTrDetail;

module.exports = {
    insert: async function (objTR) {
        console.log('model tr-header-impl');
        return await modelTrHeader.create(objTR, {
            include: [{
                model: modelTrDetail,
                as: 'TxTrDetailHeaderIdFkeys'
            }]
        })
    },
    update: function () {

    },
    delete: function () {

    },
    list: function () {

    }
}




