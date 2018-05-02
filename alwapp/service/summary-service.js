const moment = require('moment');
const infoActivity = require('../models').InfoActivity
const txSlDetail = require('../models').TxSlDetail
const txTrDetail = require('../models').TxTrDetail
const txSummaryDetail = require('../models').TxSummaryDetail

const condShiftTime = '13:00:00|06:30:00'
const shiftStart = condShiftTime.split('|')[0]
const shiftEnd = condShiftTime.split('|')[1]

const condTransportTime = '14:00:00|20:00:00'
const transportStart = condTransportTime.split('|')[0]
const transportEnd = condTransportTime.split('|')[1]

const format = 'HH:mm:ss'
const standardWorkTime = 8;

const OT = { OT_1: 1, OT1_5: 1.5, OT_3: 3 }


//ON คือมาทำงานปกติ 
//OFF คือวันหยุด 
//Business Leave(BL)
//Vacation Leave(VL)
//BirthDay Leave(BD)
//Compensate Leave(CL)
//Sick Leave(SL)
const attandace = { ot: 'OT', otCom: 'OTCom', autoOT: 'AutoOT' }
const work = { on: 'ON', off: 'OFF' }
const leave = { bl: 'BL', vl: 'VL', bd: 'BD', cl: 'CL', sl: 'SL' }


let recordType = (type) => {
    if (type == 'on')
        return {
            txDetailSlId: '',
            txDetailTrId: '',
            pin: '',
            scheduleStartDt: 'x',
            scheduleEndDt: 'x',
            otStartDt: '',
            otEndDt: '',
            actualClockinDt: 'x',
            actualClockoutDt: 'x',
            recordType: 'On',
            shiftFlag: '',
            transportFlag: '',
            ot10: '0.00',
            ot15: '0.00',
            ot30: '0.00',
            recordDate: '',
            recordMonth: '',
            remark: '',
            createBy: '',
            createDt: '',
        }
    else if (type == 'off')
        return {
            recordType: 'OFF',
            schedule_start: '',
            schedule_end: '',
            clockin: '',
            clockout: '',
            ot_start: '',
            ot_end: '',
            ot_1: '0.00',
            ot_1_5: '0.00',
            ot_3: '0.00',
            hour: '',
            remark: 'OFF'
        }
    else if (type == 'lv')
        return {
            txDetailSlId: '',
            txDetailTrId: '',
            pin: '',
            scheduleStartDt: 'x',
            scheduleEndDt: 'x',
            otStartDt: '',
            otEndDt: '',
            actualClockinDt: '',
            actualClockoutDt: '',
            recordType: '',
            shiftFlag: '',
            transportFlag: '',
            ot10: '0.00',
            ot15: '0.00',
            ot30: '0.00',
            recordDate: '',
            recordMonth: '',
            remark: 'VL(start-end)',
            createBy: '',
            createDt: '',
        }
}


module.exports.processSummaryDetail = async (req, res) => {

    await mapData2Obj(req, res)    // getdata and map object to new format

    employeeScheList.forEach(async obj => {
        let sumaryDetailObj = []   // array for insert to DB
        let grupTypeSchedule = [];
        let listMstActivity = await getActivityInfo('ALL');
        for (let sl of obj.activitySL) {   //หา group type จาก SL เก็บใน Array
            for (let mstAct of listMstActivity) {
                if (sl.activityName.toUpperCase() === mstAct.activityName.toUpperCase()) {
                    grupTypeSchedule.push(mstAct.groupType)   // get grouptype of day
                    break
                }
            }
        }

        console.log('group activity:' + grupTypeSchedule)

        if (isNotEmpty(obj.activityTR)) {
            let result = await processWithCond(obj.activitySL, obj.activityTR, obj.overlapTime, grupTypeSchedule, listMstActivity);  //return ot hour and record type  and hour and late 
            let model = getNewObjbyType('ModelSummaryDetail');
            model.pin = obj.pin
            model.scheduleStartDt = obj.activitySL.shift.start
            model.scheduleEndDt = obj.activitySL.pop.end
            let flagPaid = hasShiftOrTransport(obj.activitySL, obj.activityTR)
            console.log('shift flag:' + flagPaid.shift)
            console.log('transport flag:' + flagPaid.transport)
            model.shiftFlag = flagPaid.shift//convertData2MstParam(flagPaid.shift, 'Shift')
            model.transportFlag = flagPaid.transport
            model.createBy = 'batch'
        } else { //case leave
            if (isNotEmpty(obj.activitySL)) {
                let listMstActivityLeave = await getActivityInfo('Leave');
                obj.activitySL.forEach(activityLeave => {
                    listMstActivityLeave.forEach(mstLeave => {
                        if (mstLeave.activity == activityLeave.activity) {
                            let rec = recordType('lv')
                            rec.pin = obj.pin
                            rec.scheduleStartDt = obj.activitySL.shift.start
                            rec.scheduleEndDt = obj.activitySL.pop.end
                            let leaveType = activityLeave.activity.split(' ')[0].substr(0, 1) + activityLeave.activity.split(' ')[1].substr(0, 1)
                            rec.recordType = leaveType
                            rec.remark = leaveType + '(' + obj.activitySL.shift.start + '-' + obj.activitySL.pop.end + ')'
                            let scheduleDate = moment(obj.scheduleDate).format('YYYY-MM-DD');
                            rec.recordDate = scheduleDate
                            let currentDate = moment(new Date()).format("YYYY-MM-DD")
                            rec.createDt = currentDate
                            rec.createBy = 'Batch'
                            sumaryDetailObj.push(rec)
                        }
                    })
                })
            }
        }
    })

    // txSummaryDetail.create(model);

    res.status(200).send('xxx')
}


