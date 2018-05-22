/*
   model
*/
const infoActivity = require('../models').InfoActivity
const txSlDetail = require('../models').TxSlDetail
const txTrDetail = require('../models').TxTrDetail
const txSummaryDetail = require('../models').TxSummaryDetail
const infoSummaryCheck = require('../models').InfoSummaryCheck
const Op = require('../models').Sequelize.Op;

/*
   dependency
*/
const moment = require('moment');
const arrayToTxtFile = require('array-to-txt-file')

/*
   service
*/
const log = require('./log-service')

/*
   class
*/
const KEYWORD = require('../class').Constant


const condShiftTime = '13:00:00|06:30:00'
const shiftStart = condShiftTime.split('|')[0]
const shiftEnd = condShiftTime.split('|')[1]
const condTransportTime = '14:00:00|20:00:00'
const transportStart = condTransportTime.split('|')[0]
const transportEnd = condTransportTime.split('|')[1]
const format = 'HH:mm:ss'
const formatHour = 'HH:mm';
const standardWorkTime = 8;



let objbyCond = {
    schedule: {},
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

let objID = {
    pin: '',
    txDetailSLId: '',
    txDetailTRId: ''
}


let recordType = (type) => {
    if (type == 'ON')
        return {
            txDetailSLId: '',
            txDetailTRId: '',
            pin: '',
            scheduleStartDt: 'x',
            scheduleEndDt: 'x',
            otStartDt: '',
            otEndDt: '',
            actualClockinDt: '0.00',
            actualClockoutDt: '0.00',
            recordType: 'ON',
            shiftFlag: '',
            transportFlag: '',
            workHour: '',
            ot10: '0.00',
            ot15: '0.00',
            ot30: '0.00',
            recordDate: '',
            recordMonth: '',
            useFlag: 'N',
            remark: '',
            lateTime: '',
            lostTime: '',
            createBy: 'Batch',
            createDt: '',
        }
    else if (type == 'OFF')
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
            recordType: 'OFF',
            shiftFlag: '',
            transportFlag: '',
            workHour: '',
            ot10: '0.00',
            ot15: '0.00',
            ot30: '0.00',
            recordDate: '',
            recordMonth: '',
            useFlag: 'N',
            remark: 'Off',
            lateTime: '',
            lostTime: '',
            createBy: 'Batch',
            createDt: '',
        }
    else if (type == 'LV')
        return {
            txDetailSLId: 'x',
            txDetailTRId: '',
            pin: 'x',
            scheduleStartDt: 'x',
            scheduleEndDt: 'x',
            otStartDt: '',
            otEndDt: '',
            actualClockinDt: '',
            actualClockoutDt: '',
            recordType: 'x',
            shiftFlag: false,
            transportFlag: false,
            ot10: '0.00',
            ot15: '0.00',
            ot30: '0.00',
            workHour: '',
            recordDate: '',
            recordMonth: '',
            useFlag: 'N',
            remark: 'x',
            lateTime: '',
            lostTime: '',
            createBy: 'Batch',
            createDt: '',
        }
    else if (type == 'AutoOT')
        return {
            txDetailSLId: '',
            txDetailTRId: '',
            pin: 'x',
            scheduleStartDt: '',
            scheduleEndDt: '',
            otStartDt: '',
            otEndDt: '',
            actualClockinDt: '',
            actualClockoutDt: '',
            recordType: 'AutoOT',
            shiftFlag: '',
            transportFlag: '',
            ot10: '8.00',
            ot15: '0.00',
            ot30: '0.00',
            workHour: '',
            recordDate: '',
            recordMonth: '',
            useFlag: 'N',
            remark: 'x',
            createBy: 'Batch',
            lateTime: '',
            lostTime: '',
            createDt: '',
        }
    else if (type == '2OT')
        return {
            txDetailSLId: '',
            txDetailTRId: '',
            pin: 'x',
            scheduleStartDt: '',
            scheduleEndDt: '',
            otStartDt: 'x',
            otEndDt: 'x',
            actualClockinDt: '',
            actualClockoutDt: '',
            recordType: 'x',
            shiftFlag: '',
            transportFlag: '',
            ot10: '0.00',
            ot15: '0.00',
            ot30: '0.00',
            workHour: '',
            recordDate: '',
            recordMonth: '',
            useFlag: 'N',
            remark: '',
            createBy: 'Batch',
            lateTime: '',
            lostTime: '',
            createDt: '',
        }
}


