const employeeService = require('../service/employee-service');
const omService = require('../service/om-service');
const EmployeeInfo = require('../class/employee-info');

const summaryDetailModel = require('../models').TxSummaryDetail;
const Constant = require('../class/constant').Constant;
const moment = require('moment');
const Op = require('../models').Sequelize.Op;

/**
 * Logging service
 */
const logService = require('../service/log-service');

const formatTimeReport = 'HH:mm';
const formatDtReport = 'DD/MM/YYYY HH:mm';

module.exports = {
    async getSummaryDaily(payload) {

        try {
            logService.info("Start: tx-summary-service.getSummaryDaily()");

            let whereFindAll = {}
            // check whether pin or name and surname has provided
            if (isNotEmpty(payload.pin)) {
                whereFindAll['pin'] = payload.pin
            } else if (payload.name && payload.surname) {
                // get pin from provided name or surname
                var employeeInfo = new EmployeeInfo();
                employeeInfo.nameEn = payload.name || '';
                employeeInfo.surnameEn = payload.surname || '';

                await omService.searchEmployeeDetail(employeeInfo)
                    .then(employeeInfoResp => {
                        if (logService.isDebugEnabled()) {
                            logService.debug("employeeInfoResp.length = " + employeeInfoResp.length);
                        }
                        whereFindAll['pin'] = employeeInfoResp[0].pin;
                    });
            } else {
                throw new ServiceError("Missing required parameters", Constant.API.STATUS_CODE_INVALID_PARAM);
            }

            var dateFrom, dateTo;
            /*  new format date to - from   month,year */
            if (isNotEmpty(payload.dateFrom)) {
                dateFrom = moment(payload.dateFrom, 'DD/MM/YYYY').startOf('month')
            }
            if (isNotEmpty(payload.dateTo)) {
                dateTo = moment(payload.dateFrom, 'DD/MM/YYYY').endOf('month')
            }

            //   if (isNotEmpty(payload.dateFrom)) {
            //     payload.dateFrom.months
            //     payload.dateFrom.years
            //     dateFrom = moment.utc(payload.dateFrom, 'DD/MM/YYYY').toDate();
            //   } else {
            //     if (isNotEmpty(payload.dateTo)) {
            //       // set default dateFrom to dateTo - 1
            //       dateFrom = moment.utc(payload.dateTo, 'DD/MM/YYYY').subtract(1,'day').toDate();
            //     } else {
            //       // set default dateFrom to yesterday if dateTo not present
            //       dateFrom = moment.utc(new Date()).subtract(1,'day').toDate();
            //     }
            //   }
            //   if (isNotEmpty(payload.dateTo)) {
            //     dateTo = moment.utc(payload.dateTo, 'DD/MM/YYYY').toDate();
            //   } else {
            //     // set default dateTo to dateFrom + 1
            //     dateTo = moment.utc(dateFrom).add(1, 'day').toDate();
            //   }

            if (logService.isDebugEnabled()) {
                logService.debug("dateFrom = " + dateFrom);
                logService.debug("dateTo = " + dateTo);
            }

            // set time of dateTo to 00:00:00.000
            dateFrom = moment.utc(dateFrom).startOf('day').toDate();
            // set time of dateTo to 23:59:59.999
            dateTo = moment.utc(dateTo).endOf('day').toDate();

            // create where clause of record_date
            whereFindAll['record_date'] = {
                [Op.between]: [dateFrom, dateTo]
            }

            // set value for partition column
            // create month and year array
            var monthYearList = [];
            var nextMonth = moment.utc(dateFrom).startOf('day');
            while (true) {
                if (nextMonth.toDate() <= dateTo) {
                    monthYearList.push(nextMonth.format('MMYYYY'));
                    nextMonth.add(1, 'month');
                    continue;
                } else {
                    break;
                }
            }

            // to use partition table
            whereFindAll['record_month'] = {
                [Op.in]: monthYearList
            }

            var employeeInfo = await employeeService.getEmployeeDetailWithOrganizeByPin(whereFindAll['pin']);

            if (logService.isTraceEnabled()) {
                logService.trace(JSON.stringify(employeeInfo));
            }

            let obj = await summaryDetailModel.findAll({
                where: whereFindAll,
            }).then((todos) => {
                return nodeData = todos.map((node) => node.get({ plain: true }));
            }).catch((error) => { throw error });

    
            let employeeInfoResp = objToJsonDaily(employeeInfo, obj)

            return employeeInfoResp;
        } finally {
            logService.info("End: tx-summary-service.getSummaryDaily()");
        }
    },
    async getDetail(payload) {

        try {
            logService.info("Start: tx-summary-service.getDetail()");
            

            let whereFindAll = {}
            // check whether pin or name and surname has provided
            if (isNotEmpty(payload.pin)) {
                whereFindAll['pin'] = payload.pin
            }
            
            whereFindAll['useFlag'] = 'Y'
       
            if (isNotEmpty(payload.date)) {

                 whereFindAll['recordDate'] = moment(payload.date).format('DD/MM/YYYY')
    
            }
            if (isNotEmpty(payload.recordMonth)) {
                whereFindAll['recordMonth'] = payload.recordMonth
            }

            let obj = await summaryDetailModel.findAll({
                where: whereFindAll
            }).then((todos) => {
                return nodeData = todos.map((node) => node.get({ plain: true }));
            }).catch((error) => { throw error });
            if (logService.isTraceEnabled()) {
                logService.trace(JSON.stringify(obj));
            }
            return objToJsonDailyDetail(obj);
        } finally {
            logService.info("End: tx-summary-service.getDetail()");
        }
    },

    async getSummaryOrganization(payload) {
        try {
            logService.info("Start: tx-summary-service.getSummaryOrganization()");

            let whereFindAll = {}
            // prepare search criteria for company / business unit / department / section / function
            if (isNotEmpty(payload.company)) {
                whereFindAll['company'] = payload.company
            }
            if (isNotEmpty(payload.businessUnit)) {
                whereFindAll['bu'] = payload.businessUnit;
            }
            if (isNotEmpty(payload.department)) {
                whereFindAll['department'] = payload.department;
            }
            if (isNotEmpty(payload.section)) {
                whereFindAll['section'] = payload.section;
            }
            if (isNotEmpty(payload.function)) {
                whereFindAll['fn'] = payload.function;
            }

            var dateFrom, dateTo;

            // if (isNotEmpty(payload.dateFrom)) {
            //     dateFrom = moment.utc(payload.dateFrom, 'DD/MM/YYYY').toDate();
            // } else {
            //     if (isNotEmpty(payload.dateTo)) {
            //     // set default dateFrom to dateTo - 1
            //     dateFrom = moment.utc(payload.dateTo, 'DD/MM/YYYY').subtract(1,'day').toDate();
            //     } else {
            //     // set default dateFrom to yesterday if dateTo not present
            //     dateFrom = moment.utc(new Date()).subtract(1,'day').toDate();
            //     }
            // }
            // if (isNotEmpty(payload.dateTo)) {
            //     dateTo = moment.utc(payload.dateTo, 'DD/MM/YYYY').toDate();
            // } else {
            //     // set default dateTo to dateFrom + 1
            //     dateTo = moment.utc(dateFrom).add(1, 'day').toDate();
            // }

            /*  new format date to - from   month,year */
            if (isNotEmpty(payload.dateFrom)) {
                dateFrom = moment(payload.dateFrom, 'DD/MM/YYYY').startOf('month')
            }
            if (isNotEmpty(payload.dateTo)) {
                dateTo = moment(payload.dateFrom, 'DD/MM/YYYY').endOf('month')
            }

            if (logService.isDebugEnabled()) {
                logService.debug("dateFrom = " + dateFrom);
                logService.debug("dateTo = " + dateTo);
            }

            // create where clause of record_date
            whereFindAll['record_date'] = {
                [Op.between]: [dateFrom, dateTo]
            }

            // set value for partition column
            // create month and year array
            var monthYearList = [];
            var nextMonth = moment.utc(dateFrom).startOf('day');
            while (true) {
                if (nextMonth.toDate() <= dateTo) {
                    monthYearList.push(nextMonth.format('MMYYYY'));
                    nextMonth.add(1, 'month');
                    continue;
                } else {
                    break;
                }
            }

            // to use partition table
            whereFindAll['record_month'] = {
                [Op.in]: monthYearList
            }

            let obj = await summaryDetailModel.findAll({
                where: whereFindAll,
            }).then((todos) => {
                return nodeData = todos.map((node) => node.get({ plain: true }));
            }).catch((error) => { throw error });
            let reportResp = objToJsonOrganization(obj)

            return reportResp;
        } finally {
            logService.info("End: tx-summary-service.getSummaryOrganization()");
        }
    }
}