async function processWithCond(objSL, objTR, overlapTime, grupTypeSchedule, listMstActivity) {

    //sortTime(objSL.activity, overlapTime);   //sort asc
    //sortTime(objTR.activity, overlapTime);   //sort asc

    let cond = {
        isHoliday: await isHoliday(false), // call RDP return ture , false
        scheOT: 0,
        dayOff: false,
        work: false,
        compensate: false
    }
    console.log('cond.isHoliday:' + cond.isHoliday)
    grupTypeSchedule.forEach(e => {
        if (e == 'OT') {   //group ของ Activity SL มา Checkว่า เข้าเงื่อนไขตรงไหน
            cond.scheOT++
        }
        if (e == 'OFF') {
            cond.dayOff = true
        }
        if (e === 'Work') {
            cond.work = true
        }
        if (e === 'Compensate') {
            cond.compensate = true
        }

    })
    console.log('cond:', cond)
    let matchAct = checkActivityFromActGroup(objSL, objTR, grupTypeSchedule, listMstActivity, cond)



}



function condOT(flagSL, flagTR, schedule, holiday, isDayOff) {
    let isPaid = flagSL && flagTR;
    let objRec = {};
    if (isPaid && !holiday) {  //วันธรรมดาและทำ OT *1.5 , มีsl ot,มีtr ทำงาน  
        // schedule.
        //     schedule.

    } else if (isPaid && holiday) {      //เป็นวันหยุดและมาทำงาน OT *1.5 , มีsl ot,มีtr ทำงาน  ot com 

    }
    else if (isPaid && isDayOff) {     //auto ot คือ วัน off ไปตรงกับวันหยุดนักขัต


    }

    return objRec

}


function buildMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
}






function checkLeave(obj) {  //

    vl = {
        recordType: 'VL',
        schedule_start: 'x',
        schedule_end: 'x',
        clockin: '',
        clockout: '',
        ot_start: '',
        ot_end: '',
        ot_1: '0.00',
        ot_1_5: '0.00',
        ot_3: '0.00',
        hour: '0.00',
        remark: 'VL(start-end)'
    }

}

