

/*
   model
*/
const infoActivity = require('../models').InfoActivity
const txSlDetail = require('../models').TxSlDetail
const txTrDetail = require('../models').TxTrDetail
const txSummaryDetail = require('../models').TxSummaryDetail
const infoSummaryCheck = require('../models').InfoSummaryCheck
const Op = require('../models').Sequelize.Op;
const sequelize = require('../models').sequelize;
const infoAccess = require('../models').InfoAccess

/*
   dependency
*/
const moment = require('moment');
const arrayToTxtFile = require('array-to-txt-file')

/*
   service
*/
const logger = require('./log-service')
const rdpService = require('./rdp-service')
const omService = require('./om-service')
const cbpService = require('./cbp-service')
const employeeService = require('./employee-service')
/*
   class
*/
const MST = require('../class').Constant.Constant
const SummaryInfo = require('../class').SummaryInfo

/*
   Test
*/
const obj = require('../../test/data/summary-data')


const condShiftTime = '13:00:00|06:30:00'
const shiftStart = condShiftTime.split('|')[0]
const shiftEnd = condShiftTime.split('|')[1]
const condTransportTime = '14:00:00|20:00:00'
const transportStart = condTransportTime.split('|')[0]
const transportEnd = condTransportTime.split('|')[1]
const format = 'HH:mm:ss'
const formatHour = 'HH:mm';
const standardWorkTime = 8;

const currentDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
const createDateTime = moment().format('YYYY-MM-DD HH:mm:ss')


let objbyCond = {
    schedule: {},
    scheduleOT: {},
    actualClock: {},
    flagPaid: {},
    objHour: {},
    isLeave: false,
    objTime: {},
    actualClockOT: {},
    isOTCom: false,
    is2OT: false,
    OT: { OT_1: '', OT1_5: '', OT_3: '' }
}

// let objID = {
//     pin: '',
//     txDetailSLId: '',
//     txDetailTRId: ''
// }


module.exports = [
    {
        method: 'GET', path: '/start', config: { auth: false }, handler: async function (request, reply) {
            logger.info('ProcessSummaryDetail')
            await processSummaryDetail(request, reply);
            return reply.response('sss').code(200)
        }
    }
];

module.exports = [
    {
        method: 'GET', path: '/test', config: { auth: false }, handler: async function (request, reply) {
            // let xxx = moment('2017-11-11').format('MM-YYYY');

            // employeeService.getEmployeeDetailWithOrganizeByPin('00046118').then(obj => {
            //     console.log(obj)
            // }).catch(e => {
            //     console.log(e + 'xxxx')
            // })
            // console.log(cons)

            // employeeService.getEmployeeDetailWithOrganizeByPin('00038505').then(b => {

            //     console.log('xxxx', b)
            // }).catch(e => {

            //     console.log(e)
            // })
            // txSummaryDetail.findAll({
           
            //     where:{
            //         [Op.between] :[{
            //             [Op.and]: [sequelize.where(sequelize.fn('date_part','month', sequelize.col('record_date')), '11'),sequelize.where(sequelize.fn('date_part','year', sequelize.col('record_date')), '2017')]
            //         },{
            //             [Op.and]: [sequelize.where(sequelize.fn('date_part','month', sequelize.col('record_date')), '12'),sequelize.where(sequelize.fn('date_part','year', sequelize.col('record_date')), '2017')]
            //         }
            //         ]
            //     } 
            // }).then(r => {
            //     console.log(r)
            // });
            let nextDayxx = moment('2017-12-11').date(-1);
            console.log(nextDayxx)

            let nextDay = moment('2017-11-11').date(0);
            console.log(nextDay)
            let nextDayg = moment('2017-02-11').date(-1);
            let nn = moment.max(nextDayg)
console.log(nn)
            return reply.response(nextDay).code(200)
        }
    }
];

processSummaryDetail = async (req, res) => {

    let summaryCheck = await getInfoSummaryCheckModel();   // query record for summary detail 
    // if (logger.isTraceEnabled()) {
    //     logger.trace('Response summaryCheck:{} \n' + summaryCheck);
    // }

    console.log('summaryCheck:', summaryCheck);
    logger.debug('summaryCheck length:' + summaryCheck.length);


    /* Map Collect for PIN to AID , AID to PIN */
    let mapPinAid = getMapPinAid(summaryCheck)
    let mapPinToAid = mapPinAid.pinToAid
    let mapAidToPin = mapPinAid.aidToPin

    // infoSummary = {
    //     slFlag: 'Y',
    //     trFlag: 'Y'
    // }

    for (let infoSummary of summaryCheck) {
        let employeeScheList = await mapData2Obj(infoSummary, mapAidToPin); // set data to obj by one record
        if (isEmptyArray(employeeScheList)) {
            console.log('PIN NOT MAP')
        } else {
            console.log(employeeScheList)
            let listMstActivity = await getActivityInfo('ALL');

            //let sumaryDetailObj = null   // array for insert to DB

            let startRDP = changeFormatDate(infoSummary.recordDt, 'YYYY/MM/DD')
            let endRDP = changeFormatDate(infoSummary.recordDt, 'YYYY/MM/DD')
            let isHolidayFlag = await isHoliday(startRDP.endRDP)   // ต้องส่งวันที่เป็น scheduledate เข้าไป เพื่อ check ทำงานในวันหยุดนักขัตฤกษ์ไหม

            logger.debug('employeeScheList length:' + employeeScheList.length);
            logger.debug('employeeScheList:' + employeeScheList);
            console.log('employeeScheList length:', employeeScheList.length)
            console.log('employeeScheList:', employeeScheList)
            if (isTrue(infoSummary.slFlag) && !isTrue(infoSummary.trFlag)) {
                /* Case don’t have TR 
                   such as case leave all Day , case special Activity all Day and case Lost all Day
                */

                /* keep groupType for Condition */
                let grupTypeSchedule = findGrupType(employeeScheList, listMstActivity);
                console.log('grupTypeSchedule:', grupTypeSchedule)

                let findIndexSpecial = grupTypeSchedule.findIndex(e => { return e == 'Special' })
                let findIndexWork = grupTypeSchedule.findIndex(e => { return e == 'Work' })
                let findIndexLeave = grupTypeSchedule.findIndex(e => { return e == 'Leave' })
                if (findIndexWork >= 0) {  // still update SL,TR
                    console.log("case Lost AllDay")
                    let recordToDB = [];
                    let sumaryDetailObj = setData2condLostAllDay(employeeScheList[0].activitySL, true, infoSummary.recordDt)
                    let scheduleDate = moment(infoSummary.recordDt).format('YYYY-MM-DD');
                    sumaryDetailObj.recordDate = scheduleDate
                    sumaryDetailObj.recordMonth = spiltStringByKeyword(moment(scheduleDate).format('MM-YYYY'), '-');
                    sumaryDetailObj.pin = isNotEmpty(employeeScheList[0].pin) ? employeeScheList[0].pin : ''
                    sumaryDetailObj.superPin = isNotEmpty(infoSummary.supervisorPin) ? infoSummary.supervisorPin : ''
                    sumaryDetailObj.managerPin = isNotEmpty(infoSummary.managerPin) ? infoSummary.managerPin : ''
                    sumaryDetailObj.txDetailSLId = isNotEmpty(employeeScheList[0].headerSL) ? employeeScheList[0].headerSL : ''
                    await getOrgCodeByPin(sumaryDetailObj.pin, sumaryDetailObj)
                    recordToDB.push(sumaryDetailObj.toObject())
                    await saveData2DB(recordToDB)
                }
                else if (findIndexLeave >= 0 && findIndexWork < 0) { //case leave all day 
                    console.log('case Leave')
                    let recordToDB = [];
                    let sumaryDetailObj = await setData2condLeave(employeeScheList[0].activitySL, true, infoSummary.recordDt)
                    let scheduleDate = moment(infoSummary.recordDt).format('YYYY-MM-DD');
                    sumaryDetailObj.recordDate = scheduleDate
                    sumaryDetailObj.recordMonth = spiltStringByKeyword(moment(scheduleDate).format('MM-YYYY'), '-');
                    sumaryDetailObj.pin = isNotEmpty(employeeScheList[0].pin) ? employeeScheList[0].pin : ''
                    sumaryDetailObj.superPin = isNotEmpty(infoSummary.supervisorPin) ? infoSummary.supervisorPin : ''
                    sumaryDetailObj.managerPin = isNotEmpty(infoSummary.managerPin) ? infoSummary.managerPin : ''
                    sumaryDetailObj.txDetailSLId = isNotEmpty(employeeScheList[0].headerSL) ? employeeScheList[0].headerSL : ''
                    await getOrgCodeByPin(sumaryDetailObj.pin, sumaryDetailObj)
                    recordToDB.push(sumaryDetailObj.toObject())
                    await saveData2DB(recordToDB)
                }
                else if (findIndexSpecial >= 0 && findIndexWork < 0) { // case special all day 
                    console.log('Case Special activity All Day')
                    let recordToDB = [];
                    sumaryDetailObj = setData2condAllDaySpecial(employeeScheList[0].activitySL, obj.overlapTime, infoSummary.recordDt)
                    let scheduleDate = moment(employeeScheList[0].scheduleDate).format('YYYY-MM-DD');
                    sumaryDetailObj.recordDate = scheduleDate
                    sumaryDetailObj.recordMonth = spiltStringByKeyword(moment(scheduleDate).format('MM-YYYY'), '-');
                    sumaryDetailObj.pin = isNotEmpty(employeeScheList[0].pin) ? employeeScheList[0].pin : ''
                    sumaryDetailObj.superPin = isNotEmpty(infoSummary.supervisorPin) ? infoSummary.supervisorPin : ''
                    sumaryDetailObj.managerPin = isNotEmpty(infoSummary.managerPin) ? infoSummary.managerPin : ''
                    sumaryDetailObj.txDetailSLId = isNotEmpty(employeeScheList[0].headerSL) ? employeeScheList[0].headerSL : ''
                    await getOrgCodeByPin(sumaryDetailObj.pin, sumaryDetailObj)
                    recordToDB.push(sumaryDetailObj.toObject())
                    await saveData2DB(recordToDB)
                }
            } else if (!isTrue(infoSummary.slFlag) && !isTrue(infoSummary.trFlag)) { // case off

                if (isHolidayFlag) {
                    /* dayOff == Holiday => AutoOT , one record by RecordType = 'AutoOT' */
                    console.log('Auto OT')
                    return setData2DB('AutoOT', '', setID(infoSummary))
                } else {
                    /* dayOff and !Holiday => OFF , one record by RecordType = 'AutoOT' */
                    console.log('Day OFF')
                    return setData2DB('OFF', '', setID(infoSummary))
                }
            } else if (isTrue(infoSummary.slFlag) && isTrue(infoSummary.trFlag)) {

                /* keep groupType for Condition */
                let grupTypeSchedule = findGrupType(employeeScheList, listMstActivity);
                console.log('grupTypeSchedule:', grupTypeSchedule)

                if (await isLeaveActivityAllDay(employeeScheList[0].activitySL)) {
                    let sumaryDetailObj = await setData2condLeave(employeeScheList[0].activitySL, true, infoSummary.recordDt)
                    let scheduleDate = moment(infoSummary.recordDt).format('YYYY-MM-DD');
                    let recordToDB = [];
                    sumaryDetailObj.recordDate = scheduleDate
                    sumaryDetailObj.recordMonth = spiltStringByKeyword(moment(scheduleDate).format('MM-YYYY'), '-');
                    sumaryDetailObj.pin = isNotEmpty(employeeScheList[0].pin) ? employeeScheList[0].pin : ''
                    sumaryDetailObj.superPin = isNotEmpty(infoSummary.supervisorPin) ? infoSummary.supervisorPin : ''
                    sumaryDetailObj.managerPin = isNotEmpty(infoSummary.managerPin) ? infoSummary.managerPin : ''
                    sumaryDetailObj.txDetailSLId = isNotEmpty(employeeScheList[0].headerSL) ? employeeScheList[0].headerSL : ''
                    await getOrgCodeByPin(sumaryDetailObj.pin, sumaryDetailObj)
                    recordToDB.push(sumaryDetailObj.toObject())
                    await saveData2DB(recordToDB)
                }
                else {
                    for (let obj of employeeScheList) {
                        /* Case have TR and SL */
                        if (isNotEmpty(obj.activityTR) && isNotEmpty(obj.activitySL)) {
                            if (obj.overlapTime) {
                                let schedule = await findScheduleForSpiltTR(obj.activitySL)   // find schedule start - end for spilt tr to new array 

                                obj.activityTR = mapTRbySLDaily(schedule, obj.activityTR, obj.scheduleDate);   // new Array TR by Schedule SL ,Support case overlap
                                console.log('Tr Activity with overlap:', obj.activityTR)
                            }
                            obj.supervisorPin = isNotEmpty(infoSummary.supervisorPin) ? infoSummary.supervisorPin : ''
                            obj.managerPin = isNotEmpty(infoSummary.managerPin) ? infoSummary.managerPin : ''
                            fullScanMidNight(obj.activityTR, obj.scheduleDate)
                            //let isLeave = await isLeaveActivity(obj.activitySL)
                            await processWithCond(obj.activitySL, obj.activityTR, obj.overlapTime, grupTypeSchedule, listMstActivity, setID(obj), isHolidayFlag);  //return ot hour and record type  and hour and late 

                        }
                    }
                }
            }
        }
    }//end loop summaryCheck
    console.log('after process')
}