function toEmployeeDetail(employeeInfo) {
    return {
        pin: employeeInfo.pin,
        name: employeeInfo.nameEng + ' ' + employeeInfo.surnameEng,
        bl: employeeInfo.orgNameBL,
        company: employeeInfo.orgNameCO || employeeInfo.companyName,
        bu: employeeInfo.orgNameBU,
        department: employeeInfo.orgNameDP,
        sc: employeeInfo.orgNameSC,
        fc: employeeInfo.orgNameFC
    }
}

function objToJsonDailyDetail(obj) {
    // console.log(reply)
    let resultRecord= [];
    for (let rec of obj) {
        let record = getObjRecordDaily();
        record.pin = rec.pin;
        record.recordMonth = rec.recordMonth
        record.date = moment(rec.recordDate).format('DD/MM/YYYY')
        record.recordType = rec.recordType
        record.schedule.start = isNotEmpty(rec.scheduleStartDt) ? moment(rec.scheduleStartDt).format(formatDtReport) : ''
        record.schedule.end = isNotEmpty(rec.scheduleEndDt) ? moment(rec.scheduleEndDt).format(formatDtReport) : ''
        record.ot.start = isNotEmpty(rec.otStartDt) ? moment(rec.otStartDt).format(formatDtReport) : ''
        record.ot.end = isNotEmpty(rec.otEndDt) ? moment(rec.otEndDt).format(formatDtReport) : ''
        record.actual.clockIn = isNotEmpty(rec.actualClockinDt) ? moment(rec.actualClockinDt).format(formatDtReport) : ''
        record.actual.clockOut = isNotEmpty(rec.actualClockoutDt) ? moment(rec.actualClockoutDt).format(formatDtReport) : ''
        record.trans = convertTran(rec.transportFlag)
        record.shift = convertShift(rec.shiftFlag)
        record.otHours.ot1 = convertOT(rec.ot10)
        record.otHours.ot15 = convertOT(rec.ot15)
        record.otHours.ot3 = convertOT(rec.ot30)
        record.remark = rec.remark
        record.updatedDate = isNotEmpty(rec.createDt) ? moment(rec.createDt).format('DD/MM/YYYY') : ''
        record.updatedBy = rec.createBy
        record.lateTime = rec.lateTime
        record.lostTime = rec.lostTime
        resultRecord.push(record)
    }

    return resultRecord
}