//นำ TR มา Check เพื่อ Confirm ว่าตรงกับ SL 
function checkActivityFromActGroup(listSL, listTR, grupTypeSchedule, listMstActivity, cond) {     // parameter one object listSL {} , listTR{}

    let error = {
        errActivity: [],
        errGrupAct: []
    };
    // check Activity ตามช่วงเวลาของ SL
    for (let i = 0; i < listSL.length; i++) {
        let momentActSLEnd = moment(listSL[i].end, format);// sl end
        let momentActSLStart = moment(listSL[i].start, format);// sl start
        let activityList = []
        for (let actTRTime of listTR) {
            let momentActTREnd = moment(actTRTime.end, format);   // tr end
            let momentActTRStart = moment(actTRTime.start, format);  //tr start
            if ((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd))
                && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart))) {
                activityList.push(actTRTime)
            }
        }
        for (let actList of activityList) { // list ของ TR ตามช่วงเวลาที่มีใน SL 
            //  console.log('listTR:',actList)
            let notFound = true;
            for (let mstAct of listMstActivity) {
                if (actList.activityName.toUpperCase() == mstAct.activityName.toUpperCase()) {
                    notFound = false;
                    if (!(mstAct.groupType == grupTypeSchedule[i])) { // ถ้า activity ไม่ตรงตาม group act ที่ SL
                        console.log('Group Type for unmatch Activity [us]:', grupTypeSchedule[i])
                        console.log('Group Type for unmatch Activity [mst]:', mstAct.groupType)
                        if (!(grupTypeSchedule[i] == 'Meal' && mstAct.groupType == 'Work')) {
                            error.errGrupAct.push(actList)
                        }
                    }
                }
            }
            if (notFound) {   // กรณีที่ไม่เจอ Activity ใน mst activity
                error.errActivity.push(actList)
            }
        }
    }
    console.log("error:", error)

    if (isEmptyArray(error.errActivity) && isEmptyArray(error.errGrupAct)) {
        //all activity are match 
        let rec = {};

        if (cond.isHoliday && cond.work) { //เป็นวันหยุด แต่มี sl มาทำงาน
            //ot com 
            isOTCompensate(listSL, listTR)
        }
        if (cond.scheOT == 2 && !cond.work) {  //เป็นวันหยุด และตรงกับนักขัติฤกษ์
            //auto ot 
            isAutoOT(listSL, listTR)
            //เข้า case นี้ recordType จะมี record เดียว
        }
        if (cond.scheOT == 1 && cond.work) {
            let index = findIndexSLByCond(listSL, 'Normal')
            rec = isNormalOvertime(listSL[index], listTR)
            //เข้า case นี้ recordType จะมี record เดียว
        }
        if (cond.scheOT == 2 && cond.work) {
            isOverTimeBeforeAfter(listSL, listTR)
        }
        if (cond.scheOT == 0 && cond.work && !cond.isHoliday) {
            return normalWork(listSL, listTR)

        }

        if (!(rec.isEmptyObject())) {

        }

    }

    else {
        //some activity record fail


    }

}

function normalWork(listSL, listTR) {

    console.log('Normal Work')
    let rec = recordType('on')
    // let scheduleDate = moment(obj.scheduleDate).format('YYYY-MM-DD');
    // rec.recordDate = scheduleDate;
    let currentDate = moment(new Date()).format("YYYY-MM-DD");
    rec.createDt = currentDate;
    rec.scheduleStartDt = listSL.shift().start;
    rec.scheduleEndDt = listSL.pop().end;
    rec.actualClockinDt = listTR.shift().start;
    rec.actualClockoutDt = listTR.pop().end;
    rec.recordType = 'On';
    rec.ot10 = '0.00';
    rec.ot15 = '0.00';
    rec.ot30 = '0.00';
    rec.recordMonth = '';
    rec.remark = '';
    rec.createBy = 'Batch';

    console.log('record Type :on=',rec)
    return rec;



}


function findIndexSLByCond(listSL, cond) {
    let index = [];
    for (let i = 0; i < listSL.length; i++) {
        if (cond === 'Normal') { // 1 round
            // let listMstActivity = await getActivityInfo('OT');
            listMstActivity.forEach(act => {
                if (listSL[i].activity_name.toUpperCase() === act.activity_name.toUpperCase()) {
                    return index.push(i)
                }
            })

        } if (cond === 'MoreOT') {// 2 round
            // let listMstActivity = await getActivityInfo('OT');
            listMstActivity.forEach(act => {
                if (listSL[i].activity_name.toUpperCase() === act.activity_name.toUpperCase()) {
                    index.push(i)
                }
            })

        } if (cond === 'Speacial') {
            //let listMstActivity = await getActivityInfo('S');
            listMstActivity.forEach(act => {
                if (listSL[i].activity_name.toUpperCase() === act.activity_name.toUpperCase()) {
                    index.push(i)
                }
            })

        }
    }

    return index // case ot before, ot after

}