async function processWithCond(listSL, listTR, overlapTime, grupTypeSchedule, listMstActivity, objID, holidayFlag) {

    // sortTime(listSL, overlapTime);   //sort asc
    // sortTime(listTR, overlapTime);   //sort asc

    let cond = {
        isHoliday: holidayFlag, // call RDP return ture , false
        scheOT: 0,
        dayOff: false,
        work: false,
        compensate: false,
        isActSpecial: false,
        isLeave: await isLeaveActivity(listSL), // condition for check leave between work 
        isLeaveAllDay: await isLeaveActivityAllDay(listSL) // condition for check leave all day but have tr  => OTCOM
    }
    console.log('cond.isHoliday:' + cond.isHoliday)
    grupTypeSchedule.forEach(e => {
        if (e == 'OT') {   //group ของ Activity SL มา Checkว่า เข้าเงื่อนไขตรงไหน
            cond.scheOT++
        }
        if (e == 'OFF') {
            cond.dayOff = true
        }
        if (e == 'Work') {
            cond.work = true
        }
        if (e == 'Compensate') {
            cond.compensate = true
        }
        if (e == 'Special') {
            cond.isActSpecial = true
        }
    })

    console.log('cond:', cond)

    let flagPaid = hasShiftOrTransport(listSL, listTR, overlapTime, objID.scheduleDate)    // คำนวนค่ากะ ค่ารถ return เป็น obj flag


    if (cond.isHoliday && cond.work) {
        /* Holiday+Schedule Work , one record by RecordType = 'OTCOM' */
        console.log('OT Compensate')
        if (cond.scheOT == 1 && cond.work) {      // spilt 3 case  Normal ,  Normal +OT , OT Before After 
            /* Schedule Normal + OT, one record by RecordType = 'ON' */
            return normalWithOTCond(listSL, listTR, listMstActivity, flagPaid, true, objID, overlapTime)
        } else if (cond.scheOT == 2 && cond.work) {
            /* Schedule duration 2 OT , three record by RecordType = 'ON' , 'OT ก่อน' , 'OT หลัง' */
            return duration2OT(listSL, listTR, listMstActivity, flagPaid, true, objID, overlapTime)
        } else if (cond.scheOT == 0 && cond.work) {
            /* ScheduleNormal , one record by RecordType = 'ON' */
            return normalCond(listSL, listTR, listMstActivity, flagPaid, true, objID, overlapTime)
        }

    }
    if (cond.scheOT == 1 && cond.work && !cond.isHoliday) {
        /* Schedule Normal + OT, one record by RecordType = 'ON' */
        return normalWithOTCond(listSL, listTR, listMstActivity, flagPaid, false, objID, overlapTime)
    }
    if (cond.scheOT == 2 && cond.work && !cond.isHoliday) {
        /* Schedule duration 2 OT , three record by RecordType = 'ON' , 'OT ก่อน' , 'OT หลัง' */
        return duration2OT(listSL, listTR, listMstActivity, flagPaid, false, objID, overlapTime)
    }
    if (cond.scheOT == 0 && cond.work && !cond.isHoliday) {
        /* ScheduleNormal , one record by RecordType = 'ON' */
        return normalCond(listSL, listTR, listMstActivity, flagPaid, false, objID, overlapTime)
    }
    // if (cond.isLeaveAllDay && !cond.isHoliday) {
    //     /* Leave All Day , one record by RecordType = 'OTCOM' */
    //     return otComLeaveAllDay(listSL, listTR, listMstActivity, flagPaid, true, objID)
    // }
}