function objToJsonDaily(employeeInfo, obj) {
    // console.log(reply)
    let employeeInfoResp = {
        employeeDetail: toEmployeeDetail(employeeInfo),
        resultRecord: []
    }

    for (let rec of obj) {
        let record = getObjRecordDaily();
        record.pin = rec.pin;
        record.recordMonth = rec.recordMonth
        record.date = moment(rec.recordDate).format('DD/MM/YYYY')
        record.recordType = rec.recordType
        record.schedule.start = isNotEmpty(rec.scheduleStartDt) ? moment(rec.scheduleStartDt).format(formatDtReport) : ''
        record.schedule.end = isNotEmpty(rec.scheduleEndDt) ? moment(rec.scheduleEndDt).format(formatDtReport) : ''
        record.ot.start = isNotEmpty(rec.otStartDt) ? moment(rec.otStartDt).format(formatDtReport) : ''
        record.ot.end = isNotEmpty(rec.otEndDt) ? moment(rec.otEndDt).format(formatDtReport) : ''
        record.actual.clockIn = isNotEmpty(rec.actualClockinDt) ? moment(rec.actualClockinDt).format(formatDtReport) : ''
        record.actual.clockOut = isNotEmpty(rec.actualClockoutDt) ? moment(rec.actualClockoutDt).format(formatDtReport) : ''
        record.trans = convertTran(rec.transportFlag)
        record.shift = convertShift(rec.shiftFlag)
        record.otHours.ot1 = convertOT(rec.ot10)
        record.otHours.ot15 = convertOT(rec.ot15)
        record.otHours.ot3 = convertOT(rec.ot30)
        record.remark = rec.remark
        record.updatedDate = isNotEmpty(rec.createDt) ? moment(rec.createDt).format('DD/MM/YYYY') : ''
        record.updatedBy = rec.createBy
        console.log(record)
        employeeInfoResp.resultRecord.push(record)
    }

    return employeeInfoResp
}