function isOTCompensate(listSL, listTR) {

    let record = {
        otStart: '',
        otEnd: '',
        hour: '',
    }

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

// คือมี OT แค่ช่วงเวลาเดียว 
function isNormalOvertime(listSL, listTR) {

    let record = {
        otStart: '',
        otEnd: '',
        hour: '',
    }
    let actSLEndTime = moment(listSL.end, format);// sl end
    let actSLStartTime = moment(listSL.start, format);// sl start
    let activityList = []
    for (let list of listTR) {
        let momentActTREnd = moment(list.end, format);   // tr end
        let momentActTRStart = moment(list.start, format);  //tr start
        if ((momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd))
            && (momentActSLStart.isSame(momentActTRStart) || momentActTRStart.isAfter(momentActSLStart))) {
            activityList.push(list)
        }
    }
    if (!isEmptyArray(activityList)) {
        record.otStart = activityList[0].start
        record.otStart = activityList[0].end
        let startTime = moment(activityList.shift().start, "HH:mm:ss");
        let endTime = moment(activityList.pop().end, "HH:mm:ss");
        let duration = moment.duration(endTime.diff(startTime));
        let hours = Math.abs(parseInt(duration.get('hours')));
        let minutes = Math.abs(parseInt(duration.get('minutes')));
        let second = Math.abs(parseInt(duration.get('seconds')));
        //console.log(hours + ' hour and ' + minutes + ' minutes.' + second);
        record.hour = hours.pad() + ':' + minutes.pad() + ':' + second.pad()
        console.log('record normal OT', record);
    }
    return record

}

function isOverTimeBeforeAfter() {



}


function isLeave() {



}


//call RDP 
isHoliday = async (param) => {

    // param.start
    // param.end
    // paran.active

    return await param
}