async function normalCond(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID, overlapTime) {
    /* ScheduleNormal , one record by RecordType = 'ON' */
    console.log('Normal Work')
    let schedule = await findScheduleStartEnd(listSL, 'normal')   // Schedule start - end 
    console.log('schedule:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity, objID.scheduleDate, overlapTime)// Actual clock in - out ,lost and late 
    console.log('actualClock:', actualClock)
    let objTime = getTimeLostOrlate(schedule, actualClock);
    resetObjCond();
    objbyCond.schedule = schedule
    objbyCond.flagPaid = flagPaid
    objbyCond.actualClock = actualClock
    objbyCond.objTime = objTime
    // let tr = await splitActivityTRBySL(listSL, listTR, 'Work', listMstActivity) // hour
    // console.log('tr:', tr.work.length)
    // let objHour = normalWork(tr, listMstActivity, 'normal')

    /*  case OTCOM Normal will be get (Hour = OT*1)  */
    if (isOTCOM) {
        // let hour = activityHourPaid(actualClock.start, actualClock.end, hour)
        // objbyCond.OT.OT_1 = hour
        setData2DB('OTCOM', objbyCond, objID)
    } else {
        setData2DB('ON', objbyCond, objID)
    }
}


async function otComLeaveAllDay(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID) {
    /* ScheduleNormal , one record by RecordType = 'ON' */
    console.log('otComLeaveAllDay')
    let schedule = await findScheduleStartEndLeaveAllDay(listSL, 'OTCOM')   // Schedule start - end 
    console.log('schedule:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity, objID.scheduleDate, overlapTime)// Actual clock in - out ,lost and late 
    console.log('actualClock:', actualClock)
    let objHour = getHourOTComAllLeaveDay(listTR, listMstActivity)
    let objTime = getTimeLostOrlate(schedule, actualClock);
    resetObjCond();
    objbyCond.schedule = schedule
    objbyCond.flagPaid = flagPaid
    objbyCond.actualClock = actualClock
    objbyCond.objHour = objHour
    //objbyCond.objTime = objTime
    setData2DB('OTComLeaveAllDay', objbyCond, objID)

}


async function normalWithOTCond(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID, overlapTime) {

    console.log('Normal Overtime')
    let schedule = await findScheduleStartEnd(listSL, 'normal')   // Schedule start - end 
    console.log('schedule:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity, objID.scheduleDate, overlapTime) // Actual clock in - out ,lost and late 
    console.log('actualClock:', actualClock)

    let scheduleOT = await findScheduleStartEnd(listSL, 'ot')
    console.log('scheduleOT', scheduleOT)
    let actualClockOT = findActualClockOTFromTR(scheduleOT, listTR, listMstActivity, schedule, objID.scheduleDate, overlapTime)
    console.log('actualClockOT', actualClockOT)
    let tr = await splitActivityTRBySL(listSL, listTR, 'OT', listMstActivity, schedule, scheduleOT)
    console.log('arr TR:', tr.work.length)
    let objHour = normalWork(tr, listMstActivity, 'ot', actualClock)

    let objTime = getTimeLostOrlate(schedule, actualClock);  // get min - hour for case late or lost
    resetObjCond();
    objbyCond.schedule = schedule
    objbyCond.flagPaid = flagPaid
    objbyCond.actualClock = actualClock
    //objbyCond.isLeave = cond.isLeave
    objbyCond.objTime = objTime
    objbyCond.actualClockOT = actualClockOT
    objbyCond.objHour = objHour
    // let tr = await splitActivityTRBySL(listSL, listTR, 'Work', listMstActivity) // hour
    // console.log('tr:', tr.work.length)
    // let objHour = normalWork(tr, listMstActivity, 'normal')

    if (isOTCOM) {
        setData2DB('OTCOM', objbyCond, objID)
    } else {
        setData2DB('ON', objbyCond, objID)
    }

}

async function duration2OT(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID, overlapTime) {
    console.log('OT Befor After')
    let schedule = await findScheduleStartEnd(listSL, 'normal') //ช่วงเวลาทำงานปกติของพนักงาน ตามไฟล์ SL
    console.log('schedule normal:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity, objID.scheduleDate, overlapTime) // เวลาทำงานจริงๆของพนักงาน ตามไฟล์ SL
    console.log('actualClock normal:', actualClock)
    let scheduleOT = await findScheduleStartEnd(listSL, '2OT')
    console.log('schedule ot:', scheduleOT)
    let actualClockBefore = await findActualClockOTFromTR(scheduleOT.before, listTR, listMstActivity, schedule)
    console.log('actualClockBefore:', actualClockBefore)
    let actualClockAfter = await findActualClockOTFromTR(scheduleOT.after, listTR, listMstActivity, schedule)
    console.log('actualClockAfter:', actualClockAfter)
    let tr = await splitActivityTRBySL(listSL, listTR, '2OT', listMstActivity, schedule, scheduleOT)
    let objHour = beforeAfterOT(tr, listMstActivity, actualClock)
    let objTime = getTimeLostOrlate(schedule, actualClock);  // get min - hour for case late or lost
    resetObjCond();
    objbyCond.schedule = schedule
    objbyCond.scheduleOT = scheduleOT
    objbyCond.flagPaid = flagPaid
    objbyCond.actualClock = actualClock
    //objbyCond.isLeave = cond.isLeave
    objbyCond.objTime = objTime
    objbyCond.actualClockOT.actualClockBefore = actualClockBefore
    objbyCond.actualClockOT.actualClockAfter = actualClockAfter
    objbyCond.objHour = objHour

    if (isOTCOM) {
        objbyCond.is2OT = true
        setData2DB('OTCOM', objbyCond, objID)
    } else {
        objbyCond.is2OT = true
        setData2DB('ON', objbyCond, objID)
    }


}


//นำ TR มา Check เพื่อ Confirm ว่าตรงกับ SL 
// function checkActivityFromActGroup(listSL, listTR, grupTypeSchedule, listMstActivity, cond) {     // parameter one object listSL {} , listTR{}

//     let error = {
//         errActivity: [],
//         errGrupAct: []
//     };

//     let activityAfterSchedule = []
//     let lastTimeSchedule;
//     let lastIndexTR;

//     let workTime = '00:00:00';
//     let mealTime = '00:00:00';
//     let leaveTime = '00:00:00';
//     let offTime = '00:00:00';


//     for (let actList of activityList) { // list ของ TR ตามช่วงเวลาที่มีใน SL 
//         //  console.log('listTR:',actList)
//         let notFound = true;
//         for (let mstAct of listMstActivity) {
//             if (actList.activityName.toUpperCase() == mstAct.activityName.toUpperCase()) {
//                 notFound = false;
//                 if (!(mstAct.groupType == grupTypeSchedule[i])) { // ถ้า activity ไม่ตรงตาม group act ที่ SL
//                     console.log('Group Type for unmatch Activity [us]:', grupTypeSchedule[i])
//                     console.log('Group Type for unmatch Activity [mst]:', mstAct.groupType)
//                     if (!(grupTypeSchedule[i] == 'Meal' && mstAct.groupType == 'Work')) {
//                         error.errGrupAct.push(actList)
//                     }
//                 }
//             }
//         }
//         if (notFound) {   // กรณีที่ไม่เจอ Activity ใน mst activity
//             error.errActivity.push(actList)
//         }
//     }
// }
function mapTRbySLDaily(listSL, listTR, scheduleDate) {
    let listTRDaily = [];
    // for (let i = 0; i < listSL.length; i++) {
    let momentActSLEnd = moment(scheduleDate + listSL.end, 'YYYY-MM-DD ' + format).add(1, 'days')// sl end
    let momentActSLStart = moment(scheduleDate + listSL.start, 'YYYY-MM-DD ' + format);// sl start
    let midNight = moment(scheduleDate, 'YYYY-MM-DD ' + format)
    //listMstActivity.forEach(e => {
    // if (checkActivityByGrup('Work', listMstActivity, listSL[i].activityName)
    //     || checkActivityByGrup('Meal', listMstActivity, listSL[i].activityName)) { //case work activity
    for (let j = 0; j < listTR.length; j++) {
        let momentActTREnd = moment(listTR[j].scheduleDate + listTR[j].end, 'YYYY-MM-DD' + format);   // tr end
        let momentActTRStart = moment(listTR[j].scheduleDate + listTR[j].start, 'YYYY-MM-DD' + format);  //tr start
        // if (((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart)))
        //     || (momentActTRStart.isBefore(momentActSLStart) && (momentActTREnd.isAfter(momentActSLStart)))   // case activity momemnt overlap SL start  
        //     || (momentActTRStart.isBefore(momentActSLEnd) && momentActTREnd.isAfter(momentActSLEnd)) // case activity momemnt overlap SL end
        // ) 
        if (((momentActTRStart.isBefore(momentActSLStart) || momentActTRStart.isSame(momentActSLStart)) && (momentActTREnd.isBetween(momentActSLStart, momentActSLEnd) || midNight.isSame(momentActTREnd)))
            || ((momentActTRStart.isBetween(momentActSLStart, momentActSLEnd)) && ((momentActTREnd.isBetween(momentActSLStart, momentActSLEnd)) || midNight.isSame(momentActTREnd)))
            || ((momentActTRStart.isBetween(momentActSLStart, momentActSLEnd)) && ((momentActTREnd.isAfter(momentActSLEnd)) || midNight.isSame(momentActTREnd)))
        )
        // case activity momemnt overlap SL end
        {
            //listAcivityTR.work.push(listTR[j])
            listTRDaily.push(listTR[j])
        }
    }
    //}
    // }
    return listTRDaily
}


async function splitActivityTRBySL(listSL, listTR, cond, listMstActivity, schedule, scheduleOT) {

    let listAcivityTR = {
        work: [],
        ot: [],
        otBefore: [],
        otAfter: [],
        overSchedule: [],
        special: []
    }

    console.log('condition:', cond)
    // console.log('listSL splitActivityTRBySL:', listSL)
    // console.log('listTR splitActivityTRBySL:', listTR)
    if (cond == 'OT') {
        //  let listMstActivity = await getActivityInfo('ALL');
        let lastTimeSchedule
        // check Activity ตามช่วงเวลาของ SL
        for (let i = 0; i < listSL.length; i++) {
            let momentActSLEnd = moment(listSL[i].end, format);// sl end
            let momentActSLStart = moment(listSL[i].start, format);// sl start
            let activityList = []
            //for (let actTRTime of listTR) {
            // listMstActivity.forEach(e => {
            // if (e.activityName.toUpperCase() == listSL[i].activityName.toUpperCase()
            //  && e.groupType == 'OT') { //case ot activity
            if (checkActivityByGrup('OT', listMstActivity, listSL[i].activityName)) { //case ot activity
                for (let j = 0; j < listTR.length; j++) {
                    let momentActTREnd = moment(listTR[j].end, format);   // tr end
                    let momentActTRStart = moment(listTR[j].start, format);  //tr start
                    if (((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart)))
                        || (momentActTRStart.isBefore(momentActSLStart) && (momentActTREnd.isAfter(momentActSLStart)))  // case activity momemnt overlap SL start  
                        || (momentActTRStart.isBefore(momentActSLEnd) && momentActTREnd.isAfter(momentActSLEnd)) // case activity momemnt overlap SL end
                    ) {
                        listAcivityTR.ot.push(listTR[j])
                    }
                }
                console.log('listAcivityTR.ot1', listAcivityTR.ot)
                checkOverlapOT(schedule, scheduleOT, listAcivityTR.ot)
                console.log('listAcivityTR.ot2', listAcivityTR.ot)
            }
            //   else if ((e.activityName.toUpperCase() == listSL[i].activityName.toUpperCase() && e.groupType == 'Work')
            //     || (e.activityName.toUpperCase() == listSL[i].activityName.toUpperCase() && e.groupType == 'Meal')) { //case work activity
            else if (checkActivityByGrup('Work', listMstActivity, listSL[i].activityName)
                || checkActivityByGrup('Meal', listMstActivity, listSL[i].activityName)) {
                for (let j = 0; j < listTR.length; j++) {
                    // if (listTR[j].activityName.toUpperCase() == e.activityName.toUpperCase() && e.groupType == 'Work') {
                    if (checkActivityByGrup('Work', listMstActivity, listTR[j].activityName)) {
                        let momentActTREnd = moment(listTR[j].end, format);   // tr end
                        let momentActTRStart = moment(listTR[j].start, format);  //tr start
                        if (((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart)))
                            || (momentActTRStart.isBefore(momentActSLStart) && (momentActTREnd.isAfter(momentActSLStart)))   // case activity momemnt overlap SL start  
                            || (momentActTRStart.isBefore(momentActSLEnd) && momentActTREnd.isAfter(momentActSLEnd)) // case activity momemnt overlap SL end
                        ) {
                            listAcivityTR.work.push(listTR[j])
                        }
                    }
                }
            } else if (checkActivityByGrup('Special', listMstActivity, listSL[i].activityName)) {
                listAcivityTR.special.push(listSL[i])
            }
            // })
            lastTimeSchedule = listSL[i].end
        }

        if (isNotEmpty(lastTimeSchedule)) {
            let lastSL = moment(lastTimeSchedule, format);
            for (let tr of listTR) {
                let lastTimeTR = moment(tr.start, format);
                if (lastTimeTR.isAfter(lastSL)) {
                    listAcivityTR.overSchedule.push(tr)
                }
            }
        }
        //console.log('listAcivityTR.work',listAcivityTR.work.splice(80,listAcivityTR.work.length-1))
        return listAcivityTR
    } else if (cond == '2OT') {  // จะมี 3-4 array (work,otbefore,otafter and special) 

        //  let listMstActivity = await getActivityInfo('ALL');
        let listMstActivityOT = await getActivityInfo('OT');
        let lastTimeSchedule;

        // let indexOTBefore;
        // let indexOTAfter;
        let indexOT = [];
        for (let i = 0; i < listSL.length; i++) {
            //listMstActivityOT.forEach(e => {
            if (checkActivityByGrup('OT', listMstActivityOT, listSL[i].activityName)) {
                //if (e.activityName.toUpperCase() == listSL[i].activityName.toUpperCase() && e.groupType == 'OT') {
                indexOT.push(i)
                // break;
            }
            // })
        }
        console.log('indexOT:', indexOT)
        let startFirst = moment(listSL[indexOT[0]].start, format);
        let startSecond = moment(listSL[indexOT[1]].start, format);
        // if (startFirst.isBefore(startSecond)) {  // 
        let endFirst = moment(listSL[indexOT[0]].end, format);
        let endSecond = moment(listSL[indexOT[1]].end, format);


        for (let j = 0; j < listTR.length; j++) {
            let momentActTREnd = moment(listTR[j].end, format);   // tr end
            let momentActTRStart = moment(listTR[j].start, format);  //tr start
            if (((endFirst.isSame(momentActTREnd) || momentActTREnd.isBefore(endFirst)) && (startFirst.isSame(momentActTRStart) || momentActTRStart.isAfter(startFirst)))
                || (momentActTRStart.isBefore(startFirst) && (momentActTREnd.isAfter(startFirst)))   // case activity momemnt overlap SL start  
                || (momentActTRStart.isBefore(endFirst) && momentActTREnd.isAfter(endFirst)) // case activity momemnt overlap SL end
            ) {

                console.log('otBefore')
                listAcivityTR.otBefore.push(listTR[j])
            }
        }

        for (let j = 0; j < listTR.length; j++) {
            let momentActTREnd = moment(listTR[j].end, format);   // tr end
            let momentActTRStart = moment(listTR[j].start, format);  //tr start
            if (((endSecond.isSame(momentActTREnd) || momentActTREnd.isBefore(endSecond)) && (startSecond.isSame(momentActTRStart) || momentActTRStart.isAfter(startSecond)))
                || (momentActTRStart.isBefore(startSecond) && (momentActTREnd.isAfter(startSecond)))   // case activity momemnt overlap SL start  
                || (momentActTRStart.isBefore(endSecond) && momentActTREnd.isAfter(endSecond)) // case activity momemnt overlap SL end
            ) {
                console.log('otAfter')
                listAcivityTR.otAfter.push(listTR[j])
            }
        }
        checkOverlapOT(schedule, scheduleOT.after, listAcivityTR.otAfter)
        checkOverlapOT(schedule, scheduleOT.before, listAcivityTR.otBefore)
        // }
        //else {
        // let endFirst = moment(listSL[indexOT[1]].start, format);
        // for (let j = 0; j < listTR.length; j++) {
        //     let momentActTREnd = moment(listTR[j].end, format);   // tr end
        //     let momentActTRStart = moment(listTR[j].start, format);  //tr start
        //     if ((endFirst.isSame(momentActTREnd) || momentActTREnd.isBefore(endFirst))
        //         && (startSecond.isSame(momentActTRStart) || momentActTRStart.isAfter(startSecond))) {
        //         listAcivityTR.otBefore.push(listTR[j])
        //     }
        // }

        // let endSecond = moment(listSL[indexOT[0]].start, format);
        // for (let j = 0; j < listTR.length; j++) {
        //     let momentActTREnd = moment(listTR[j].end, format);   // tr end
        //     let momentActTRStart = moment(listTR[j].start, format);  //tr start
        //     if ((endSecond.isSame(momentActTREnd) || momentActTREnd.isBefore(endSecond))
        //         && (startFirst.isSame(momentActTRStart) || momentActTRStart.isAfter(startFirst))) {
        //         listAcivityTR.otAfter.push(listTR[j])
        //     }
        // }

        //}

        // check Activity ตามช่วงเวลาของ SL
        for (let i = 0; i < listSL.length; i++) {
            let momentActSLEnd = moment(listSL[i].end, format);// sl end
            let momentActSLStart = moment(listSL[i].start, format);// sl start
            let activityList = []
            //listMstActivity.forEach(e => {
            if (checkActivityByGrup('Work', listMstActivity, listSL[i].activityName) || checkActivityByGrup('Meal', listMstActivity, listSL[i].activityName)) {//case work activity
                //if ((e.activityName.toUpperCase() == listSL[i].activityName.toUpperCase()&& e.groupType == 'Work') || (e.activityName.toUpperCase() == listSL[i].activityName.toUpperCase() && e.groupType == 'Meal')) {//case work activity
                for (let j = 0; j < listTR.length; j++) {
                    let momentActTREnd = moment(listTR[j].end, format);   // tr end
                    let momentActTRStart = moment(listTR[j].start, format);  //tr start
                    if (((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart)))
                        || (momentActTRStart.isBefore(momentActSLStart) && (momentActTREnd.isAfter(momentActSLStart)))   // case activity momemnt overlap SL start  
                        || (momentActTRStart.isBefore(momentActSLEnd) && momentActTREnd.isAfter(momentActSLEnd)) // case activity momemnt overlap SL end
                    ) {
                        listAcivityTR.work.push(listTR[j])
                    }
                }
            }
            // })
            lastTimeSchedule = listSL[i].end
        }

        if (isNotEmpty(lastTimeSchedule)) {
            let lastSL = moment(lastTimeSchedule, format);
            for (let tr of listTR) {
                let lastTimeTR = moment(tr.start, format);
                if (lastTimeTR.isAfter(lastSL)) {
                    listAcivityTR.overSchedule.push(tr)
                }
            }
        }

        // console.log('activityAfterSchedule:', activityAfterSchedule)

        console.log(listAcivityTR)
        return listAcivityTR
    } else if (cond == 'Work') {
        let lastTimeSchedule
        // check Activity ตามช่วงเวลาของ SL


        for (let i = 0; i < listSL.length; i++) {
            if (checkActivityByGrup('Work', listMstActivity, listSL[i].activityName) || checkActivityByGrup('Meal', listMstActivity, listSL[i].activityName)) {
                let momentActSLEnd = moment(listSL[i].end, format);// sl end
                let momentActSLStart = moment(listSL[i].start, format);// sl start
                let activityList = []
                for (let j = 0; j < listTR.length; j++) {
                    if (checkActivityByGrup('Work', listMstActivity, listTR[j].activityName)) {
                        let momentActTREnd = moment(listTR[j].end, format);   // tr end
                        let momentActTRStart = moment(listTR[j].start, format);  //tr start
                        if (((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart)))
                            || (momentActTRStart.isBefore(momentActSLStart) && (momentActTREnd.isAfter(momentActSLStart)))   // case activity momemnt overlap SL start  
                            || (momentActTRStart.isBefore(momentActSLEnd) && momentActTREnd.isAfter(momentActSLEnd)) // case activity momemnt overlap SL end
                        ) {
                            listAcivityTR.work.push(listTR[j])
                        }
                    }
                }

                if (checkActivityByGrup('Special', listMstActivity, listSL[i].activityName)) {
                    listAcivityTR.special.push(listSL[i])
                }
                lastTimeSchedule = listSL[i].end //เอาเวลาท้ายสุดของ SL เพื่อมาคำนวนหา actvity ต่อจากส่วนนี้
            }
        }

        if (isNotEmpty(lastTimeSchedule)) {
            let lastSL = moment(lastTimeSchedule, format);   //ใช้ lastime ของ SL เพื่อคำนวนหา activity work ที่ไม่อยู่ใน sl 
            for (let tr of listTR) {
                let lastTimeTR = moment(tr.start, format);
                if (lastTimeTR.isAfter(lastSL)) {
                    listAcivityTR.overSchedule.push(tr)
                }
            }
        }

        return listAcivityTR
    }

}