function objToJsonOrganization(organizeInfo, obj) {
    var resultRecord = [];

    for (let rec of obj) {
        let record = getObjRecordOrganization();
        record.id = organizeInfo.orgCode;
        record.name = organizeInfo.orgName;
        record.date = moment(rec.recordDate).format('DD/MM/YYYY')
        record.recordType = rec.recordType
        record.schedule.start = isNotEmpty(rec.scheduleStartDt) ? moment(rec.scheduleStartDt).format(formatTimeReport) : ''
        record.schedule.end = isNotEmpty(rec.scheduleEndDt) ? moment(rec.scheduleEndDt).format(formatTimeReport) : ''
        record.ot.start = isNotEmpty(rec.otStartDt) ? moment(rec.otStartDt).format(formatTimeReport) : ''
        record.ot.end = isNotEmpty(rec.otEndDt) ? moment(rec.otEndDt).format(formatTimeReport) : ''
        record.actual.clockIn = isNotEmpty(rec.actualClockinDt) ? moment(rec.actualClockinDt).format(formatTimeReport) : ''
        record.actual.clockOut = isNotEmpty(rec.actualClockoutDt) ? moment(rec.actualClockoutDt).format(formatTimeReport) : ''
        record.trans = convertTran(rec.transportFlag)
        record.shift = convertShift(rec.shiftFlag)
        record.otHours.ot1 = convertOT(rec.ot10)
        record.otHours.ot15 = convertOT(rec.ot15)
        record.otHours.ot3 = convertOT(rec.ot30)
        record.remark = rec.remark
        record.updatedDate = isNotEmpty(rec.createDt) ? moment(rec.createDt).format('DD/MM/YYYY') : ''
        record.updatedBy = rec.createBy

        resultRecord.push(record)
    }

    return resultRecord;
}

function getObjRecordOrganization() {
    return record = {
        id: '',
        name: '',
        orgShortName: '',
        otHours: {
            ot1: '',
            ot15: '',
            ot3: ''
        },
        shift: '',
        trans: '',
        attendance: '',
        absent: '',
        late: '',
        leave: {
            sick: '',
            business: '',
            holiday: '',
            others: ''
        }
    }
}

function getObjRecordDaily() {
    return record = {
        id: '',
        pin: '',
        date: '',
        recordType: '',
        recordMonth: '',
        schedule: {
            start: '',
            end: ''
        },
        ot: {
            start: '',
            end: ''
        },
        actual: {
            clockIn: '',
            clockOut: ''
        },
        trans: '',
        shift: '',
        otHours: {
            ot1: '',
            ot15: '',
            ot3: ''
        },
        remark: '',
        updatedDate: '',
        updatedBy: '',
        lateTime:'',
        lostTime:''
    }
}

function isNotEmpty(str) {
    if (str == null || str == undefined || str == '') {
        return false
    }
    return true
}

function convertShift(flag) {
    if (flag == 'Y') {
        return '170'
    } else {
        return '0.00'
    }
}

function convertTran(flag) {
    if (flag == 'Y') {
        return '200'
    } else {
        return '0.00'
    }
}

function convertOT(ot) {
    if (ot == 0) {
        return '0.00'
    } else {
        return ot
    }
}