module.exports.processSummaryDetail = async (req, res) => {

    //let summaryCheck = await getInfoSummaryCheckModel();   // query record for summary detail 
    //summaryCheck.forEach(async infoSummary => {
    infoSummary = {
        trFlag: 'Y',
        slFlag: 'Y'
    }
    let employeeScheList = await mapData2Obj(infoSummary); // set data to obj by one record
    let listMstActivity = await getActivityInfo('ALL');


    let sumaryDetailObj = []   // array for insert to DB

    let isHolidayFlag = await isHoliday(false)
    console.log('employeeScheList length:', employeeScheList.length)
    console.log('employeeScheList:', employeeScheList)
    if (isTrue(infoSummary.slFlag) && !isTrue(infoSummary.trFlag)) {
        /* Case don’t have TR 
           such as case leave , case special Activity
        */

        /* keep groupType for Condition */
        let grupTypeSchedule = findGrupType(employeeScheList, listMstActivity);
        console.log('grupTypeSchedule:', grupTypeSchedule)

        let findIndexSpecial = grupTypeSchedule.findIndex(e => { return e == 'Special' })
        let findIndexWork = grupTypeSchedule.findIndex(e => { return e == 'Work' })
        let findIndexLeave = grupTypeSchedule.findIndex(e => { return e == 'Leave' })
        if (findIndexWork >= 0) {  // still update SL,TR
            return false
        }
        else if (findIndexLeave >= 0 && findIndexWork < 0) { //case leave all day 
            console.log('case Leave')
            let sumaryDetailObj = await setData2condLeave(obj.activitySL, true)
            let scheduleDate = moment(obj.scheduleDate).format('YYYY-MM-DD');
            sumaryDetailObj.recordDate = scheduleDate
            sumaryDetailObj.pin = isNotEmpty(employeeScheList.pin) ? employeeScheList.pin : ''
            sumaryDetailObj.txDetailSLId = isNotEmpty(employeeScheList.headerSL) ? employeeScheList.headerSL : ''
            saveData2DB(sumaryDetailObj)
        }
        else if (findIndexSpecial >= 0 && findIndexWork < 0) { // case special all day 
            console.log('Case Special activity All Day')
            let sumaryDetailObj = setData2condAllDaySpecial(obj.activitySL, obj.overlapTime)
            let scheduleDate = moment(employeeScheList.scheduleDate).format('YYYY-MM-DD');
            sumaryDetailObj.recordDate = scheduleDate
            sumaryDetailObj.pin = isNotEmpty(employeeScheList.pin) ? employeeScheList.pin : ''
            sumaryDetailObj.txDetailSLId = isNotEmpty(employeeScheList.headerSL) ? employeeScheList.headerSL : ''
            saveData2DB(sumaryDetailObj)
            // console.log('Case Special activity All Day record:', sumaryDetailObj)
        }


    } else if (!isTrue(infoSummary.slFlag) && !isTrue(infoSummary.trFlag)) { // case off

        if (isHolidayFlag) {
            /* dayOff == Holiday => AutoOT , one record by RecordType = 'AutoOT' */
            console.log('Auto OT')
            return setData2DB('AutoOT', '', setID(employeeScheList))
        } else {
            /* dayOff and !Holiday => OFF , one record by RecordType = 'AutoOT' */
            console.log('Day OFF')
            return setData2DB('OFF', '', setID(employeeScheList))
        }
    } else if (isTrue(infoSummary.slFlag) && isTrue(infoSummary.trFlag)) {

        /* keep groupType for Condition */
        let grupTypeSchedule = findGrupType(employeeScheList, listMstActivity);
        console.log('grupTypeSchedule:', grupTypeSchedule)

        employeeScheList.forEach(async obj => {
            /* Case have TR and SL */
            if (isNotEmpty(obj.activityTR) && isNotEmpty(obj.activitySL)) {
                obj.activityTR = mapTRbySLDaily(obj.activitySL, obj.activityTR);   // new Array TR by Schedule SL
                //let isLeave = await isLeaveActivity(obj.activitySL)
                let result = await processWithCond(obj.activitySL, obj.activityTR, obj.overlapTime, grupTypeSchedule, listMstActivity, setID(obj));  //return ot hour and record type  and hour and late 
                //let model = getNewObjbyType('ModelSummaryDetail');
                console.log('result:', result)
                // sumaryDetailObj.push(result)
                // res.status(200).send(sumaryDetailObj)
            }
        })
    }
    //})// getdata and map object to new format



    // txSummaryDetail.create(model);
    // if (!isEmptyArray(sumaryDetailObj)) {
    //     saveData2DB(sumaryDetailObj)
    // }

    console.log('after calculate')

    res.status(200).send('2313123')

}