function checkActivityByGrup(grup, mstgrup, activityName) {

    //let listMstActivity = await getActivityInfo('ALL');
    let found = false;
    mstgrup.some(e => {

        if (e.activityName.toUpperCase() == activityName.toUpperCase() && grup.toUpperCase() == e.groupType.toUpperCase()) {
            found = true
            return true
        }
    })
    return found
}


function activityHourPaid(start, end, hour) {
    //let formatHour = 'HH:mm';
    let startTime = moment(start, formatHour);
    let endTime = moment(end, formatHour);
    let durationInMinutes = Math.abs(parseInt(endTime.diff(startTime, 'minutes')));
    const hourTR = moment(hour, 'HH:mm:ss').add(durationInMinutes, 'minutes').format(formatHour);
    return hourTR
}


function beforeAfterOT(listTR, listMstActivity, actualClock) {

    console.log(listTR)
    let hour = {
        work: '00:00:00',
        otBefore: '00:00:00',
        otAfter: '00:00:00',
        isPaid: false
    }
    //จะมีแค่ list activity tr work เท่านั้น เพราะเป็นเวลาทำงานปกติ
    if (!isEmptyArray(listTR.work)) {
        listTR.work.forEach(tr => {
            listMstActivity.forEach(mstAct => {
                if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
                    hour.work = activityHourPaid(tr.start, tr.end, hour.work)
                }
            })
        })
        if (!isEmptyArray(listTR.special)) {
            listTR.special.forEach(trSpecial => {
                hour.work = activityHourPaid(trSpecial.start, trSpecial.end, hour.work)
            })
        }
    }

    if (!isEmptyArray(listTR.otBefore)) {
        listTR.otBefore.forEach(tr => {
            listMstActivity.forEach(mstAct => {
                if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
                    hour.otBefore = activityHourPaid(tr.start, tr.end, hour.otBefore)
                }
            })
        })
    }

    if (!isEmptyArray(listTR.otAfter)) {
        listTR.otAfter.forEach(tr => {
            listMstActivity.forEach(mstAct => {
                if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
                    hour.otAfter = activityHourPaid(tr.start, tr.end, hour.otAfter)
                }
            })
        })
    }


    let hourWork = moment(hour.work, formatHour);
    let stdWork = moment(standardWorkTime, formatHour);
    if (stdWork.isBefore(hourWork) || stdWork.isSame(hourWork)) {
        hour.isPaid = true
    }

    console.log('2 Overtime Time:', hour)
    return hour


}

function getHourOTComAllLeaveDay(listTR, listMstActivity) {
    console.log(listTR)
    let hour = {
        //work: '00:00:00',
        ot: '00:00:00',
        isPaid: true
    }

    console.log('OTComAllLeaveDay')
    let = [];
    //let workTime = '00:00';
    //จะมีแค่ list activity tr work เท่านั้น เพราะเป็นเวลาทำงานปกติ
    if (isNotEmpty(listTR)) {
        listTR.forEach(tr => {
            //listMstActivity.forEach(mstAct => {
            // if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
            if (checkActivityByGrup('Work', listMstActivity, tr.activityName)) {
                hour.ot = activityHourPaid(tr.start, tr.end, hour.ot)
            }

            //})
        })
        if (isNotEmpty(listTR.special)) {
            listTR.special.forEach(trSpecial => {
                hour.ot = activityHourPaid(trSpecial.start, trSpecial.end, hour.ot)
            })
        }
    }
    console.log('workTime:', hour.work)
    return hour

}


function normalWork(listTR, listMstActivity, type, actualClock) {
    console.log(listTR)
    let hour = {
        work: '00:00:00',
        ot: '00:00:00',
        isPaid: false
    }


    if (type == 'normal') {
        console.log('Normal Work')
        let = [];
        //let workTime = '00:00';
        //จะมีแค่ list activity tr work เท่านั้น เพราะเป็นเวลาทำงานปกติ
        // if (!isEmptyArray(listTR.overSchedule)) {
        if (!isEmptyArray(listTR.work)) {
            listTR.work.forEach(tr => {
                listMstActivity.forEach(mstAct => {
                    if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
                        hour.work = activityHourPaid(tr.start, tr.end, hour.work)
                    }
                    // else if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Not Ready') {
                    //     offTime = activityHourPaid(tr.start, tr.end, offTime)
                    // }
                })
            })
            if (!isEmptyArray(listTR.special)) {
                listTR.special.forEach(trSpecial => {
                    hour.work = activityHourPaid(trSpecial.start, trSpecial.end, hour.work)
                })
            }
        }
        console.log('workTime:', hour.work)
        return hour.work
    } else if (type == 'ot') {
        console.log('Normal Overtime')
        //let  = [];
        //let hour.work = '00:00';
        //จะมีแค่ list activity tr work เท่านั้น เพราะเป็นเวลาทำงานปกติ
        if (!isEmptyArray(listTR.work)) {
            listTR.work.forEach(tr => {
                listMstActivity.forEach(mstAct => {
                    if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
                        hour.work = activityHourPaid(tr.start, tr.end, hour.work)
                    }
                    // else if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Not Ready') {
                    //     offTime = activityHourPaid(tr.start, tr.end, offTime)
                    // }
                })
            })
            if (!isEmptyArray(listTR.special)) {
                listTR.special.forEach(trSpecial => {
                    hour.work = activityHourPaid(trSpecial.start, trSpecial.end, hour.work)
                })
            }
        }

        if (!isEmptyArray(listTR.ot)) {
            listTR.ot.forEach(tr => {
                listMstActivity.forEach(mstAct => {
                    if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Work') {
                        hour.ot = activityHourPaid(tr.start, tr.end, hour.ot)
                    }
                    // else if ((tr.activityName == mstAct.activityName) && mstAct.groupType == 'Not Ready') {
                    //     offTime = activityHourPaid(tr.start, tr.end, offTime)
                    // }
                })
            })
        }
        let hourWork = moment(hour.work, formatHour);
        let stdWork = moment(standardWorkTime, formatHour);
        if (stdWork.isBefore(hourWork) || stdWork.isSame(hourWork)) {
            hour.isPaid = true
        }

        // if (!actualClock.late && !actualClock.lost) {
        //     hour.isPaid = true
        // } else {
        //     hour.isPaid = false
        // }


        console.log('Normal Overtime Time:', hour)
        return hour
    }
}



function findActualClockFromTR(schedule, listTR, listMstActivity, scheduleDate, overlapTime) {

    let actualClockObj = {
        start: '',
        end: '',
        lost: false,
        late: false
    }
    let scheduleStart, scheduleEnd;
    /* special case ,*/
    let midNight = moment(scheduleDate, 'YYYY-MM-DD ' + format);

    if (overlapTime) {
        scheduleStart = moment(scheduleDate + schedule.start, 'YYYY-MM-DD ' + format);
        scheduleEnd = midNightToNextDay(moment(scheduleDate + schedule.end, 'YYYY-MM-DD ' + format).add(1, 'day'))

    } else {
        scheduleStart = moment(scheduleDate + schedule.start, 'YYYY-MM-DD ' + format);
        scheduleEnd = midNightToNextDay(moment(scheduleDate + schedule.end, 'YYYY-MM-DD ' + format));
    }

    let counter = 0;
    listTR.forEach(tr => {
        let timeRecordStart = moment(tr.scheduleDate + tr.start, 'YYYY-MM-DD ' + format);
        let timeRecordEnd = moment(tr.scheduleDate + tr.end, 'YYYY-MM-DD ' + format);
        listMstActivity.forEach(mstAct => {
            if (tr.activityName == mstAct.activityName && mstAct.groupType == 'Work') {
                // if ((counter == 0) && (scheduleStart.isBetween(timeRecordStart, timeRecordEnd) || (timeRecordEnd.isSame(midNight) && timeRecordStart.isBefore(scheduleStart)))
                if ((counter == 0) && scheduleStart.isBetween(timeRecordStart, timeRecordEnd)
                    || scheduleStart.isSame(timeRecordStart)
                    || scheduleStart.isSame(timeRecordEnd)) { //  sl is between tr
                    counter++
                    console.log(1)
                    actualClockObj.start = tr.start
                    actualClockObj.end = tr.end
                    actualClockObj.late = false
                }
                else if ((counter == 0) && (scheduleStart.isBefore(timeRecordStart) || scheduleStart.isSame(timeRecordStart))) {//  sl is before tr
                    counter++
                    console.log(2)
                    actualClockObj.start = tr.start
                    actualClockObj.end = tr.end
                    actualClockObj.late = true
                }
                else if ((counter > 0) && (scheduleEnd.isBetween(timeRecordStart, timeRecordEnd)

                    || scheduleEnd.isSame(timeRecordStart)
                    || scheduleEnd.isSame(timeRecordEnd))) {
                    // actualClockObj.start = tr.start
                    console.log(3)
                    actualClockObj.end = tr.end
                    actualClockObj.lost = false
                } else if ((counter > 0) && (scheduleEnd.isAfter(timeRecordEnd))) {  //case lost
                    //actualClockObj.start = tr.start
                    console.log(4)
                    actualClockObj.end = tr.end
                    actualClockObj.lost = true
                } else {
                    //console.log('findActualClockFromTR: tr not match to moment SL ')
                }

            } else {
                // console.log('findActualClockFromTR: not group work type "work" ')
            }

        })
    })
    return actualClockObj
}

function findActualClockOTFromTR(scheduleOT, listTR, listMstActivity, normalSchedule, scheduleDate, overlapTime) {
    let actualClockObj = {
        start: '',
        end: '',
        // lost: false,
        // late: false
    }

    let arrCheckOverlapSchd = []
    // let scheduleOTStart = moment(scheduleOT.start, format);
    // let scheduleOTEnd = moment(scheduleOT.end, format);
    let scheduleOTStart, scheduleOTEnd;

    /* special case ,*/
    let midNight = moment(scheduleDate, 'YYYY-MM-DD ' + format);

    if (overlapTime) {
        scheduleOTStart = moment(scheduleDate + scheduleOT.start, 'YYYY-MM-DD ' + format);
        scheduleOTEnd = moment(scheduleDate + scheduleOT.end, 'YYYY-MM-DD ' + format)//.add(1, 'day')

    } else {
        scheduleOTStart = moment(scheduleDate + scheduleOT.start, 'YYYY-MM-DD ' + format);
        scheduleOTEnd = moment(scheduleDate + scheduleOT.end, 'YYYY-MM-DD ' + format);
    }

    let counter = 0;
    listTR.forEach(tr => {
        let timeRecordStart = moment(tr.scheduleDate + tr.start, 'YYYY-MM-DD ' + format);
        let timeRecordEnd = moment(tr.scheduleDate + tr.end, 'YYYY-MM-DD ' + format);
        listMstActivity.forEach(mstAct => {
            if (tr.activityName == mstAct.activityName && mstAct.groupType == 'Work') {
                if ((counter == 0) && (scheduleOTStart.isBetween(timeRecordStart, timeRecordEnd) || (timeRecordEnd.isSame(midNight) && timeRecordStart.isBefore(scheduleOTStart)))
                    || scheduleOTStart.isSame(timeRecordStart)
                    || scheduleOTStart.isSame(timeRecordEnd)) { //  sl is between tr
                    counter++
                    console.log(1)
                    actualClockObj.start = tr.start
                    // actualClockObj.late = false
                    arrCheckOverlapSchd.push(tr)

                }
                else if ((counter == 0) && (scheduleOTStart.isBefore(timeRecordStart) || scheduleOTStart.isSame(timeRecordStart))) {//  sl is before tr
                    counter++
                    actualClockObj.start = tr.start
                    console.log(2)
                    arrCheckOverlapSchd.push(tr)
                }
                else if ((counter > 0) && (scheduleOTEnd.isBetween(timeRecordStart, timeRecordEnd)
                    || scheduleOTEnd.isSame(timeRecordStart)
                    || scheduleOTEnd.isSame(timeRecordEnd))) {
                    actualClockObj.end = tr.end
                    console.log(3)
                    arrCheckOverlapSchd.push(tr)
                } else if ((counter > 0) && (scheduleOTEnd.isAfter(timeRecordEnd))) {  //case lost
                    actualClockObj.end = tr.end
                    console.log(4)
                    arrCheckOverlapSchd.push(tr)
                } else {
                    //console.log('findActualClockFromTR: tr not match to moment SL ')
                }

            } else {
                // console.log('findActualClockFromTR: not group work type "work" ')
            }

        })
    })
    let nmSchdStart = moment(normalSchedule.start, format);
    let nmSchdEnd = moment(normalSchedule.end, format);
    if (nmSchdStart.isAfter(scheduleOTEnd) || nmSchdStart.isSame(scheduleOTEnd)) {  // OT ก่อน ต้อง check กับ Schedule start
        if (!isEmptyArray(arrCheckOverlapSchd)) {
            arrCheckOverlapSchd.some(e => {
                let trStart = moment(e.start, format);
                let trEnd = moment(e.end, format);
                if (nmSchdStart.isBetween(trStart, trEnd)) {
                    actualClockObj.end = normalSchedule.start
                    return true
                }
            })
        } else {
            console.log('arrCheckOverlapSchd is Empty OT before')
        }

    } else { //OT หลัง ต้อง check กับ Schedule stop
        if (!isEmptyArray(arrCheckOverlapSchd)) {
            arrCheckOverlapSchd.some(e => {
                let trStart = moment(e.start, format);
                let trEnd = moment(e.end, format);
                if (nmSchdEnd.isBetween(trStart, trEnd)) {
                    actualClockObj.start = normalSchedule.end
                    return true
                }
            })
        } else {
            console.log('arrCheckOverlapSchd is Empty OT After')
        }
    }
    console.log('tempSchedule:', arrCheckOverlapSchd)
    return actualClockObj

}