//call activityInfo
getActivityInfo = async (param) => {
    console.log('groupType:', param)
    if (param == 'ALL')
        return await infoActivity.
            findAll({
                include: [{
                    all: true
                }], raw: true,
            })
    else {
        return await infoActivity.
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




function toLate() {


}




function sortTime(list, overlap) {
    let xxx = moment('2018-03-04 22:00:00', "YYYY-MM-DD" + format).add(1, 'days');
    if (overlap) {

    } else {
        list.sort(function (a, b) {
            return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
        });
    }
}





function saveData2DB(rec, recordType) {


    modelSummaryDetail = {
        txDetailSlId: '',
        txDetailTrId: '',
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
    if (recordType == '1') {
        txSummaryDetail.create(modelSummaryDetail);
    }

}

async function mapData2Obj(req, res) {

    //resetMstObjTRSL();   //reset old data if exist
    employeeScheList = []
    const listTR = await getTRDetail();
    console.log('listTR:', listTR.length)
    const listSL = await getSLDetail()
    console.log('listSL:', listSL.length)
    if (!isEmptyArray(listTR)) {
        for (let tr of listTR) {
            if (isNotEmpty(tr.ssn) && !isNotEmpty(mapTR.get(tr.ssn))) { //new ssn
                let listEmployeeTR = getNewObjbyType('InitObjTRMap')
                listEmployeeTR.pin = tr.ssn
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
                list.scheduleDate = sl.scheduleDate
                //check overlap
                let execDate = moment(sl.execDate, "YYYY-MM-DD" + format)
                let scheduleDate = moment(sl.scheduleDate, "YYYY-MM-DD" + format)
                console.log("overlap:" + execDate.isSame(scheduleDate))
                list.overlapTime = !execDate.isSame(scheduleDate)

                list.activitySL.push({ start: sl.startDt, end: sl.stopDt, activityName: sl.activity })
                list.activityTR = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).activity : '';
                list.organizeName = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).organizeName : '';
                list.employeeName = isNotEmpty(mapTR.get(sl.ssn)) ? mapTR.get(sl.ssn).employeeName : '';
                employeeScheList.push(list)   // mst obj SL,TR
            } else {
                let indexExistPin = employeeScheList.findIndex(e => { return e.pin == sl.ssn })
                console.log('indexExistPin:', indexExistPin)
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
    //  mapTR = null // reset data in map 
    console.log(employeeScheList)



}

const getSLDetail = (date) => {
    // return txSlDetail.findAll({
    //     // where: {
    //     //     recordDate: date
    //     // },
    //     include: [{
    //         all: true
    //     }], raw: true
    // })

    return objSL

}

const getTRDetail = (date) => {
    // return txTrDetail.findAll({
    //     // where: {
    //     //     recordDate: date
    //     // },
    //     include: [{
    //         all: true
    //     }], raw: true
    // })

    return objTR
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
            activitySL: [],
            activityTR: []
        }
    } else if (type === 'InitObjTRMap') {
        return {
            pin: '',
            organizeName: '',
            employeeName: '',
            // tz: '',
            activity: []
        }
    } else if (type === 'ModelSummaryDetail') {


        return {
            txDetailSlId: '',
            txDetailTrId: '',
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


let employeeScheList = [
    // {
    //     pin: '31138',
    //     tz: 'Asia/Bangkok',
    //     work_date: '2017-12-06',
    //     organize: '',
    //     employee_name: 'Phumas, Phanumas CRM_Out',
    //     activitySL: [
    //         { start: '09:00', end: '13:00', activity_name: 'Answer calls' },
    //         { start: '13:00', end: '14:00', activity_name: 'Meal' },
    //         { start: '14:00', end: '16:00', activity_name: 'Answer Calls' },
    //         { start: '16:00', end: '16:30', activity_name: 'Assigned Other' },
    //         { start: '16:30', end: '18:00', activity_name: 'Answer Calls' }
    //     ],
    //     activityTR: [
    //         { activity_name: 'Not Ready', start: '08:47', end: '08:48' },
    //         { activity_name: 'Briefing', start: '08:48', end: '08:51' },
    //         { activity_name: 'Answer Calls', start: '08:51', end: '08:57' },
    //         { activity_name: 'Follow Case', start: '08:57', end: '09:04' },
    //         { activity_name: 'ACW', start: '09:04', end: '09:08' },
    //         { activity_name: 'Follow Case', start: '09:08', end: '09:10' },
    //         { activity_name: 'Answer Calls', start: '09:10', end: '09:14' },
    //         { activity_name: 'Follow Case', start: '09:14', end: '09:18' },
    //         { activity_name: 'Available', start: '09:18', end: '09:21' },
    //         { activity_name: 'Answer Calls', start: '09:21', end: '09:25' },
    //         { activity_name: 'Follow Case', start: '09:25', end: '09:31' },
    //         { activity_name: 'Answer Calls', start: '09:31', end: '09:32' },
    //         { activity_name: 'ACW', start: '09:32', end: '09:34' },
    //         { activity_name: 'Available', start: '09:34', end: '09:35' },
    //         { activity_name: 'Answer Calls', start: '09:35', end: '09:38' },
    //         { activity_name: 'Follow Case', start: '09:38', end: '09:46' },
    //     ]
    // }
]


let mapTR = new Map();


//check ช่วงเวลาของแต่ละ SL ไปเช็ค activity ของ TR ตามช่วงเวลาของ SL ว่าตรงตามหรือไม่
//ถ้าเจอ activity ใน SL แต่ไม่เจอใน TR ให้ไปเช็ค Activity พิเศษถ้าพบ ให้ลงเป็นเวลาทำงานแทน
//check วันที่ทำงาน ว่าเป็น วันหยุด นักขัตฤกษ์หรือไม่ ถ้ามีวันหยุดแล้วมาทำงาน จะได้ OT Com จะเข้าเงื่อนไข OT COM


//ค่ากะและค่ารถ check จากไฟล์ SL ว่ามีเวลาเข้างานอยู่ในช่วงเวลาดังกล่าวไหม 
//ถ้าไม่มีก็ตัดทิ้ง ถ้ามีไป  check ไฟล์ TR และ clockin out ตามลำดับว่าครบ8 ชม ไหม

function spiltData(data, symbol) {


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
    if (list.length == 0 || list == null) {
        return true
    }
    return false
}

Object.prototype.isEmptyObject = function () {
    return Object.keys(Object(this)).length === 0 ? true : false
}


//obj SL for one record
let objSL = [
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '09:00', stopDt: '13:00' },
    { tvid: '1048', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '13:00', stopDt: '14:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '14:00', stopDt: '18:00' }
]


let objTR = [
    { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '08:36', stopDt: '08:37' },
    { modify: '1510365756', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '08:58', stopDt: '09:01' },
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
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '17:58', stopDt: '18:00' },
    { modify: '1510398345', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '18:00', stopDt: '18:02' },
    { modify: '1510398661', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '18:02', stopDt: '18:08' },
]