async function processWithCond(listSL, listTR, overlapTime, grupTypeSchedule, listMstActivity, objID) {

    // sortTime(listSL, overlapTime);   //sort asc
    // sortTime(listTR, overlapTime);   //sort asc

    let cond = {
        isHoliday: await isHoliday(false), // call RDP return ture , false
        scheOT: 0,
        dayOff: false,
        work: false,
        compensate: false,
        isActSpecial: false,
        isLeave: await isLeaveActivity(listSL)
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

    let flagPaid = hasShiftOrTransport(listSL, listTR)    // คำนวนค่ากะ ค่ารถ return เป็น obj flag


    if (cond.isHoliday && cond.work) {
        /* Holiday+Schedule Work , one record by RecordType = 'OTCOM' */
        console.log('OT Compensate')
        if (cond.scheOT == 1 && cond.work) {      // spilt 3 case  Normal ,  Normal +OT , OT Before After 
            /* Schedule Normal + OT, one record by RecordType = 'ON' */
            return normalWithOTCond(listSL, listTR, listMstActivity, flagPaid, true, objID)
        } else if (cond.scheOT == 2 && cond.work) {
            /* Schedule duration 2 OT , three record by RecordType = 'ON' , 'OT ก่อน' , 'OT หลัง' */
            return duration2OT(listSL, listTR, listMstActivity, flagPaid, true, objID)
        } else if (cond.scheOT == 0 && cond.work) {
            /* ScheduleNormal , one record by RecordType = 'ON' */
            return normalCond(listSL, listTR, listMstActivity, flagPaid, true, objID)

        }
    }
    if (cond.scheOT == 1 && cond.work && !cond.isHoliday) {
        /* Schedule Normal + OT, one record by RecordType = 'ON' */
        return normalWithOTCond(listSL, listTR, listMstActivity, flagPaid, false, objID)
    }
    if (cond.scheOT == 2 && cond.work && !cond.isHoliday) {
        /* Schedule duration 2 OT , three record by RecordType = 'ON' , 'OT ก่อน' , 'OT หลัง' */
        return duration2OT(listSL, listTR, listMstActivity, flagPaid, false, objID)
    }
    if (cond.scheOT == 0 && cond.work && !cond.isHoliday) {
        /* ScheduleNormal , one record by RecordType = 'ON' */
        return normalCond(listSL, listTR, listMstActivity, flagPaid, false, objID)
    }
}


async function normalCond(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID) {
    /* ScheduleNormal , one record by RecordType = 'ON' */
    console.log('Normal Work')
    let schedule = await findScheduleStartEnd(listSL, 'normal')   // Schedule start - end 
    console.log('schedule:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity)// Actual clock in - out ,lost and late 
    console.log('actualClock:', actualClock)
    let objTime = getTimeLostOrlate(schedule, actualClock);

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


async function normalWithOTCond(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID) {

    console.log('Normal Overtime')
    let schedule = await findScheduleStartEnd(listSL, 'normal')   // Schedule start - end 
    console.log('schedule:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity) // Actual clock in - out ,lost and late 
    console.log('actualClock:', actualClock)

    let scheduleOT = await findScheduleStartEnd(listSL, 'ot')
    console.log('scheduleOT', scheduleOT)
    let actualClockOT = findActualClockOTFromTR(scheduleOT, listTR, listMstActivity, schedule)
    console.log('actualClockOT', actualClockOT)
    let tr = await splitActivityTRBySL(listSL, listTR, 'OT', listMstActivity, schedule, scheduleOT)
    console.log('arr TR:', tr.work.length)
    let objHour = normalWork(tr, listMstActivity, 'ot', actualClock)

    let objTime = getTimeLostOrlate(schedule, actualClock);  // get min - hour for case late or lost
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

async function duration2OT(listSL, listTR, listMstActivity, flagPaid, isOTCOM, objID) {
    console.log('OT Befor After')
    let schedule = await findScheduleStartEnd(listSL, 'normal') //ช่วงเวลาทำงานปกติของพนักงาน ตามไฟล์ SL
    console.log('schedule normal:', schedule)
    let actualClock = findActualClockFromTR(schedule, listTR, listMstActivity) // เวลาทำงานจริงๆของพนักงาน ตามไฟล์ SL
    console.log('actualClock normal:', actualClock)
    let scheduleOT = await findScheduleStartEnd(listSL, '2OT')
    console.log('schedule ot:', scheduleOT)
    let actualClockBefore = await findActualClockOTFromTR(scheduleOT.before, listTR, listMstActivity, schedule)
    console.log('actualClockBefore:', actualClockBefore)
    let actualClockAfter = await findActualClockOTFromTR(scheduleOT.after, listTR, listMstActivity, schedule)
    console.log('actualClockAfter:', actualClockAfter)
    let tr = await splitActivityTRBySL(listSL, listTR, '2OT', listMstActivity, schedule, scheduleOT)
    let objHour = beforeAfterOT(tr, listMstActivity, actualClock)


    objbyCond.schedule = schedule
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
function mapTRbySLDaily(listSL, listTR) {
    let listTRDaily = [];
    for (let i = 0; i < listSL.length; i++) {
        let momentActSLEnd = moment(listSL[i].end, format);// sl end
        let momentActSLStart = moment(listSL[i].start, format);// sl start
        //listMstActivity.forEach(e => {
        // if (checkActivityByGrup('Work', listMstActivity, listSL[i].activityName)
        //     || checkActivityByGrup('Meal', listMstActivity, listSL[i].activityName)) { //case work activity
        for (let j = 0; j < listTR.length; j++) {
            let momentActTREnd = moment(listTR[j].end, format);   // tr end
            let momentActTRStart = moment(listTR[j].start, format);  //tr start
            if (((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart)))
                || (momentActTRStart.isBefore(momentActSLStart) && (momentActTREnd.isAfter(momentActSLStart)))   // case activity momemnt overlap SL start  
                || (momentActTRStart.isBefore(momentActSLEnd) && momentActTREnd.isAfter(momentActSLEnd)) // case activity momemnt overlap SL end
            ) {
                //listAcivityTR.work.push(listTR[j])
                listTRDaily.push(listTR[j])
            }
        }
        //}
    }
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

function findActualClockFromTR(schedule, listTR, listMstActivity) {
    let actualClockObj = {
        start: '',
        end: '',
        lost: false,
        late: false
    }

    let scheduleStart = moment(schedule.start, format);
    let scheduleEnd = moment(schedule.end, format);

    let counter = 0;
    listTR.forEach(tr => {
        let timeRecordStart = moment(tr.start, format);
        let timeRecordEnd = moment(tr.end, format);
        listMstActivity.forEach(mstAct => {
            if (tr.activityName == mstAct.activityName && mstAct.groupType == 'Work') {
                if ((counter == 0) && scheduleStart.isBetween(timeRecordStart, timeRecordEnd)
                    || scheduleStart.isSame(timeRecordStart)
                    || scheduleStart.isSame(timeRecordEnd)) { //  sl is between tr
                    counter++

                    actualClockObj.start = tr.start
                    actualClockObj.end = tr.end
                    actualClockObj.late = false
                }
                else if ((counter == 0) && (scheduleStart.isBefore(timeRecordStart) || scheduleStart.isSame(timeRecordStart))) {//  sl is before tr
                    counter++
                    actualClockObj.start = tr.start
                    actualClockObj.end = tr.end
                    actualClockObj.late = true
                }
                else if ((counter > 0) && (scheduleEnd.isBetween(timeRecordStart, timeRecordEnd)
                    || scheduleEnd.isSame(timeRecordStart)
                    || scheduleEnd.isSame(timeRecordEnd))) {
                    // actualClockObj.start = tr.start
                    actualClockObj.end = tr.end
                    actualClockObj.lost = false
                } else if ((counter > 0) && (scheduleEnd.isAfter(timeRecordEnd))) {  //case lost
                    //actualClockObj.start = tr.start
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

function findActualClockOTFromTR(scheduleOT, listTR, listMstActivity, normalSchedule) {
    let actualClockObj = {
        start: '',
        end: '',
        // lost: false,
        // late: false
    }

    let arrCheckOverlapSchd = []
    let scheduleOTStart = moment(scheduleOT.start, format);
    let scheduleOTEnd = moment(scheduleOT.end, format);

    let counter = 0;
    listTR.forEach(tr => {
        let timeRecordStart = moment(tr.start, format);
        let timeRecordEnd = moment(tr.end, format);
        listMstActivity.forEach(mstAct => {
            if (tr.activityName == mstAct.activityName && mstAct.groupType == 'Work') {
                if ((counter == 0) && scheduleOTStart.isBetween(timeRecordStart, timeRecordEnd)
                    || scheduleOTStart.isSame(timeRecordStart)
                    || scheduleOTStart.isSame(timeRecordEnd)) { //  sl is between tr
                    counter++

                    actualClockObj.start = tr.start
                    // actualClockObj.late = false
                    arrCheckOverlapSchd.push(tr)

                }
                else if ((counter == 0) && (scheduleOTStart.isBefore(timeRecordStart) || scheduleOTStart.isSame(timeRecordStart))) {//  sl is before tr
                    counter++
                    actualClockObj.start = tr.start
                    //  actualClockObj.late = true
                    arrCheckOverlapSchd.push(tr)
                }
                else if ((counter > 0) && (scheduleOTEnd.isBetween(timeRecordStart, timeRecordEnd)
                    || scheduleOTEnd.isSame(timeRecordStart)
                    || scheduleOTEnd.isSame(timeRecordEnd))) {
                    actualClockObj.end = tr.end
                    //  actualClockObj.lost = false
                    arrCheckOverlapSchd.push(tr)
                } else if ((counter > 0) && (scheduleOTEnd.isAfter(timeRecordEnd))) {  //case lost
                    actualClockObj.end = tr.end
                    //  actualClockObj.lost = true
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


function isOTCompensate(listSL, listTR) {

    let record = {
        otStart: '',
        otEnd: '',
        hour: '',
    }

}

function setID(obj) {
    objID.pin = isNotEmpty(obj.pin) ? obj.pin : ''
    objID.txDetailSLId = isNotEmpty(obj.headerSL) ? obj.headerSL : ''
    objID.txDetailTRId = isNotEmpty(obj.headerTR) ? obj.headerTR : ''
    console.log('objID:', objID)
    log.debug(objID)
    return objID
}


getTimeLostOrlate = (schedule, actualClock) => {

    let time = {
        lost: '00:00:00',
        late: '00:00:00'
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

async function setData2condLeave(objSL, isAllDay) {
    let rec = recordType('LV')

    let start = true;
    KEYWORD.LEAVE.some(e => {
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

    let currentDate = moment(new Date()).format("YYYY-MM-DD")
    rec.createDt = currentDate
    rec.createBy = 'Batch'

    if (isAllDay) {
        rec.scheduleStartDt = objSL[0].start
        rec.scheduleEndDt = objSL[objSL.length - 1].end

        rec.remark = remark(rec.recordType, rec.scheduleStartDt, rec.scheduleEndDt)

    } else if (!isAllDay) {
        let lsitSLLeave = [];
        let listMstActivityLeave = await getActivityInfo('Leave');
        objSL.forEach(e => {
            if (checkActivityByGrup('Leave', listMstActivityLeave, e.activityName)) {
                lsitSLLeave.push(e)
            }
        })

        rec.remark = remark(rec.recordType, lsitSLLeave[0].start, lsitSLLeave[0].stop)
    }
    return rec
}


function setData2condAllDaySpecial(objSL, isOverlap) {
    console.log('setData2condAllDaySpecial')
    let rec = recordType('ON')
    let flagPaid = hasShiftOrTransport(objSL, objSL)
    rec.scheduleStartDt = objSL[0].start
    rec.scheduleEndDt = objSL[objSL.length - 1].end
    rec.shiftFlag = flagPaid.shift
    rec.transportFlag = flagPaid.transport
    rec.actualClockinDt = objSL[0].start
    rec.actualClockoutDt = objSL[objSL.length - 1].end
    return rec
}


function remark(word, start, end) {

    return word + '(' + start + '-' + end + ')';
}


isLeaveActivity = async (listSL) => {
    let isLeave = false
    let listMstActivityLeave = await getActivityInfo('Leave');
    listSL.some(e => {
        if (checkActivityByGrup('Leave', listMstActivityLeave, e.activityName)) {
            isLeave = true
            return true
        }
    })
    return isLeave
}

//call RDP 
isHoliday = (param) => {

    // param.start
    // param.end
    // paran.active

    return param
}


//call activityInfo
getActivityInfo = (param) => {
    if (param == 'ALL')
        return infoActivity.
            findAll({
                include: [{
                    all: true
                }], raw: true,
            })
    else {
        console.log('groupType:', param)
        return infoActivity.
            findAll({
                where: {
                    groupType: param
                },
                include: [{
                    all: true
                }], raw: true,
            })
    }
    //var nodedata = node.values;
    // .then((listAct) => { return listAct.dataValues })
    // .catch((error) => console.log(error))
}




function tooLate() {


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



function setData2DB(type, objbyCond, objID) {
    let rec = recordType(type)
    let modelSummaryDetail = [];
    rec.pin = objID.pin
    rec.txDetailSLId = objID.txDetailSLId
    rec.txDetailTRId = objID.txDetailTRId

    if (type == 'ON') {
        if (objbyCond.objHour.isPaid) {
            rec.ot15 = objbyCond.objHour.ot;
        }
        if (isNotEmpty(objbyCond.actualClockOT)) {
            if (isNotEmpty(objbyCond.actualClockOT.start) && isNotEmpty(objbyCond.actualClockOT.end)) {
                rec.otStartDt = objbyCond.actualClockOT.start
                rec.otEndDt = objbyCond.actualClockOT.end
            }
        }
        let currentDate = moment(new Date()).format("YYYY-MM-DD");
        rec.createDt = currentDate;
        rec.scheduleStartDt = objbyCond.schedule.start;
        rec.scheduleEndDt = objbyCond.schedule.end;
        if (isNotEmpty(objbyCond.actualClock)) {
            if (isNotEmpty(objbyCond.actualClock.start) && isNotEmpty(objbyCond.actualClock.end)) {
                rec.actualClockinDt = objbyCond.actualClock.start;
                rec.actualClockoutDt = objbyCond.actualClock.end;
            }
        }
        rec.lateTime = objbyCond.objTime.late
        rec.lostTime = objbyCond.objTime.lost

        rec.shiftFlag = objbyCond.flagPaid.shift
        rec.transportFlag = objbyCond.flagPaid.transport
        rec.ot30 = '0.00';
        rec.recordMonth = '';
        rec.remark = '';
        rec.createBy = 'Batch';
        modelSummaryDetail.push(rec)

        if (objbyCond.is2OT) {
            let beforeOT = recordType('2OT')
            let afterOT = recordType('2OT')
            if (isNotEmpty(objbyCond.actualClockOT.actualClockBefore)) {
                let otBefore = objbyCond.actualClockOT.actualClockBefore;
                if (isNotEmpty(otBefore.start) && isNotEmpty(otBefore.end)) {
                    beforeOT.otStartDt = otBefore.start
                    beforeOT.otEndDt = otBefore.end
                }
            }

            if (isNotEmpty(objbyCond.actualClockOT.actualClockAfter)) {
                let otAfter = objbyCond.actualClockOT.actualClockAfter;
                if (isNotEmpty(otAfter.start) && isNotEmpty(otAfter.end)) {
                    afterOT.otStartDt = otAfter.start
                    afterOT.otEndDt = otAfter.end
                }
            }

            if (objbyCond.objHour.isPaid) {
                beforeOT.ot30 = objbyCond.objHour.otBefore
                afterOT.ot30 = objbyCond.objHour.otAfter
            } else {
                beforeOT.ot15 = objbyCond.objHour.otBefore
                afterOT.ot15 = objbyCond.objHour.otAfter
            }

            modelSummaryDetail.push(beforeOT)
            modelSummaryDetail.push(afterOT)
        }
    }
    // else if (type == 'AutoOT') {
    //     rec.pin = objID.pin
    //     rec.txDetailSLId = objID.txDetailSLId
    //     rec.txDetailTRId = objID.txDetailTRId
    // }
    // else if (type == 'OFF') {
    //     rec.pin = objID.pin
    //     rec.txDetailSLId = objID.txDetailSLId
    //     rec.txDetailTRId = objID.txDetailTRId

    // }
    else if (type == 'OTCOM') {
        //  if (objbyCond.objHour.isPaid) {

        // }
        if (isNotEmpty(objbyCond.actualClockOT)) {
            if (isNotEmpty(objbyCond.actualClockOT.start) && isNotEmpty(objbyCond.actualClockOT.end)) {
                rec.otStartDt = objbyCond.actualClockOT.start
                rec.otEndDt = objbyCond.actualClockOT.end
            }
        }
        let currentDate = moment(new Date()).format("YYYY-MM-DD");
        rec.createDt = currentDate;
        rec.scheduleStartDt = objbyCond.schedule.start;
        rec.scheduleEndDt = objbyCond.schedule.end;
        if (isNotEmpty(objbyCond.actualClock)) {
            if (isNotEmpty(objbyCond.actualClock.start) && isNotEmpty(objbyCond.actualClock.end)) {
                rec.actualClockinDt = objbyCond.actualClock.start;
                rec.actualClockoutDt = objbyCond.actualClock.end;
            }
        }
        rec.lateTime = objbyCond.objTime.late
        rec.lostTime = objbyCond.objTime.lost

        rec.shiftFlag = objbyCond.flagPaid.shift
        rec.transportFlag = objbyCond.flagPaid.transport
        rec.ot10 = '8:00';  // defualt 8 hour , standard work
        rec.ot15 = '0.00';
        rec.ot30 = objbyCond.objHour.ot;
        rec.recordMonth = '';
        rec.remark = '';
        rec.createBy = 'Batch';
        modelSummaryDetail.push(rec)
        if (objbyCond.is2OT) {
            let beforeOT = recordType('2OT')
            let afterOT = recordType('2OT')
            actualClockBefore
            if (isNotEmpty(objbyCond.actualClockOT.actualClockBefore)) {
                let otBefore = objbyCond.actualClockOT.actualClockBefore;
                if (isNotEmpty(otBefore.start) && isNotEmpty(otBefore.end)) {
                    beforeOT.otStartDt = otBefore.start
                    beforeOT.otEndDt = otBefore.end
                }
            }

            if (isNotEmpty(objbyCond.actualClockOT.actualClockAfter)) {
                let otAfter = objbyCond.actualClockOT.actualClockAfter;
                if (isNotEmpty(otAfter.start) && isNotEmpty(otAfter.end)) {
                    afterOT.otStartDt = otAfter.start
                    afterOT.otEndDt = otAfter.end
                }
            }

            modelSummaryDetail.push(beforeOT)
            modelSummaryDetail.push(afterOT)
        }
    }
    let pass = false
    modelSummaryDetail.every(e => {
        if (validatePass(e)) {
            pass = true
            console.log('validatePass:', validatePass)
        } else {
            return false
        }
    })
    try {
        if (pass) {
            console.log('rec:', rec)
            // saveData2DB(rec)
        }
    }
    catch (e) {
        log.error(e)
    }

}


function saveData2DB(modelSummaryDetail) {

    // txSummaryDetail.create(modelSummaryDetail)
    //     .then(todo => res.status(200).send(todo))
    //     .catch(error => res.status(400).send(error));

    txSummaryDetail.bulkCreate(modelSummaryDetail, { validate: true })
        .then(todo => res.status(200).send(todo))
        .catch(error => res.status(400).send(error));
}

async function mapData2Obj(summaryCheck) {
    let employeeScheList = []
    let mapTR = new Map();
    try {
        const listTR = await getTRDetailModel(summaryCheck);
        //log.debug(listTR)
        //console.log('listTR:', listTR.length)
        // console.log('listTR:', listTR)
        const listSL = await getSLDetailModel(summaryCheck)
        //log.debug(listSL)
        //console.log('listSL:', listSL.length)
        // console.log('listSL:', listSL)
        if (!isEmptyArray(listTR)) {
            for (let tr of listTR) {
                if (isNotEmpty(tr.ssn) && !isNotEmpty(mapTR.get(tr.ssn))) { //new ssn
                    let listEmployeeTR = getNewObjbyType('InitObjTRMap')
                    listEmployeeTR.pin = tr.ssn
                    listEmployeeTR.headerTR = tr.headerId
                    listEmployeeTR.organizeName = tr.organizeName
                    listEmployeeTR.employeeName = tr.agentName
                    listEmployeeTR.activity.push({ start: tr.startDt, end: tr.stopDt, activityName: tr.activity })
                    mapTR.set(listEmployeeTR.pin, listEmployeeTR);  // change obj to map 
                } else if (isNotEmpty(tr.ssn) && isNotEmpty(mapTR.get(tr.ssn))) {
                    let tempMap = mapTR.get(tr.ssn);
                    tempMap.activity.push({ start: tr.startDt, end: tr.stopDt, activityName: tr.activity })
                    mapTR.set(tr.ssn, tempMap);
                }
            }//1152
            console.log('mapTR:', mapTR.size)  //select ssn from tx_tr_detail where ssn is not null group by ssn order by ssn asc for check
        } else {
            console.log('empty TR detail')
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
                    let execDate = moment(sl.execDate, "YYYY-MM-DD")
                    let scheduleDate = moment(sl.scheduleDate, "YYYY-MM-DD")
                    // console.log("overlap:" + execDate.isSame(scheduleDate))
                    list.overlapTime = execDate.isSame(scheduleDate) ? false : true

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
            console.log('employeeScheList:', employeeScheList.length) // expect 1880
        }
        else {
            console.log('empty SL detail')
        }
    } catch (e) {
        console.log('error:', e.error)
    }

    return employeeScheList

}

const getSLDetailModel = (rec) => {
    return objSL
    let yesterday = moment(rec.recordDt).format('YYYY-MM-DD');
    let dayBeforeYesterday = moment().subtract(2, 'days').format('YYYY-MM-DD');
    return txSlDetail.findAll({
        where: {
            scheduleDate: yesterday,
            // scheduleDate: dayBeforeYesterday,
            headerId: rec.slHeaderId,
            ssn: rec.pin,

            // ssn: '32327'
        },
        //        limit: 2,
        // include: [{
        //     all: true   // จะ query ตาม associate ที่เกี่ยวข้องขึ้นมาด้วย 
        // }]
        // , raw: false   // จะ query raw  value ตาม database ซึ่งจะไม่ทำ function get ที่ config ไว้ทีตัว model 
    }).then((todos) => { return nodeData = todos.map((node) => node.get({ plain: true })); console.log(node) })
        .catch((error) => { console.log(error) });


}

const getTRDetailModel = (rec) => {
    return objTR
    let yesterday = moment(rec.recordDt).format('YYYY-MM-DD');
    let dayBeforeYesterday = moment(rec.recordDt).subtract(2, 'days').format('YYYY-MM-DD');
    return txTrDetail.findAll({
        where: {
            // scheduleDate: rec.recordDt,
            // scheduleDate: dayBeforeYesterday,
            [Op.or]: [{ scheduleDate: yesterday }, { scheduleDate: dayBeforeYesterday }],
            headerId: rec.trHeaderId,
            ssn: rec.pin,
            //headerId: '1081',
            //ssn: '32327'
        }
    }).then((todos) => { return nodeData = todos.map((node) => node.get({ plain: true })); })
        .catch((error) => { console.log(error) });

}

const getInfoSummaryCheckModel = () => {

    let yesterday = moment('2017-11-12').subtract(1, 'days').format('YYYY-MM-DD');
    let dayBeforeYesterday = moment().subtract(2, 'days').format('YYYY-MM-DD');
    return infoSummaryCheck.findAll({
        attributes: ['pin', 'recordDt', 'slFlag', 'trFlag', 'slHeaderId', 'trHeaderId', 'genSumStartDt', 'genSumEndDt'],
        where: {
            genSumFlag: 'N',
            recordDt: yesterday,
            // recordDt: {
            //     [Op.lte]: yesterday
            // },
        },
        limit: 1,
    }).then((todos) => { return nodeData = todos.map((node) => node.get({ plain: true })); })
        .catch((error) => { console.log(error) });
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
        log.debug("pin is Empty")
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
        log.debug("recordType is Empty")
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
        log.debug("recordDate is Empty")
        return false
    } else {
        record.recordDate = moment(record.recordDate).format("YYYY-MM-DD")
    }
    // if (record.recordMonth) {

    // }
    // if (record.remark) {

    // }
    if (!isNotEmpty(record.useFlag)) {
        log.debug("useFlag is Empty")
        return false
    }
    if (!isNotEmpty(record.createBy)) {
        log.debug("createBy is Empty")
        return false
    }
    if (record.createDt) {
        log.debug("createDt is Empty")
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


function hasShiftOrTransport(listSL, listTR) {

    let flagPaid = { shift: false, transport: false }
    let hasSchedule = checkSchedule(listSL)
    let isPaid = checkTimeRecord(listTR)
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




function checkSchedule(listActivitySL) {
    // listActivitySL.sort(function (a, b) {
    //     return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    // });

    return isBetweenCondTime(listActivitySL[0].start, listActivitySL[listActivitySL.length - 1].end)          //schedule start time


}

function checkTimeRecord(listTimerecord) {
    // listTimerecord.sort(function (a, b) {
    //     return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    // });
    return isBetweenCondTime(listTimerecord[0].start, listTimerecord[listTimerecord.length - 1].end)          //time record start or clock-in

}

function isBetweenCondTime(clockInTime, clockOutTime) { // clockin for check  between condition time

    let isPaid = {
        shift: false,
        transport: false
    }

    let time = moment(clockInTime, format)
    // configuration 
    let startShiftTime = moment(shiftStart, format),
        endShiftTime = moment(shiftEnd, format)

    // check working 8 hour
    if (time.isAfter(startShiftTime) || time.isBefore(endShiftTime)) {
        console.log('is between Shift')
        if (checkStandardWorkTime(clockInTime, clockOutTime)) {
            isPaid.shift = true
        }
    }

    let startTransportTime = moment(transportStart, format),
        endTransportTime = moment(transportEnd, format)

    //if (time.isAfter(startTransportTime) && time.isBefore(endTransportTime)) {
    if (time.isBetween(startTransportTime, endTransportTime) || time.isSame(startTransportTime) || time.isBetween(endTransportTime)) {
        console.log('is between Transport')
        if (checkStandardWorkTime(clockInTime, clockOutTime)) {
            isPaid.transport = true
        }

    }


    return isPaid

}

//จะเหลือ case กรณี overlap กัน
function checkStandardWorkTime(clockInTime, clockOutTime) {

    console.log(clockInTime)
    console.log(clockOutTime)
    //var clockInNextDay = moment('16:00:00', format)

    let workTime = moment(clockInTime, format).add(standardWorkTime, 'hours');
    let clockOut = moment(clockOutTime, format)

    // if(moment(clockInTime, format).isSame(clockInNextDay)||moment(clockInTime, format).isAfter(clockInNextDay)){
    //     // let xxx = moment('2018-03-04 22:00:00', "YYYY-MM-DD"+format).add(1, 'days');
    //     let xxx = moment('2018-03-04 22:00:00',+format).add(1, 'days');
    // }
    if (workTime.isSame(clockOut) || workTime.isBefore(clockOut)) {
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


// function getHour(start, end) {
//     let result = 0;
//     //let formatHour = 'HH:mm';
//     let startTime = moment(start, formatHour);
//     let endTime = moment(end, formatHour);
//     let minutesDiff = Math.abs(parseInt(endTime.diff(startTime, 'minutes')));
//     console.log('minutesDiff:', minutesDiff)
//     if (minutesDiff >= 60) {
//         let hour = Math.floor(minutesDiff / 60);
//         let minutes = parseInt(minutesDiff) - (parseInt(60) * parseInt(hour))
//         result = hour.pad() + ':' + minutes.pad();
//     } else {
//         result = minutesDiff
//     }

//     console.log('result:' + result)

// }

Object.prototype.isEmptyObject = function () {
    return Object.keys(Object(this)).length === 0 ? true : false
}


//obj SL for one record

let ObjSLtrain = [
    { tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '08:00', stopDt: '09:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '09:00', stopDt: '13:00' },
    { tvid: '1048', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '13:00', stopDt: '14:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '14:00', stopDt: '18:00' },
    { tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '18:00', stopDt: '19:00' },
]
let objSL = [
    //{ tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '08:00', stopDt: '09:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '09:00', stopDt: '13:00' },
    { tvid: '1048', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '13:00', stopDt: '14:00' },
    // { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '07:00', stopDt: '07:20' },
    // { tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '08:00', stopDt: '08:20' },
    //{ tvid: '1048', ssn: '31049', activity: 'Business Leave', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '14:00', stopDt: '15:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '15:00', stopDt: '18:00' },
    //
    { tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '18:00', stopDt: '19:00' },
    // { tvid: '1048', ssn: '31049', activity: 'Training', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '19:00', stopDt: '19:28' }
]
31377

let testSL = [
    //{ tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '08:00', stopDt: '09:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '20:00', stopDt: '00:00' },
    { tvid: '1048', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '00:00', stopDt: '01:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '01:00', stopDt: '04:00' },
    // { tvid: '1048', ssn: '31049', activity: 'Overtime_AnswerCall', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '08:00', stopDt: '08:20' },
]

let testTR = [
    { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '07:59', stopDt: '08:36' },
    { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '08:36', stopDt: '08:37' },
    { modify: '1510365756', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '08:37', stopDt: '09:01' },
    { modify: '1510366077', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:01', stopDt: '09:03' },
    { modify: '1510366077', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:03', stopDt: '09:05' },
    { modify: '1510366705', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:05', stopDt: '09:15' },
    { modify: '1510366705', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:15', stopDt: '09:16' },
    { modify: '1510367334', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Rest Room', startDt: '09:16', stopDt: '09:28' },
    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:28', stopDt: '09:38' },
    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '09:38', stopDt: '09:39' },
    { modify: '1510368277', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:39', stopDt: '09:42' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '09:42', stopDt: '09:45' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:45', stopDt: '09:49' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:49', stopDt: '09:52' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '09:52', stopDt: '09:54' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:54', stopDt: '09:55' },

    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '19:38', stopDt: '19:39' },
    { modify: '1510368277', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '19:39', stopDt: '19:42' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '19:42', stopDt: '20:45' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '20:45', stopDt: '00:49' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '00:49', stopDt: '03:52' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:52', stopDt: '04:54' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:54', stopDt: '07:55' }
]

let objTR = [
    // { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '01:36', stopDt: '01:37' },
    // { modify: '1510365756', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:58', stopDt: '01:01' },
    { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '07:59', stopDt: '08:36' },
    { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '08:36', stopDt: '08:37' },
    { modify: '1510365756', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '08:37', stopDt: '09:01' },
    { modify: '1510366077', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:01', stopDt: '09:03' },
    { modify: '1510366077', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:03', stopDt: '09:05' },
    { modify: '1510366705', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:05', stopDt: '09:15' },
    { modify: '1510366705', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:15', stopDt: '09:16' },
    { modify: '1510367334', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Rest Room', startDt: '09:16', stopDt: '09:28' },
    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:28', stopDt: '09:38' },
    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '09:38', stopDt: '09:39' },
    { modify: '1510368277', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:39', stopDt: '09:42' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '09:42', stopDt: '09:45' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:45', stopDt: '09:49' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:49', stopDt: '09:52' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '09:52', stopDt: '09:54' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '09:54', stopDt: '09:55' },
    { modify: '1510369550', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '09:55', stopDt: '10:02' },
    { modify: '1510369550', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:02', stopDt: '10:03' },
    { modify: '1510369550', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:03', stopDt: '10:05' },
    { modify: '1510369869', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:05', stopDt: '10:06' },
    { modify: '1510369869', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:06', stopDt: '10:11' },
    { modify: '1510370192', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '10:11', stopDt: '10:12' },
    { modify: '1510370192', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:12', stopDt: '10:13' },
    { modify: '1510370192', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:13', stopDt: '10:14' },
    { modify: '1510370510', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:14', stopDt: '10:17' },
    { modify: '1510370510', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:17', stopDt: '10:19' },
    { modify: '1510370827', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:19', stopDt: '10:24' },
    { modify: '1510370827', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '10:24', stopDt: '10:26' },
    { modify: '1510371145', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:26', stopDt: '10:28' },
    { modify: '1510371145', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '10:28', stopDt: '10:30' },
    { modify: '1510371145', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:30', stopDt: '10:31' },
    { modify: '1510371465', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:31', stopDt: '10:35' },
    { modify: '1510371465', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:35', stopDt: '10:36' },
    { modify: '1510372097', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:36', stopDt: '10:44' },
    { modify: '1510372097', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '10:44', stopDt: '10:46' },
    { modify: '1510372097', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:46', stopDt: '10:48' },
    { modify: '1510372416', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '10:48', stopDt: '10:49' },
    { modify: '1510372416', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:49', stopDt: '10:52' },
    { modify: '1510372416', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '10:52', stopDt: '10:53' },
    { modify: '1510372736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:53', stopDt: '10:57' },
    { modify: '1510372736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '10:57', stopDt: '10:58' },
    { modify: '1510373700', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '10:58', stopDt: '11:12' },
    { modify: '1510373700', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '11:12', stopDt: '11:14' },
    { modify: '1510374017', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:14', stopDt: '11:15' },
    { modify: '1510374017', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:15', stopDt: '11:17' },
    { modify: '1510374017', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:17', stopDt: '11:19' },
    { modify: '1510374335', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:19', stopDt: '11:22' },
    { modify: '1510374335', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:22', stopDt: '11:24' },
    { modify: '1510374653', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:24', stopDt: '11:29' },
    { modify: '1510374653', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:29', stopDt: '11:30' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '11:30', stopDt: '11:31' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:31', stopDt: '11:34' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:34', stopDt: '11:35' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '11:35', stopDt: '11:36' },
    { modify: '1510375607', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:36', stopDt: '11:42' },
    { modify: '1510375607', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '11:42', stopDt: '11:43' },
    { modify: '1510375607', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:43', stopDt: '11:46' },
    { modify: '1510375924', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:46', stopDt: '11:49' },
    { modify: '1510375924', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '11:49', stopDt: '11:52' },
    { modify: '1510376242', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '11:52', stopDt: '11:54' },
    { modify: '1510376561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '11:54', stopDt: '12:00' },
    { modify: '1510376561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '12:00', stopDt: '12:02' },
    { modify: '1510376881', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:02', stopDt: '12:06' },
    { modify: '1510376881', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:06', stopDt: '12:07' },
    { modify: '1510377199', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '12:07', stopDt: '12:08' },
    { modify: '1510377199', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:08', stopDt: '12:13' },
    { modify: '1510377516', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:13', stopDt: '12:15' },
    { modify: '1510377832', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:15', stopDt: '12:22' },
    { modify: '1510378149', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '12:22', stopDt: '12:25' },
    { modify: '1510378149', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:25', stopDt: '12:29' },
    { modify: '1510378466', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:29', stopDt: '12:30' },
    { modify: '1510378782', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:30', stopDt: '12:35' },
    { modify: '1510378782', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:35', stopDt: '12:37' },
    { modify: '1510378782', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '12:37', stopDt: '12:38' },
    { modify: '1510379099', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:38', stopDt: '12:40' },
    { modify: '1510379099', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:40', stopDt: '12:42' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:42', stopDt: '12:45' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:45', stopDt: '12:47' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:47', stopDt: '12:49' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:49', stopDt: '12:50' },
    { modify: '1510379736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:50', stopDt: '12:52' },
    { modify: '1510379736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:52', stopDt: '12:54' },
    { modify: '1510380056', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '12:54', stopDt: '12:56' },
    { modify: '1510380056', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '12:56', stopDt: '12:58' },
    { modify: '1510380380', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '12:58', stopDt: '13:02' },
    { modify: '1510380380', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '13:02', stopDt: '13:03' },
    { modify: '1510383922', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '14:00', stopDt: '14:02' },
    { modify: '1510383922', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:02', stopDt: '14:04' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:04', stopDt: '14:06' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:06', stopDt: '14:07' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:07', stopDt: '14:09' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '14:09', stopDt: '14:10' },
    { modify: '1510384561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:10', stopDt: '14:12' },
    { modify: '1510384561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:12', stopDt: '14:13' },
    { modify: '1510384561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:13', stopDt: '14:15' },
    { modify: '1510384885', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '14:15', stopDt: '14:17' },
    { modify: '1510384885', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:17', stopDt: '14:20' },
    { modify: '1510384885', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:20', stopDt: '14:21' },
    { modify: '1510385207', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:21', stopDt: '14:26' },
    { modify: '1510385531', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:26', stopDt: '14:27' },
    { modify: '1510385531', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:27', stopDt: '14:29' },
    { modify: '1510385531', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:29', stopDt: '14:30' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:30', stopDt: '14:34' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '14:34', stopDt: '14:35' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:35', stopDt: '14:36' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:36', stopDt: '14:37' },
    { modify: '1510386179', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:37', stopDt: '14:40' },
    { modify: '1510386179', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:40', stopDt: '14:42' },
    { modify: '1510386501', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:42', stopDt: '14:43' },
    { modify: '1510386501', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:43', stopDt: '14:46' },
    { modify: '1510386834', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:46', stopDt: '14:51' },
    { modify: '1510386834', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:51', stopDt: '14:52' },
    { modify: '1510386834', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '14:52', stopDt: '14:53' },
    { modify: '1510387160', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:53', stopDt: '14:56' },
    { modify: '1510387160', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '14:56', stopDt: '14:58' },
    { modify: '1510387160', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '14:58', stopDt: '14:59' },
    { modify: '1510387485', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '14:59', stopDt: '15:04' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:04', stopDt: '15:10' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:10', stopDt: '15:11' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Outbound', startDt: '15:11', stopDt: '15:12' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '15:12', stopDt: '15:13' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:13', stopDt: '15:14' },
    { modify: '1510388446', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:14', stopDt: '15:17' },
    { modify: '1510388446', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '15:17', stopDt: '15:18' },
    { modify: '1510388766', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:18', stopDt: '15:21' },
    { modify: '1510388766', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:21', stopDt: '15:23' },
    { modify: '1510389088', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:23', stopDt: '15:28' },
    { modify: '1510389088', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:28', stopDt: '15:30' },
    { modify: '1510389088', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '15:30', stopDt: '15:31' },
    { modify: '1510389409', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:31', stopDt: '15:32' },
    { modify: '1510389409', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '15:32', stopDt: '15:33' },
    { modify: '1510389409', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:33', stopDt: '15:36' },
    { modify: '1510389732', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:36', stopDt: '15:38' },
    { modify: '1510390053', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:38', stopDt: '15:47' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '15:47', stopDt: '15:48' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:48', stopDt: '15:49' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '15:49', stopDt: '15:50' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '15:50', stopDt: '15:51' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '15:51', stopDt: '15:52' },
    { modify: '1510390695', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '15:52', stopDt: '15:55' },
    { modify: '1510391030', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Rest Room', startDt: '15:55', stopDt: '16:01' },
    { modify: '1510391030', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:01', stopDt: '16:02' },
    { modify: '1510391030', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '16:02', stopDt: '16:03' },
    { modify: '1510391343', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:03', stopDt: '16:05' },
    { modify: '1510391663', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:05', stopDt: '16:09' },
    { modify: '1510391663', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:09', stopDt: '16:12' },
    { modify: '1510391663', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '16:12', stopDt: '16:13' },
    { modify: '1510391983', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:13', stopDt: '16:15' },
    { modify: '1510391983', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '16:15', stopDt: '16:16' },
    { modify: '1510391983', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '16:16', stopDt: '16:17' },
    { modify: '1510392620', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:17', stopDt: '16:26' },
    { modify: '1510392620', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:26', stopDt: '16:27' },
    { modify: '1510392939', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:27', stopDt: '16:32' },
    { modify: '1510393258', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:32', stopDt: '16:36' },
    { modify: '1510393576', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:36', stopDt: '16:42' },
    { modify: '1510393576', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:42', stopDt: '16:44' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:44', stopDt: '16:47' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:47', stopDt: '16:49' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '16:49', stopDt: '16:50' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:50', stopDt: '16:51' },
    { modify: '1510394217', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:51', stopDt: '16:53' },
    { modify: '1510394537', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '16:53', stopDt: '16:58' },
    { modify: '1510394537', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '16:58', stopDt: '16:59' },
    { modify: '1510394537', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '16:59', stopDt: '17:01' },
    { modify: '1510394858', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:01', stopDt: '17:03' },
    { modify: '1510394858', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:03', stopDt: '17:05' },
    { modify: '1510394858', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:05', stopDt: '17:07' },
    { modify: '1510395180', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:07', stopDt: '17:09' },
    { modify: '1510395180', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:09', stopDt: '17:10' },
    { modify: '1510395180', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '17:10', stopDt: '17:11' },
    { modify: '1510395499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:11', stopDt: '17:15' },
    { modify: '1510395499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '17:15', stopDt: '17:16' },
    { modify: '1510396134', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:16', stopDt: '17:26' },
    { modify: '1510396134', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:26', stopDt: '17:27' },
    { modify: '1510396134', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '17:27', stopDt: '17:28' },
    { modify: '1510397080', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:28', stopDt: '17:42' },
    { modify: '1510397080', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '17:42', stopDt: '17:44' },
    { modify: '1510397396', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:44', stopDt: '17:47' },
    { modify: '1510397396', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:47', stopDt: '17:48' },
    { modify: '1510397713', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:48', stopDt: '17:53' },


    { modify: '1510397713', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:53', stopDt: '17:54' },
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '17:54', stopDt: '17:57' },
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:57', stopDt: '17:58' },
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '17:58', stopDt: '17:59' },
    { modify: '1510398345', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '17:59', stopDt: '18:02' },
    //  { modify: '1510398661', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '18:02', stopDt: '18:08' },
    { modify: '1510398661', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '18:02', stopDt: '18:50' },
    { modify: '1510398661', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '18:50', stopDt: '19:50' },
]