checkOverlapOT = (schedule, scheduleOT, listOT) => {

    let scheduleOTStart = moment(scheduleOT.start, format);
    let scheduleOTEnd = moment(scheduleOT.end, format);

    let nmSchdStart = moment(schedule.start, format);
    let nmSchdEnd = moment(schedule.end, format);
    if (nmSchdStart.isAfter(scheduleOTEnd) || nmSchdStart.isSame(scheduleOTEnd)) {  // OT ก่อน ต้อง check กับ Schedule start
        if (!isEmptyArray(listOT)) {
            listOT.forEach(e => {
                let trStart = moment(e.start, format);
                let trEnd = moment(e.end, format);
                if (nmSchdStart.isBetween(trStart, trEnd)) {
                    e.end = schedule.start
                    // return true
                }
            })
        } else {
            console.log('listOT is Empty OT before')
        }

    } else { //OT หลัง ต้อง check กับ Schedule stop
        if (!isEmptyArray(listOT)) {
            listOT.forEach(e => {
                let trStart = moment(e.start, format);
                let trEnd = moment(e.end, format);
                if (nmSchdEnd.isBetween(trStart, trEnd)) {
                    e.start = schedule.end
                    // return true
                }
            })
        } else {
            console.log('listOT is Empty OT After')
        }
    }

    //return listOT //list tr is overlap
}

function findScheduleForSpiltTR(listSL) {

    let scheduleObj = {
        start: '',
        end: ''
    }

    scheduleObj.start = listSL[0].start
    scheduleObj.end = listSL[listSL.length - 1].end


    return scheduleObj

}
async function findScheduleStartEnd(listSL, type) {

    let scheduleObj = {
        start: '',
        end: ''
    }
    let scheduleObj2OT = {
        before: {
            start: '',
            end: ''
        },
        after: {
            start: '',
            end: ''
        }
    }

    let listMstActivityOT = await getActivityInfo('OT');
    let listMstActivity = await getActivityInfo('ALL');

    if (type == 'normal') {
        // scheduleObj.start = listSL[0].start
        // scheduleObj.end = listSL[listSL.length - 1].end
        console.log('findScheduleStartEnd normal')
        let counter = 0;
        listSL.forEach(e => {
            if (checkActivityByGrup('Work', listMstActivity, e.activityName) && counter == 0) {
                scheduleObj.start = e.start;
                scheduleObj.end = e.end;
                counter++
            } else if (checkActivityByGrup('Work', listMstActivity, e.activityName) && counter > 0) {
                scheduleObj.end = e.end;
            }
        })
    }
    else if (type == 'ot') {

        console.log('findScheduleStartEnd ot')

        listSL.some(e => {
            console.log(e)
            if (checkActivityByGrup('OT', listMstActivityOT, e.activityName)) {
                scheduleObj.start = e.start;
                scheduleObj.end = e.end;
                return true;
            }

        })
    } else if (type == '2OT') {
        console.log('findScheduleStartEnd 2OT')
        let count = 0;
        listSL.forEach(e => {
            if (checkActivityByGrup('OT', listMstActivityOT, e.activityName) && count == 0) {
                scheduleObj2OT.before.start = e.start;
                scheduleObj2OT.before.end = e.end;
                count++
            } else if (checkActivityByGrup('OT', listMstActivityOT, e.activityName) && count != 0) {
                scheduleObj2OT.after.start = e.start;
                scheduleObj2OT.after.end = e.end;
            }
        })

        return scheduleObj2OT;
    }

    return scheduleObj
}

async function findScheduleStartEndLeaveAllDay(listSL, type) {

    let scheduleObj = {
        start: '',
        end: ''
    }

    let listMstActivity = await getActivityInfo('ALL');

    if (type == 'OTCOM') {
        console.log('findScheduleStartEnd normal')
        let counter = 0;
        listSL.forEach(e => {
            if (checkActivityByGrup('Leave', listMstActivity, e.activityName) && counter == 0) {
                scheduleObj.start = e.start;
                scheduleObj.end = e.end;
                counter++
            } else if (checkActivityByGrup('Leave', listMstActivity, e.activityName) && counter > 0) {
                scheduleObj.end = e.end;
            }
        })
    }

    return scheduleObj
}


function isOTCompensate(listSL, listTR) {

    let record = {
        otStart: '',
        otEnd: '',
        hour: '',
    }

}

function setID(obj) {
    let objID = {};
    objID.pin = isNotEmpty(obj.pin) ? obj.pin : ''
    objID.txDetailSLId = isNotEmpty(obj.headerSL) ? obj.headerSL : ''
    objID.txDetailTRId = isNotEmpty(obj.headerTR) ? obj.headerTR : ''
    objID.scheduleDate = isNotEmpty(obj.scheduleDate) ? obj.scheduleDate : ''
    objID.supervisorPin = isNotEmpty(obj.supervisorPin) ? obj.supervisorPin : ''
    objID.managerPin = isNotEmpty(obj.managerPin) ? obj.managerPin : ''
    console.log('objID:', objID)
    logger.debug(objID)
    return objID
}


getTimeLostOrlate = (schedule, actualClock) => {

    let time = {
        lost: '00:00',
        late: '00:00'
    }
    if (actualClock.lost && actualClock.late) {
        time.lost = activityHourPaid(schedule.end, actualClock.end, time.lost)
        time.late = activityHourPaid(schedule.start, actualClock.start, time.late)
    } else if (actualClock.late) {
        time.late = activityHourPaid(schedule.start, actualClock.start, time.late)
    } else if (actualClock.lost) {
        time.lost = activityHourPaid(schedule.end, actualClock.end, time.lost)
    } else {  // not late or lost
        return time
    }

    return time
}

function isAutoOT(listSL, listTR) {
    let record = {
        otStart: '',
        otEnd: '',
        hour: '',
    }

    let actTREndTime = moment(listTR.activityTR.shift.end, format);
    let actTRStartTime = moment(listTR.activityTR.shift.start, format);

    let duration = moment.duration(actTREndTime.diff(actTRStartTime));
    let hours = Math.abs(parseInt(duration.get('hours')));
    let minutes = Math.abs(parseInt(duration.get('minutes')));
    let second = Math.abs(parseInt(duration.get('seconds')));
    //console.log(hours + ' hour and ' + minutes + ' minutes.' + second);
    record.otStart = actTRStartTime
    record.otEnd = actTREndTime
    record.hour = hours.pad() + ':' + minutes.pad() + ':' + second.pad()
    console.log('record normal OT', record);

}

async function setData2condLeave(objSL, isAllDay, scheduleDate) {
    let rec = new SummaryInfo('LV')
    let start = true;
    MST.LEAVE.some(e => {
        if (start) {
            objSL.some(act => {
                if (e.ACTIVITY == act.activityName) {
                    rec.recordType = isNotEmpty(e.KEY) ? e.KEY : ''
                    start = false
                    return true
                }
            })
        }
    })
    rec.createDt = createDateTime
    rec.shiftFlag = changeFormatBoolean(false)
    rec.transportFlag = changeFormatBoolean(false)
    if (isAllDay) {
        rec.scheduleStartDt = changeFormatDate(scheduleDate + " " + objSL[0].start, 'YYYY-MM-DD' + " " + format)//objSL[0].start
        rec.scheduleEndDt = changeFormatDate(scheduleDate + " " + objSL[objSL.length - 1].end, 'YYYY-MM-DD' + " " + format)//objSL[objSL.length - 1].end

        rec.remark = remark(rec.recordType, objSL[0].start, objSL[objSL.length - 1].end)

    }
    // else if (!isAllDay) {
    //     let lsitSLLeave = [];
    //     let listMstActivityLeave = await getActivityInfo('Leave');
    //     objSL.forEach(e => {
    //         if (checkActivityByGrup('Leave', listMstActivityLeave, e.activityName)) {
    //             lsitSLLeave.push(e)
    //         }
    //     })

    //     rec.remark = remark(rec.recordType, lsitSLLeave[0].start, lsitSLLeave[0].stop)
    // }
    return rec
}

function setData2condLostAllDay(objSL, isOverlap, scheduleDate) {
    console.log('setData2condAllDaySpecial')
    let rec = new SummaryInfo('ON')
    rec.scheduleStartDt = changeFormatDate(scheduleDate + " " + objSL[0].start, 'YYYY-MM-DD' + " " + format)//objSL[0].start
    rec.scheduleEndDt = changeFormatDate(scheduleDate + " " + objSL[objSL.length - 1].end, 'YYYY-MM-DD' + " " + format)//objSL[objSL.length - 1].end
    rec.shiftFlag = changeFormatBoolean(false)
    rec.transportFlag = changeFormatBoolean(false)
    rec.createDt = createDateTime
    rec.remark = remark('Lost', objSL[0].start, objSL[objSL.length - 1].end)
    return rec
}

function setData2condAllDaySpecial(objSL, isOverlap, scheduleDate) {
    console.log('setData2condAllDaySpecial')
    let rec = new SummaryInfo('ON')
    let flagPaid = hasShiftOrTransport(objSL, objSL)
    rec.scheduleStartDt = changeFormatDate(scheduleDate + " " + objSL[0].start, 'YYYY-MM-DD' + " " + format)
    rec.scheduleEndDt = changeFormatDate(scheduleDate + " " + objSL[objSL.length - 1].end, 'YYYY-MM-DD' + " " + format)
    rec.shiftFlag = changeFormatBoolean(flagPaid.shift)
    rec.transportFlag = changeFormatBoolean(flagPaid.transport)
    rec.actualClockinDt = changeFormatDate(scheduleDate + " " + objSL[0].start, 'YYYY-MM-DD' + " " + format)
    rec.actualClockoutDt = changeFormatDate(scheduleDate + " " + objSL[objSL.length - 1].end, 'YYYY-MM-DD' + " " + format)
    rec.createDt = createDateTime
    return rec
}


function remark(word, start, end) {

    return word + '(' + start + '-' + end + ')';
}


isLeaveActivity = (listSL) => {
    return new Promise(async (resolve, reject) => {
        let isLeave = false
        let listMstActivityLeave = await getActivityInfo('Leave');
        listSL.some(e => {
            if (checkActivityByGrup('Leave', listMstActivityLeave, e.activityName)) {
                isLeave = true
                return true
            }
        })
        resolve(isLeave)
    })
}

