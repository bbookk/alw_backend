
const MstParam = require('../models').MstParam;
const Op = require('../models').Sequelize.Op;
const constant = require('../../alwapp/class/constant').Constant;
const ParamInfo = require('./../class/param-info')
const logger = require('./log-service')

// let loadParam = new Promise((resolve, reject) => {
//     //return new Promise((resolve, reject) => {
//     return MstParam.findAll({
//         where: {
//             key: {
//                 [Op.like]: 'INIT%'
//             },
//             useFlag: 'Y'
//         }
//     }).then((todos) => {
//         resolve(nodeData = todos.map((node) => node.get({ plain: true })));
//     }).catch((error) => { logger.error(error) });
//     // });

// })
module.exports.loadParamConstant = new Promise((resolve, reject) => {
    if (logger.isDebugEnabled()) {
        logger.debug("Start loadParamConstant");
    }

    loadParam().then((data) => {
        setConstant(data)
        resolve(true)
    })
    if (logger.isTraceEnabled()) {
        logger.trace("Response loadParamConstant: " + data);
    }
})


function loadParam() {
    return new Promise((resolve, reject) => {
        MstParam.findAll({
            where: {
                key: {
                    [Op.like]: 'INIT%'
                },
                useFlag: 'Y'
            }
        }).then((todos) => {
            resolve(nodeData = todos.map((node) => node.get({ plain: true })));
        }).catch((error) => { logger.error(error);reject(new Error('can not load mst param')) });
        // });

    })
}

function setConstant(data) {
    //let paramInfo = new ParamInfo();
    if (logger.isDebugEnabled()) {
        logger.debug("Start SetConstant");
    }
    data.forEach(e => {
        constant.PARAM[e.paramName] = e.value
    });
    if (logger.isDebugEnabled()) {
        logger.debug("End SetConstant");
    }
}