isLeaveActivityAllDay = (listSL) => {
    return new Promise(async (resolve, reject) => {
        let isLeaveAllDay = true
        let listMstActivity = await getActivityInfo('ALL');
        let countMeal = 0;
        listSL.some(e => {
            if (checkActivityByGrup('Meal', listMstActivity, e.activityName)) {
                countMeal++
            }

            if (!checkActivityByGrup('Leave', listMstActivity, e.activityName) && !checkActivityByGrup('Meal', listMstActivity, e.activityName)) {
                isLeaveAllDay = false
                return true
            }

        })

        if (countMeal == 1 && isLeaveAllDay) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

//call RDP 
async function isHoliday(start, end) {
    return new Promise((resolve, reject) => {
        rdpService.getHolidayByDate(start, end)
            .then(holidayList => {
                if (holidayList.GET_HOLIDAYSResult == undefined) {
                    resolve(false)
                } else {
                    // resolve(holidayList.GET_HOLIDAYSResult.Holiday)
                    resolve(true)
                }
            })
            .catch(err => {
                reject(err)
                logger.error(err);
            });
    })
}


//call activityInfo
function getActivityInfo(param) {
    return new Promise((resolve, reject) => {
        if (param == 'ALL')
            resolve(
                infoActivity.
                    findAll({
                        include: [{
                            all: true
                        }], raw: true,
                    })
            )
        else {
            console.log('groupType:', param)
            resolve(
                infoActivity.
                    findAll({
                        where: {
                            groupType: param
                        },
                        include: [{
                            all: true
                        }], raw: true,
                    })
            )
        }
        //var nodedata = node.values;
        // .then((listAct) => { return listAct.dataValues })
        // .catch((error) => console.log(error))
    })
}





function sortTime(list, overlap) {
    if (true) {
        let array = [];
        for (let obj of list) {
            let result = {};
            result.time = moment(obj.start, formatHour);
            array.push(result);

        }

        array.sort((left, right) => {
            return left.time.diff(right.time);
        })

        for (let i = 0; i < list.length; i++) {
            console.log(list[i].start)
        }

    } else {
        list.sort(function (a, b) {
            // console.log( Date.parse('1970/01/01 ' + a.startDt.slice(0, -2) + ' ' + a.startDt.slice(-2)))
            return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
        });

        for (let i = 0; i < list.length; i++) {
            console.log(list[i].start)
        }
    }
}

async function setData2DBCase2OT(objbyCond, rec) {
    let beforeOT = new SummaryInfo('ON')
    let afterOT = new SummaryInfo('ON')
    let modelSummaryDetail = [];
    /* 
     Begin set Default Value for case 2 OT 
     */
    beforeOT.pin = rec.pin
    beforeOT.txDetailSLId = rec.txDetailSLId
    beforeOT.txDetailTRId = rec.txDetailTRId
    beforeOT.recordDate = rec.recordDate
    beforeOT.createDt = rec.createDt
    beforeOT.recordMonth = rec.recordMonth
    beforeOT.recordType = 'OT Before'
    beforeOT.remark = ''
    await getOrgCodeByPin(beforeOT.pin, beforeOT)
    //beforeOT.shiftFlag = rec.shiftFlag
    //beforeOT.transportFlag = rec.transportFlag

    afterOT.pin = rec.pin
    afterOT.txDetailSLId = rec.txDetailSLId
    afterOT.txDetailTRId = rec.txDetailTRId
    afterOT.recordDate = rec.recordDate
    afterOT.createDt = rec.createDt
    afterOT.recordMonth = rec.recordMonth
    afterOT.recordType = 'OT After'
    afterOT.remark = ''
    await getOrgCodeByPin(afterOT.pin, afterOT)
    //beforeOT.shiftFlag = rec.shiftFlag
    // beforeOT.transportFlag = rec.transportFlag
    /* 
         End set Default Value for case 2 OT 
    */


    if (isNotEmpty(objbyCond.actualClockOT.actualClockBefore)) {
        let otBefore = objbyCond.actualClockOT.actualClockBefore;
        if (isNotEmpty(otBefore.start) && isNotEmpty(otBefore.end)) {
            beforeOT.otStartDt = changeFormatDate(rec.recordDate + " " + otBefore.start, 'YYYY-MM-DD' + " " + format)
            beforeOT.otEndDt = changeFormatDate(rec.recordDate + " " + otBefore.end, 'YYYY-MM-DD' + " " + format)
        }
    }

    if (isNotEmpty(objbyCond.actualClockOT.actualClockAfter)) {
        let otAfter = objbyCond.actualClockOT.actualClockAfter;
        if (isNotEmpty(otAfter.start) && isNotEmpty(otAfter.end)) {
            afterOT.otStartDt = changeFormatDate(rec.recordDate + " " + otAfter.start, 'YYYY-MM-DD' + " " + format)
            afterOT.otEndDt = changeFormatDate(rec.recordDate + " " + otAfter.end, 'YYYY-MM-DD' + " " + format)
        }
    }

    if (isNotEmpty(objbyCond.scheduleOT.before)) {
        let scheduleBefore = objbyCond.scheduleOT.before;
        if (isNotEmpty(scheduleBefore.start) && isNotEmpty(scheduleBefore.end)) {
            beforeOT.scheduleStartDt = changeFormatDate(rec.recordDate + " " + scheduleBefore.start, 'YYYY-MM-DD' + " " + format)
            beforeOT.scheduleEndDt = changeFormatDate(rec.recordDate + " " + scheduleBefore.end, 'YYYY-MM-DD' + " " + format)
        }
    }

    if (isNotEmpty(objbyCond.scheduleOT.after)) {
        let scheduleAfter = objbyCond.scheduleOT.after;
        if (isNotEmpty(scheduleAfter.start) && isNotEmpty(scheduleAfter.end)) {
            afterOT.scheduleStartDt = changeFormatDate(rec.recordDate + " " + scheduleAfter.start, 'YYYY-MM-DD' + " " + format)
            afterOT.scheduleEndDt = changeFormatDate(rec.recordDate + " " + scheduleAfter.end, 'YYYY-MM-DD' + " " + format)
        }
    }

    if (objbyCond.objHour.isPaid) {
        beforeOT.ot30 = objbyCond.objHour.otBefore
        afterOT.ot30 = objbyCond.objHour.otAfter
    } else {
        beforeOT.ot15 = objbyCond.objHour.otBefore
        afterOT.ot15 = objbyCond.objHour.otAfter
    }

    modelSummaryDetail.push(beforeOT.toObject())
    modelSummaryDetail.push(afterOT.toObject())

    return modelSummaryDetail

}

async function setData2DB(type, objbyCond, objID) {
    //let rec = recordType(type)
    let rec = new SummaryInfo(type)
    let modelSummaryDetail = [];
    rec.pin = objID.pin
    rec.txDetailSLId = objID.txDetailSLId
    rec.txDetailTRId = objID.txDetailTRId
    rec.recordDate = objID.scheduleDate
    rec.createDt = createDateTime
    rec.recordMonth = spiltStringByKeyword(moment(rec.recordDate).format('MM-YYYY'), '-');
    rec.superPin = objID.supervisorPin
    rec.managerPin = objID.managerPin
    await getOrgCodeByPin(rec.pin, rec)
    // rec.cmpy =
    // rec.bu =
    // rec.dp =
    // rec.section=
    // rec.fn=

    if (type == 'ON') {
        if (objbyCond.objHour.isPaid) {
            rec.ot15 = objbyCond.objHour.ot;
        }
        if (isNotEmpty(objbyCond.actualClockOT)) {
            if (isNotEmpty(objbyCond.actualClockOT.start) && isNotEmpty(objbyCond.actualClockOT.end)) {
                rec.otStartDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClockOT.start, 'YYYY-MM-DD' + " " + format)
                rec.otEndDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClockOT.end, 'YYYY-MM-DD' + " " + format)
            }
        }
        // let currentDate = moment(new Date()).format("YYYY-MM-DD");
        // rec.createDt = currentDate;
        rec.scheduleStartDt = changeFormatDate(rec.recordDate + " " + objbyCond.schedule.start, 'YYYY-MM-DD' + " " + format)
        rec.scheduleEndDt = changeFormatDate(rec.recordDate + " " + objbyCond.schedule.end, 'YYYY-MM-DD' + " " + format)
        if (isNotEmpty(objbyCond.actualClock)) {
            if (isNotEmpty(objbyCond.actualClock.start) && isNotEmpty(objbyCond.actualClock.end)) {
                rec.actualClockinDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClock.start, 'YYYY-MM-DD' + " " + format)
                rec.actualClockoutDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClock.end, 'YYYY-MM-DD' + " " + format)
            }
        }
        rec.lateTime = objbyCond.objTime.late
        rec.lostTime = objbyCond.objTime.lost

        rec.shiftFlag = changeFormatBoolean(objbyCond.flagPaid.shift)
        rec.transportFlag = changeFormatBoolean(objbyCond.flagPaid.transport)
        rec.ot30 = '0.00';
        rec.remark = '';
        rec.createBy = 'Batch';
        modelSummaryDetail.push(rec.toObject())

        if (objbyCond.is2OT) {
            let rec2OT = setData2DBCase2OT(objbyCond, rec)
            // modelSummaryDetail.concat(rec2OT)
            rec2OT.forEach(e => {
                modelSummaryDetail.push(e)
            })

        }

        return saveData2DB(modelSummaryDetail)
    }
    else if (type == 'AutoOT') {
        rec.pin = objID.pin
        rec.txDetailSLId = objID.txDetailSLId
        rec.txDetailTRId = objID.txDetailTRId
        modelSummaryDetail.push(rec)
        return saveData2DB(rec.toObject())
    }
    else if (type == 'OFF') {
        rec.pin = objID.pin
        rec.txDetailSLId = objID.txDetailSLId
        rec.txDetailTRId = objID.txDetailTRId
        modelSummaryDetail.push(rec)
        return saveData2DB(rec.toObject())
        //console.log(modelSummaryDetail)
    }
    else if (type == 'OTCOM') {
        //  if (objbyCond.objHour.isPaid) {

        // }
        if (isNotEmpty(objbyCond.actualClockOT)) {
            if (isNotEmpty(objbyCond.actualClockOT.start) && isNotEmpty(objbyCond.actualClockOT.end)) {
                rec.otStartDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClockOT.start, 'YYYY-MM-DD' + " " + format)
                rec.otEndDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClockOT.end, 'YYYY-MM-DD' + " " + format)
            }
        }
        rec.createDt = createDateTime;
        rec.scheduleStartDt = changeFormatDate(rec.recordDate + " " + objbyCond.schedule.start, 'YYYY-MM-DD' + " " + format)
        rec.scheduleEndDt = changeFormatDate(rec.recordDate + " " + objbyCond.schedule.end, 'YYYY-MM-DD' + " " + format)
        if (isNotEmpty(objbyCond.actualClock)) {
            if (isNotEmpty(objbyCond.actualClock.start) && isNotEmpty(objbyCond.actualClock.end)) {
                rec.actualClockinDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClock.start, 'YYYY-MM-DD' + " " + format)
                rec.actualClockoutDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClock.end, 'YYYY-MM-DD' + " " + format)
            }
        }
        rec.lateTime = objbyCond.objTime.late
        rec.lostTime = objbyCond.objTime.lost

        rec.shiftFlag = changeFormatBoolean(objbyCond.flagPaid.shift)
        rec.transportFlag = changeFormatBoolean(objbyCond.flagPaid.transport)
        rec.ot10 = '8:00';  // defualt 8 hour , standard work
        rec.ot15 = '0.00';
        rec.ot30 = objbyCond.objHour.ot;
        rec.recordMonth = '';
        rec.remark = '';
        rec.createBy = 'Batch';
        modelSummaryDetail.push(rec.toObject())
        if (objbyCond.is2OT) {
            let rec2OT = setData2DBCase2OT(objbyCond, rec)
            rec2OT.forEach(e => {
                modelSummaryDetail.push(e)
            })
        }

        return saveData2DB(rec.toObject())
    }

    else if (type == 'OTComLeaveAllDay') {
        if (objbyCond.objHour.isPaid) {
            rec.ot10 = objbyCond.objHour.ot;
        }
        // if (isNotEmpty(objbyCond.actualClockOT)) {
        //     if (isNotEmpty(objbyCond.actualClockOT.start) && isNotEmpty(objbyCond.actualClockOT.end)) {
        //         rec.otStartDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClockOT.start, 'YYYY-MM-DD' + " " + format)
        //         rec.otEndDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClockOT.end, 'YYYY-MM-DD' + " " + format)
        //     }
        // }
        // // let currentDate = moment(new Date()).format("YYYY-MM-DD");
        // // rec.createDt = currentDate;
        rec.scheduleStartDt = changeFormatDate(rec.recordDate + " " + objbyCond.schedule.start, 'YYYY-MM-DD' + " " + format)
        rec.scheduleEndDt = changeFormatDate(rec.recordDate + " " + objbyCond.schedule.end, 'YYYY-MM-DD' + " " + format)
        if (isNotEmpty(objbyCond.actualClock)) {
            if (isNotEmpty(objbyCond.actualClock.start) && isNotEmpty(objbyCond.actualClock.end)) {
                rec.actualClockinDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClock.start, 'YYYY-MM-DD' + " " + format)
                rec.actualClockoutDt = changeFormatDate(rec.recordDate + " " + objbyCond.actualClock.end, 'YYYY-MM-DD' + " " + format)
            }
        }
        rec.lateTime = objbyCond.objTime.late
        rec.lostTime = objbyCond.objTime.lost

        rec.shiftFlag = changeFormatBoolean(objbyCond.flagPaid.shift)
        rec.transportFlag = changeFormatBoolean(objbyCond.flagPaid.transport)
        rec.ot30 = '0.00';
        rec.recordMonth = '';
        rec.remark = '';
        rec.createBy = 'Batch';
        // modelSummaryDetail.push(rec)

        // console.log(modelSummaryDetail)

        return saveData2DB(rec.toObject())
    }
    // let pass = false
    // modelSummaryDetail.every(e => {
    //     if (validatePass(e)) {
    //         pass = true
    //     } else {
    //         return false
    //     }
    // })
    // try {
    //     if (pass) {
    //         console.log('rec:', rec)
    //         // saveData2DB(rec)
    //     }
    // }
    // catch (e) {
    //     log.error(e)
    // }

}


function saveData2DB(modelSummaryDetail) {

    console.log(modelSummaryDetail)

    let whereInfosummary = {
        pin: modelSummaryDetail[0].pin,
        recordDt: moment(modelSummaryDetail[0].recordDate).format('YYYY-MM-DD'),
    }
    if (isNotEmpty(modelSummaryDetail[0].txDetailSLId)) {
        whereInfosummary['slHeaderId'] = modelSummaryDetail[0].txDetailSLId
    }
    if (isNotEmpty(modelSummaryDetail[0].txDetailTRId)) {
        whereInfosummary['trHeaderId'] = modelSummaryDetail[0].txDetailTRId
    }
    console.log(whereInfosummary)
    return new Promise((resolve, reject) => {
        txSummaryDetail.bulkCreate(modelSummaryDetail)
            .then(obj => {
                infoSummaryCheck.update({
                    genSumFlag: 'Y',
                    genSumStartDt: moment().format('YYYY-MM-DD' + " " + format),
                    genSumEndDt: moment().format('YYYY-MM-DD' + " " + format),
                }, {
                        where: whereInfosummary,
                        returning: true,
                        plain: true
                    })
                    .then(function (result) {
                        console.log(result);
                        resolve(true)
                        // result = [x] or [x, y]
                        // [x] if you're not using Postgres
                        // [x, y] if you are using Postgres
                    });
            })
            .catch(error => { console.log(error); reject(new Error('insert or update info summary fail')) });
    })
    // txSummaryDetail.bulkCreate(modelSummaryDetail, { validate: true })
    //      .then(todo => console.log(todo))
    //      .catch(error => console.log(error));
}

function mapData2Obj(summaryCheck, mapAidToPin) {
    logger.debug('start mapData2Obj');
    let employeeScheList = []
    let mapTR = new Map();
    return new Promise(async (resolve, reject) => {
        try {

            const listSL = await getSLDetailModel(summaryCheck)
            logger.debug('listSL length:' + listSL.length);

            let isOverlap = false;
            if (isNotEmpty(listSL)) {
                isOverlap = getOverlapDate(listSL)
                console.log('isOverlap:', isOverlap)
            }

            const listTR = await getTRDetailModel(summaryCheck, isOverlap);
            console.log(listTR)
            logger.debug('listTR length:' + listTR.length);

            console.log(listSL)
            if (!isEmptyArray(listTR)) {
                for (let tr of listTR) {
                    if (isNotEmpty(tr.ssn) && !isNotEmpty(mapTR.get(tr.ssn))) { //new ssn
                        let listEmployeeTR = getNewObjbyType('InitObjTRMap')
                        listEmployeeTR.pin = tr.ssn
                        listEmployeeTR.headerTR = tr.headerId
                        listEmployeeTR.organizeName = tr.organizeName
                        listEmployeeTR.employeeName = tr.agentName
                        // listEmployeeTR.scheduleDate = tr.scheduleDate  
                        listEmployeeTR.activity.push({ start: tr.startDt, end: tr.stopDt, activityName: tr.activity, scheduleDate: tr.scheduleDate })
                        mapTR.set(listEmployeeTR.pin, listEmployeeTR);  // change obj to map 
                    } else if (isNotEmpty(tr.ssn) && isNotEmpty(mapTR.get(tr.ssn))) {
                        let tempMap = mapTR.get(tr.ssn);
                        tempMap.activity.push({ start: tr.startDt, end: tr.stopDt, activityName: tr.activity, scheduleDate: tr.scheduleDate })
                        mapTR.set(tr.ssn, tempMap);
                    }
                }//1152
                console.log('mapTR:', mapTR.size)  //select ssn from tx_tr_detail where ssn is not null group by ssn order by ssn asc for check
                logger.debug('mapTR Size:' + mapTR.size);
            } else {
                console.log('empty TR detail')
                logger.debug('empty TR detail');
            }
            if (isNotEmpty(listSL)) {
                for (let sl of listSL) {
                    if ((isEmptyArray(employeeScheList) && isNotEmpty(sl.ssn)) || (employeeScheList.findIndex(e => { return e.pin == sl.ssn })) < 0 && isNotEmpty(sl.ssn)) {
                        let list = getNewObjbyType('InitObj')
                        //console.log(list.activitySL)
                        list.pin = sl.ssn
                        list.tz = sl.time_zone
                        list.headerSL = sl.headerId
                        list.scheduleDate = sl.scheduleDate
                        //check overlap
                        // let execDate = moment(sl.execDate, "YYYY-MM-DD" + format)
                        // let scheduleDate = moment(sl.scheduleDate, "YYYY-MM-DD" + format)
                        // let execDate = moment(sl.execDate, "YYYY-MM-DD")
                        // let scheduleDate = moment(sl.scheduleDate, "YYYY-MM-DD")
                        // console.log("overlap:" + execDate.isSame(scheduleDate))
                        list.overlapTime = isOverlap

                        list.activitySL.push({ start: sl.startDt, end: sl.stopDt, activityName: sl.activity })
                        //console.log('isNotEmpty(mapTR):', isNotEmpty(mapTR.get(sl.ssn)))
                        list.activityTR = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).activity : '';
                        list.organizeName = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).organizeName : '';
                        list.employeeName = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).employeeName : '';
                        list.headerTR = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).headerTR : '';
                        employeeScheList.push(list)   // mst obj SL,TR
                    } else {
                        let indexExistPin = employeeScheList.findIndex(e => { return e.pin == sl.ssn })
                        // console.log('indexExistPin:', indexExistPin)
                        if (indexExistPin >= 0) {
                            employeeScheList[indexExistPin].activitySL.push({ start: sl.startDt, end: sl.stopDt, activityName: sl.activity })
                            //employeeScheList[indexExistPin].activityTR = isNotEmpty(mapTR.get(sl.pin)) ? mapTR.get(sl.pin).activity : '';
                        }
                    }
                }
                employeeScheList[0].pin = isNotEmpty(mapAidToPin.get(employeeScheList[0].pin)) ? mapAidToPin.get(employeeScheList[0].pin) : employeeScheList = []
                // console.log('employeeScheList:', employeeScheList.length)
            }
            else {
                console.log('empty SL detail')
                logger.debug('empty SL detail');
                // reject(new Error("Empty SL detail"))
            }
        } catch (e) {
            logger.error('Error:' + e);
            reject(new Error("Can not map obj SL TR"))
        }

        resolve(employeeScheList)
    })

}

const getOverlapDate = (listSL) => {
    let scheduleDate = moment(listSL[0].scheduleDate, "YYYY-MM-DD")
    for (let sl of listSL) {
        let execDate = moment(sl.execDate, "YYYY-MM-DD")
        if (!(scheduleDate.isSame(execDate))) {
            return true
        }
    }
    return false
}


const getMapPinAid = (infoSummaryList) => {
    let map = {
        aidToPin: new Map(),
        pinToAid: new Map(),
    }

    infoSummaryList.forEach(e => {
        map.pinToAid.set(e.pin, e.ssn)
        map.aidToPin.set(e.ssn, e.pin)
    })
    return map
}

const getSLDetailModel = (rec) => {
    //return obj.cond.normalOT.overlap.objSL
    //return obj.cond.beforeAfterOT.daily.objSL
    //return obj.cond.off.objSL
    //return obj.cond.special.daily.objSL
    let yesterday = moment(rec.recordDt).format('YYYY-MM-DD');
    // let dayBeforeYesterday = moment().subtract(2, 'days').format('YYYY-MM-DD');
    return new Promise((resolve, reject) => {
        txSlDetail.findAll({
            where: {
                scheduleDate: yesterday,
                // scheduleDate: dayBeforeYesterday,
                headerId: rec.slHeaderId,
                ssn: rec.ssn,

                // ssn: '32327'
            }, order: [
                ['scheduleDate', 'ASC'],
                ['startDt', 'ASC'],
            ],
            //        limit: 2,
            // include: [{
            //     all: true   // จะ query ตาม associate ที่เกี่ยวข้องขึ้นมาด้วย 
            // }]
            // , raw: false   // จะ query raw  value ตาม database ซึ่งจะไม่ทำ function get ที่ config ไว้ทีตัว model 
        }).then((todos) => { resolve(nodeData = todos.map((node) => node.get({ plain: true }))); })
            .catch((error) => { logger.debug(error); reject(new Error("Can not load SL")) });


    })
}

const getTRDetailModel = (rec, overlap) => {
    //return obj.cond.normalOT.overlap.objTR
    //return obj.cond.beforeAfterOT.daily.objTR
    // return obj.cond.off.objTR
    //return obj.cond.special.daily.objTR
    let yesterday = moment(rec.recordDt).format('YYYY-MM-DD');
    let dayBeforeYesterday = moment(rec.recordDt).subtract(1, 'days').format('YYYY-MM-DD');

    //let whereOverlap = {}
    let whereCond = {}

    if (overlap) {

        whereCond = {
            [Op.or]: [{ scheduleDate: yesterday }, { scheduleDate: dayBeforeYesterday }],
            ssn: rec.ssn
        }

    } else {
        // let schedule = {};
        // schedule["scheduleDate"] = yesterday
        whereCond["scheduleDate"] = yesterday
        whereCond["ssn"] = rec.ssn
        whereCond["headerId"] = rec.trHeaderId

        // [Op.or]:{
        //     scheduleDate:yesterday

        // }
    }
    console.log('whereCond:', whereCond)
    return new Promise((resolve, reject) => {
        txTrDetail.findAll({
            where: whereCond,
            order: [
                ['scheduleDate', 'ASC'],
                ['startDt', 'ASC'],
            ]
        }).then((todos) => { resolve(nodeData = todos.map((node) => node.get({ plain: true }))); })
            .catch((error) => { logger.error(error); reject(new Error("Can not load TR")) });

    })
}

const getInfoSummaryCheckModel = () => {
    if (logger.isDebugEnabled()) {
        logger.debug('start getInfoSummaryCheckModel');
    }
    let yesterday = moment('2017-11-12').subtract(1, 'days').format('YYYY-MM-DD');
    let yesterday2 = moment('2017-11-12').format('YYYY-MM-DD');
    let dayBeforeYesterday = moment().subtract(2, 'days').format('YYYY-MM-DD');
    return infoSummaryCheck.findAll({
        attributes: ['pin', 'ssn', 'recordDt', 'slFlag', 'trFlag', 'slHeaderId', 'trHeaderId', 'supervisorPin', 'managerPin', 'genSumStartDt', 'genSumEndDt'],
        where: {
            genSumFlag: 'N',
            // recordDt: yesterday,
            // recordDt: {
            //     [Op.lte]: yesterday
            // },
            [Op.or]: [{ recordDt: yesterday }, { recordDt: yesterday2 }]

        }
        //,limit: 20,
    }).then((todos) => {
        if (logger.isDebugEnabled()) {
            logger.debug('End getInfoSummaryCheckModel');
        }
        return nodeData = todos.map((node) => node.get({ plain: true }));
    }).catch((error) => { console.log(error) });
}



function getNewObjbyType(type) {
    if (type === 'InitObj') {
        return {
            pin: '',
            tz: '',
            scheduleDate: '',
            overlapTime: false,
            organizeName: '',
            employeeName: '',
            headerTR: '',
            headerSL: '',
            activitySL: [],
            activityTR: []
        }
    } else if (type === 'InitObjTRMap') {
        return {
            pin: '',
            organizeName: '',
            employeeName: '',
            headerTR: '',
            activity: []
        }
    } else if (type === 'ModelSummaryDetail') {
        return {
            txDetailSLId: '',
            txDetailTRId: '',
            pin: '',
            scheduleStartDt: '',
            scheduleEndDt: '',
            otStartDt: '',
            otEndDt: '',
            actualClockinDt: '',
            actualClockoutDt: '',
            recordType: '',
            shiftFlag: '',
            transportFlag: '',
            ot10: '',
            ot15: '',
            ot30: '',
            recordDate: '',
            recordMonth: '',
            remark: '',
            useFlag: '',
            createBy: '',
            createDt: '',
        }
    }
}


// function resetMstObjTRSL() {

//     return {
//         pin: '',
//         tz: '',
//         // work_date: '',
//         organize: '',
//         employeeName: '',
//         scheduleDate: '',
//         overlabTime: false,
//         activitySL: [],
//         activityTR: []
//     }
// }

function validatePass(record) {

    // if (record.txDetailSLId) {

    // }
    // if (record.txDetailTRId) {

    // }

    if (!isNotEmpty(record.pin)) {
        logger.debug("pin is Empty")
        return false
    }
    // if (record.scheduleStartDt) {

    // }
    // if (record.scheduleEndDt) {

    // }
    // if (record.otStartDt) {

    // }
    // if (record.otEndDt) {

    // }
    // if (record.actualClockinDt) {

    // }
    // if (record.actualClockoutDt) {

    // }
    if (!isNotEmpty(record.recordType)) {
        logger.debug("recordType is Empty")
        return false
    }
    // if (record.shiftFlag) {

    // }
    // if (record.transportFlag) {

    // }
    // if (record.ot10) {

    // }
    // if (record.ot15) {

    // }
    // if (record.ot30) {

    // }
    if (!isNotEmpty(record.recordDate)) {
        logger.debug("recordDate is Empty")
        return false
    } else {
        record.recordDate = moment(record.recordDate).format("YYYY-MM-DD")
    }
    // if (record.recordMonth) {

    // }
    // if (record.remark) {

    // }
    if (!isNotEmpty(record.useFlag)) {
        logger.debug("useFlag is Empty")
        return false
    }
    if (!isNotEmpty(record.createBy)) {
        logger.debug("createBy is Empty")
        return false
    }
    if (!isNotEmpty(record.createDt)) {
        logger.debug("createDt is Empty")
        return false
    } else {
        record.createDt = moment(record.createDt).format("YYYY-MM-DD" + format)
    }

    return true

}

function findGrupType(arr, listMstActivity) {
    let grupTypeSchedule = []
    arr.forEach(async obj => {
        for (let sl of obj.activitySL) {   //หา group type จาก SL เก็บใน Array
            for (let mstAct of listMstActivity) {
                if (sl.activityName.toUpperCase() === mstAct.activityName.toUpperCase()) {
                    grupTypeSchedule.push(mstAct.groupType)   // array of groupType that match mstActivity
                    break
                }
            }
        }
    })
    return grupTypeSchedule
}



//check ช่วงเวลาของแต่ละ SL ไปเช็ค activity ของ TR ตามช่วงเวลาของ SL ว่าตรงตามหรือไม่
//ถ้าเจอ activity ใน SL แต่ไม่เจอใน TR ให้ไปเช็ค Activity พิเศษถ้าพบ ให้ลงเป็นเวลาทำงานแทน
//check วันที่ทำงาน ว่าเป็น วันหยุด นักขัตฤกษ์หรือไม่ ถ้ามีวันหยุดแล้วมาทำงาน จะได้ OT Com จะเข้าเงื่อนไข OT COM


//ค่ากะและค่ารถ check จากไฟล์ SL ว่ามีเวลาเข้างานอยู่ในช่วงเวลาดังกล่าวไหม 
//ถ้าไม่มีก็ตัดทิ้ง ถ้ามีไป  check ไฟล์ TR และ clockin out ตามลำดับว่าครบ8 ชม ไหม

async function spiltData(data, symbol) {

    await arrayToTxtFile(sumaryDetailObj, './test-output.txt', err => {
        if (err) {
            console.error(err)
            return
        }
        console.log('Successfully wrote sumaryDetailObj to txt file')
    })

}


function hasShiftOrTransport(listSL, listTR, overlapFlag, scheduleDate) {

    let flagPaid = { shift: false, transport: false }
    let hasSchedule = checkSchedule(listSL, overlapFlag, scheduleDate)
    let isPaid = checkTimeRecord(listTR, overlapFlag, scheduleDate)
    if (hasSchedule.shift && isPaid.shift && hasSchedule.transport && isPaid.transport) {
        flagPaid.shift = true
        flagPaid.transport = true
        return flagPaid
    }
    else if (!hasSchedule.shift && !hasSchedule.transport) {
        return flagPaid
    }
    else if (hasSchedule.shift && isPaid.shift) {
        flagPaid.shift = true
    }
    else if (hasSchedule.transport && isPaid.transport) {
        flagPaid.transport = true
    }

    return flagPaid;
}




function checkSchedule(listActivitySL, overlapFlag, scheduleDate) {
    // listActivitySL.sort(function (a, b) {
    //     return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    // });

    return isBetweenCondTime(listActivitySL[0].start, listActivitySL[listActivitySL.length - 1].end, overlapFlag, scheduleDate)          //schedule start time


}

function checkTimeRecord(listTimerecord, overlapFlag, scheduleDate) {
    // listTimerecord.sort(function (a, b) {
    //     return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    // });
    return isBetweenCondTime(listTimerecord[0].start, listTimerecord[listTimerecord.length - 1].end, overlapFlag, scheduleDate)          //time record start or clock-in

}

function isBetweenCondTime(clockInTime, clockOutTime, overlapFlag, scheduleDate) { // clockin for check  between condition time

    let isPaid = {
        shift: false,
        transport: false
    }
    let time = moment(scheduleDate + clockInTime, 'YYYY-MM-DD ' + format)
    let overlapDate = moment(scheduleDate, 'YYYY-MM-DD ' + format).add(1, 'day')
    // configuration 

    let startShiftTime, endShiftTime;

    if (overlapFlag) {
        startShiftTime = moment(scheduleDate + shiftStart, 'YYYY-MM-DD ' + format)
        endShiftTime = moment(overlapDate + shiftEnd, 'YYYY-MM-DD ' + format)
    } else {
        startShiftTime = moment(scheduleDate + shiftStart, 'YYYY-MM-DD ' + format)
        endShiftTime = moment(scheduleDate + shiftEnd, 'YYYY-MM-DD ' + format)
    }

    // check working 8 hour
    // if (time.isAfter(startShiftTime) || time.isBefore(endShiftTime)) {
    //     console.log('is between Shift')
    //     if (checkStandardWorkTime(clockInTime, clockOutTime)) {
    //         isPaid.shift = true
    //     }
    // }

    if (time.isSame(startShiftTime) || time.isBetween(startShiftTime, endShiftTime) || time.isSame(endShiftTime)) { //ถ้ามี SL ช่วง Shift
        console.log('is between Shift')

        let clockIn, clockOut;
        if (overlapFlag) {
            clockIn = moment(scheduleDate + clockInTime, 'YYYY-MM-DD ' + format)
            clockOut = moment(overlapDate + clockOutTime, 'YYYY-MM-DD ' + format)
        } else {
            clockIn = moment(scheduleDate + clockInTime, 'YYYY-MM-DD ' + format)
            clockOut = moment(scheduleDate + clockOutTime, 'YYYY-MM-DD ' + format)
        }
        if (checkStandardWorkTime(clockIn, clockOut)) { // 
            isPaid.shift = true
        }
    }

    let startTransportTime, endTransportTime;

    if (overlapFlag) {
        startTransportTime = moment(scheduleDate + transportStart, 'YYYY-MM-DD ' + format)
        endTransportTime = moment(overlapDate + transportEnd, 'YYYY-MM-DD ' + format)
    } else {
        startTransportTime = moment(scheduleDate + transportStart, 'YYYY-MM-DD ' + format)
        endTransportTime = moment(scheduleDate + transportEnd, 'YYYY-MM-DD ' + format)
    }

    // if (time.isBetween(startTransportTime, endTransportTime) || time.isSame(startTransportTime) || time.isBetween(endTransportTime)) {
    //     console.log('is between Transport')
    //     if (checkStandardWorkTime(clockInTime, clockOutTime)) {
    //         isPaid.transport = true
    //     }
    // }

    if (time.isSame(startTransportTime) || time.isBetween(startTransportTime, endShiftTime) || time.isSame(endTransportTime)) { //ถ้ามี SL ช่วง Shift
        console.log('is between Transport')

        let clockIn, clockOut;
        if (overlapFlag) {
            clockIn = moment(scheduleDate + clockInTime, 'YYYY-MM-DD ' + format)
            clockOut = moment(overlapDate + clockOutTime, 'YYYY-MM-DD ' + format)
        } else {
            clockIn = moment(scheduleDate + clockInTime, 'YYYY-MM-DD ' + format)
            clockOut = moment(scheduleDate + clockOutTime, 'YYYY-MM-DD ' + format)
        }
        if (checkStandardWorkTime(clockIn, clockOut)) { // 
            isPaid.transport = true
        }
    }

    return isPaid
}

//จะเหลือ case กรณี overlap กัน
function checkStandardWorkTime(clockInTime, clockOutTime) {
    console.log('checkStandardWorkTime:')
    console.log(clockInTime)
    console.log(clockOutTime)
    let workTime = moment(clockInTime, format).add(standardWorkTime, 'hours'); // + 8 hour 
    let clockOut = moment(clockOutTime, format)
    if (workTime.isSame(clockOut) || workTime.isAfter(clockOut)) {
        return true
    } else {
        return false
    }


}

function convertData2MstParam(data, type) {  // get value from mst_param and convert to data 
    if (type === 'Shift') {
        if (data) {
            return 100
        }
    } else if (type === 'Transport') {
        if (data) {
            return 170
        }
    }
}

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}


function resetObjCond() {
    return objbyCond = {
        schedule: {},
        scheduleOT: {},
        actualClock: {},
        flagPaid: {},
        objHour: {},
        objTime: {},
        actualClockOT: {},
        is2OT: false,
        OT: { OT_1: '', OT1_5: '', OT_3: '' }
    }
}

function isNotEmpty(str) {
    if (str == null || str == undefined || str == '') {
        return false
    }
    return true
}


function isEmptyArray(list) {
    if (list.length == 0 || list == 0) {
        return true
    }
    return false
}

function isTrue(str) {
    if (str.toUpperCase() == 'Y') {
        return true
    }
    return false
}

function changeFormatDate(date, format) {
    console.log('changeFormatDate date:', date)
    console.log('changeFormatDate format:', format)
    return moment(date).format(format);

}

function changeFormatBoolean(flag) {
    if (flag) {
        return 'Y'
    } else {
        return 'N'
    }
}

function spiltStringByKeyword(str, key) {

    return str.substr(0, str.indexOf(key)) + str.substr(str.indexOf(key) + 1)
}


function fullScanMidNight(list, scheduleDate) {

    let midNight = moment(scheduleDate).format('YYYY-MM-DD' + format)
    let nextDay = moment(scheduleDate).add(1, 'days').format('YYYY-MM-DD ' + format)

    list.some(e => {
        // let scheDuleDateTR = moment(e.scheduleDate).format('YYYY-MM-DD')
        let timeRecord = moment(e.scheduleDate + ' ' + e.end).format('YYYY-MM-DD' + format);
        if (timeRecord == midNight) {
            e.scheduleDate = nextDay
            console.log(list)
            return true
        }

    })
    return list
}

function midNightToNextDay(dt) {
    let midNight = '00:00:00'
    let dateTime = moment(dt).format(format)
    if (midNight == dateTime) {
        return dt.add(1, 'days')
    }
    else {
        return dt
    }
}

async function getOrgCodeByPin(pin, rec) {

    //let obj = await employeeService.getEmployeeDetailWithOrganizeByPin(pin)


    // employeeService.getEmployeeDetailWithOrganizeByPin(pin).then(obj => {
    //     if (isNotEmpty(obj)) {
    //         rec.cmpy = !isNaN(parseInt(obj.orgCodeCO)) ? obj.orgCodeCO : 'NOT_FOUND'
    //         rec.bu = !isNaN(parseInt(obj.orgCodeBU)) ? obj.orgCodeBU : 'NOT_FOUND'
    //         rec.dp = !isNaN(parseInt(obj.orgCodeDP)) ? obj.orgCodeDP : 'NOT_FOUND'
    //         rec.section = !isNaN(parseInt(obj.orgCodeSC)) ? obj.orgCodeSC : 'NOT_FOUND'
    //         rec.fn = !isNaN(parseInt(obj.orgCodeFC)) ? obj.orgCodeFC : 'NOT_FOUND'
    //     }
    // }).catch(err => {
    //     rec.cmpy = 'NOT_FOUND'
    //     rec.bu = 'NOT_FOUND'
    //     rec.dp = 'NOT_FOUND'
    //     rec.section = 'NOT_FOUND'
    //     rec.fn = 'NOT_FOUND'
    // })

    try {
        let obj = await employeeService.getEmployeeDetailWithOrganizeByPin(pin);
        if (isNotEmpty(obj)) {
            rec.cmpy = !isNaN(parseInt(obj.orgCodeCO)) ? obj.orgCodeCO : 'NOT_FOUND'
            rec.bu = !isNaN(parseInt(obj.orgCodeBU)) ? obj.orgCodeBU : 'NOT_FOUND'
            rec.dp = !isNaN(parseInt(obj.orgCodeDP)) ? obj.orgCodeDP : 'NOT_FOUND'
            rec.section = !isNaN(parseInt(obj.orgCodeSC)) ? obj.orgCodeSC : 'NOT_FOUND'
            rec.fn = !isNaN(parseInt(obj.orgCodeFC)) ? obj.orgCodeFC : 'NOT_FOUND'
        }
    } catch (e) {
        rec.cmpy = 'NOT_FOUND'
        rec.bu = 'NOT_FOUND'
        rec.dp = 'NOT_FOUND'
        rec.section = 'NOT_FOUND'
        rec.fn = 'NOT_FOUND'
    }

}

