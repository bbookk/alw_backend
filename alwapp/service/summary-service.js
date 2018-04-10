
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

// #Type TSP = Transport  , SH = Shift

module.exports.processSummaryDetail = async (req, res) => {


    // console.log(await getTRDetail())

    //mapData2Obj()    // getdata and map object to new format
    // for(let sl in objSL){

    // }
    // processWorkTime(objSL, objTR);

}


async function processWorkTime(objSL, objTR) {

    sortTime(objSL.activity);
    sortTime(objTR.activity);

    let cond = {
        ot: true,
        holiday: true,
    }

    let grupTypeSchedule = [];
    let listMstActivity = await getActivityInfo();

    for (let sl of objSL.activity) {   //หา group type จาก SL เก็บใน Array
        for (let mstAct of listMstActivity) {
            if (sl.activity_name.toUpperCase() === mstAct.activityName.toUpperCase()) {
                grupTypeSchedule.push(mstAct.groupType)   // get grouptype of day
                break
            }
        }
    }

    console.log(grupTypeSchedule)

    for (let listSl in listSl) { }

    let matchAct = checkActivityFromActGroup(grupTypeSchedule, listMstActivity)



    let recordType = checkCond();

    if (recordType.Normal) {

    } else if (recordType.OTCom) {

    } else if (recordType.AutoOT) {

    }



    let scheduleStart = objSL.activity[0].start;
    let scheduleEnd = objSL.activity[objSL.activity.length - 1].end;

    let actualStart = objTR.activity[0].start;
    let actualEnd = objTR.activity[objTR.activity.length - 1].end;
    let date = objSL.work_date;

    modelSummaryDetail = {
        txDetailSlId: '',
        txDetailTrId: '',
        pin: objSl.pin,
        scheduleStartDt: scheduleStart,
        scheduleEndDt: scheduleEnd,
        otStartDt: '',
        otEndDt: '',
        actualClockinDt: actualStart,
        actualClockoutDt: actualEnd,
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

function buildMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
}

function isNotEmpty(str) {
    if (str == null || str == undefined || str == '') {
        return false
    }
    return true
}


function checkCond() {

    let recordType = {
        Normal: false,
        OTCom: false,
        AutoOT: false
    }


    if (true) { //ไม่มี schedule OT &&ไม่มี AutoOT && ไม่มี SL,TR มาทำงานในวันหยุด &&มีSL,TR ปกติ

    } else if (true) { //มาทำงานในวันหยุด

    }
    else if (true) {//หยุดในวันหยุดนักขัตฤกษ์

    }

    return true
}


function checkActivityFromActGroup(listSL, listTR, grupTypeSchedule, listMstActivity) {     // parameter one object listSL {} , listTR{}

    let activity = {
        errActivity: [],
        errGrupAct: []
    };
    // check Activity ตามช่วงเวลาของ SL
    for (let i = 0; i < listSL.activity.length; i++) {
        let momentActSLEnd = moment(listSL.activity[i].end, format);
        let activityList = []
        for (let actTRTime of listTR.activity) {
            let momentActTREnd = moment(actTRTime.end, format);
            if (momentActSLEnd.isSame(momentActTREnd) || momentActTREnd.isBefore(momentActSLEnd)) {
                activityList.push(actTRTime)
            }
        }
        for (let actList of activityList) { // list ของ TR ตามช่วงเวลาที่มีใน SL 
            let notFound = true;
            for (let mstAct of listMstActivity) {
                if (actList.activity_name.toUpperCase() === mstAct.activityName.toUpperCase()) {
                    notFound = false;
                    if (!(mstAct.groupType == grupTypeSchedule[i]) || (grupTypeSchedule[i] == 'M')) { // ถ้า activity ไม่ตรงตาม group act ที่ SL
                        activity.errGrupAct.push(actList)
                    }
                }
            }
            if (notFound) {   // กรณีที่ไม่เจอ Activity ใน mst activity
                activity.errActivity.push(actList)
            }
        }
    }
    console.log(activity)
    return activity;
}

function standardSchedule(rec) {

    let rec = saveData2DB(rec)
    console.log('success')
    console.log(rec)

}

function isOTCompensate() {


}


function isAutoOT() {



}

//call RDP 
isHoliday = async (param, res) => {
    if ('get') {
        return true
    }
    return false
}


//call activityInfo
getActivityInfo = async (param, re) => {
    return await infoActivity.
        findAll({
            include: [{
                all: true
            }], raw: true,
        })
    //var nodedata = node.values;
    // .then((listAct) => { return listAct.dataValues })
    // .catch((error) => console.log(error))
}




function toLate() {


}


function backBeforeSchedule() {

}


function sortTime(list) {
    list.sort(function (a, b) {
        return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    });
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


function mapData2Obj() {

    resetMstObjTRSL();   //reset old data if exist

    if (isNotEmpty(getSLDetail)) {
        for (let i = 0; i < getSLDetail.length; i++) {
            let listEmployeeSL = getObjSL()
            listEmployeeSL.pin = getSLDetail[0].pin
            listEmployeeSL.tz = getSLDetail[0].timeZone
            listEmployeeSL.work_date = getSLDetail[0].scheduleDate
            for (let sl in getSLDetail) {
                listEmployeeSL.activity.push({ start: sl.startDt, end: sl.stopDt, activity_name: sl.activity })
            }
            objSL.push(listEmployeeSL)
        }

    } else {
        console.log('empty SL detail')
    }
    if (isNotEmpty(getTRDetail)) {
        for (let i = 0; i < getTRDetail.length; i++) {
            let listEmployeeTR = getObjTR()
            listEmployeeTR.pin = getTRDetail[0].pin
            listEmployeeTR.tz = getTRDetail[0].timeZone
            listEmployeeTR.work_date = getTRDetail[0].scheduleDate
            listEmployeeTR.organize = getTRDetail[0].organizeName
            listEmployeeTR.employee_name = getTRDetail[0].agentName
            for (let tr in getTRDetail) {
                listEmployeeTR.activity.push({ start: tr.startDt, end: tr.stopDt, activity_name: tr.activity })
            }
            objTR.push(listEmployeeTR)
        }
    } else {
        console.log('empty TR detail')
    }
}


const getSLDetail = () => {
    return txSlDetail.findAll({
        where: {
            recordDate: ''
        },
        include: [{
            all: true
        }], raw: true
    })

}

function getObjTR() {
    return {
        pin: '',
        organize: '',
        employee_name: '',
        work_date: '',
        tz: '',
        activity: []
    }
}

function getObjSL() {
    return {
        pin: '',
        tz: '',
        work_date: '',
        activity: []
    }
}


const getTRDetail = () => {
    return txTrDetail.findAll({
        // where: {
        //     recordDate: ''
        // },
        include: [{
            all: true
        }], raw: true
    })
}

function resetMstObjTRSL() {

    objSL = [{
        pin: '',
        tz: '',
        work_date: '',
        activity: []
    }]
    objTR = [{
        pin: '',
        organize: '',
        employee_name: '',
        work_date: '',
        tz: '',
        activity: []
    }]
}


//obj SL for one record
let objSL = [{
    pin: '31138',
    tz: 'Asia/Bangkok',
    work_date: '2017-12-06',
    activity: [
        { start: '09:00', end: '13:00', activity_name: 'Answer calls' },
        { start: '13:00', end: '14:00', activity_name: 'Meal' },
        { start: '14:00', end: '16:00', activity_name: 'Answer Calls' },
        { start: '16:00', end: '16:30', activity_name: 'Assigned Other' },
        { start: '16:30', end: '18:00', activity_name: 'Answer Calls' }
    ]
}]
let objTR = [{
    pin: '31138',
    organize: '',
    employee_name: 'Phumas, Phanumas CRM_Out',
    work_date: '2017-12-06',
    tz: 'Asia/Bangkok',
    activity: [
        { activity_name: 'Not Ready', start: '08:47', end: '08:48' },
        { activity_name: 'Briefing', start: '08:48', end: '08:51' },
        { activity_name: 'Answer Calls', start: '08:51', end: '08:57' },
        { activity_name: 'Follow Case', start: '08:57', end: '09:04' },
        { activity_name: 'ACW', start: '09:04', end: '09:08' },
        { activity_name: 'Follow Case', start: '09:08', end: '09:10' },
        { activity_name: 'Answer Calls', start: '09:10', end: '09:14' },
        { activity_name: 'Follow Case', start: '09:14', end: '09:18' },
        { activity_name: 'Available', start: '09:18', end: '09:21' },
        { activity_name: 'Answer Calls', start: '09:21', end: '09:25' },
        { activity_name: 'Follow Case', start: '09:25', end: '09:31' },
        { activity_name: 'Answer Calls', start: '09:31', end: '09:32' },
        { activity_name: 'ACW', start: '09:32', end: '09:34' },
        { activity_name: 'Available', start: '09:34', end: '09:35' },
        { activity_name: 'Answer Calls', start: '09:35', end: '09:38' },
        { activity_name: 'Follow Case', start: '09:38', end: '09:46' },
        { activity_name: 'Rest Room', start: '09:46', end: '09:48' },
        { activity_name: 'Outbound', start: '09:48', end: '09:49' },
        { activity_name: 'Answer Calls', start: '09:49', end: '09:50' },
        { activity_name: 'Follow Case', start: '09:50', end: '09:51' },
        { activity_name: 'Answer Calls', start: '09:51', end: '09:56' },
        { activity_name: 'Answer Calls', start: '10:40', end: '10:44' },
        { activity_name: 'Follow Case', start: '10:44', end: '10:47' },
        { activity_name: 'Available', start: '10:47', end: '10:48' },
        { activity_name: 'Answer Calls', start: '10:48', end: '10:55' },
        { activity_name: 'Follow Case', start: '10:55', end: '10:56' },
        { activity_name: 'Answer Calls', start: '10:56', end: '11:00' },
        { activity_name: 'ACW', start: '11:00', end: '11:01' },
        { activity_name: 'Available', start: '11:30', end: '11:32' },
        { activity_name: 'Not Ready', start: '11:32', end: '11:34' },
        { activity_name: 'Answer Calls', start: '11:34', end: '11:35' },
        { activity_name: 'Available', start: '11:35', end: '11:36' },
        { activity_name: 'Answer Calls', start: '11:36', end: '11:37' },
        { activity_name: 'Available', start: '11:37', end: '11:38' },
        { activity_name: 'Answer Calls', start: '11:38', end: '11:39' },
        { activity_name: 'Available', start: '11:39', end: '11:41' },
        { activity_name: 'Answer Calls', start: '11:41', end: '11:42' },
        { activity_name: 'Not Ready', start: '11:42', end: '11:43' },
        { activity_name: 'Available', start: '11:44', end: '11:45' },
        { activity_name: 'Not Ready', start: '11:45', end: '11:46' },
        { activity_name: 'Answer Calls', start: '11:46', end: '11:47' },
        { activity_name: 'Not Ready', start: '11:47', end: '11:48' },
        { activity_name: 'Available', start: '11:48', end: '11:49' },
        { activity_name: 'Answer Calls', start: '11:49', end: '11:58' },
        { activity_name: 'Not Ready', start: '11:58', end: '12:03' },
        { activity_name: 'Available', start: '12:03', end: '12:04' },
        { activity_name: 'Answer Calls', start: '12:04', end: '12:08' },
        { activity_name: 'Not Ready', start: '12:08', end: '12:09' },
        { activity_name: 'Answer Calls', start: '12:09', end: '12:12' },
        { activity_name: 'Not Ready', start: '12:12', end: '12:13' },
        { activity_name: 'Available', start: '12:13', end: '12:14' },
        { activity_name: 'Answer Calls', start: '12:14', end: '12:18' },
        { activity_name: 'Available', start: '12:18', end: '12:19' },
        { activity_name: 'Answer Calls', start: '12:19', end: '12:23' },
        { activity_name: 'Not Ready', start: '12:23', end: '12:24' },
        { activity_name: 'Available', start: '12:24', end: '12:25' },
        { activity_name: 'Answer Calls', start: '12:25', end: '12:32' },
        { activity_name: 'Available', start: '12:32', end: '12:33' },
        { activity_name: 'Answer Calls', start: '12:33', end: '12:37' },
        { activity_name: 'Not Ready', start: '12:37', end: '12:38' },
        { activity_name: 'Available', start: '12:38', end: '12:39' },
        { activity_name: 'Answer Calls', start: '12:39', end: '12:42' },
        { activity_name: 'Not Ready', start: '12:42', end: '12:43' },
        { activity_name: 'Available', start: '12:43', end: '12:44' },
        { activity_name: 'Answer Calls', start: '12:44', end: '12:50' },
        { activity_name: 'Not Ready', start: '12:50', end: '12:52' },
        { activity_name: 'Available', start: '12:52', end: '12:53' },
        { activity_name: 'Answer Calls', start: '12:53', end: '12:55' },
        { activity_name: 'Not Ready', start: '12:55', end: '13:01' },
        { activity_name: 'Other', start: '13:52', end: '13:53' },
        { activity_name: 'Not Ready', start: '13:53', end: '13:54' },
        { activity_name: 'Available', start: '13:54', end: '13:56' },
        { activity_name: 'Answer Calls', start: '13:56', end: '14:01' },
        { activity_name: 'Available', start: '14:01', end: '14:03' },
        { activity_name: 'Answer Calls', start: '14:03', end: '14:09' },
        { activity_name: 'Not Ready', start: '14:09', end: '14:10' },
        { activity_name: 'Answer Calls', start: '14:10', end: '14:11' },
        { activity_name: 'Available', start: '14:11', end: '14:12' },
        { activity_name: 'Answer Calls', start: '14:12', end: '14:16' },
        { activity_name: 'Not Ready', start: '14:16', end: '14:17' },
        { activity_name: 'Available', start: '14:17', end: '14:18' },
        { activity_name: 'Answer Calls', start: '14:18', end: '14:25' },
        { activity_name: 'Not Ready', start: '14:25', end: '14:26' },
        { activity_name: 'Available', start: '14:26', end: '14:27' },
        { activity_name: 'Answer Calls', start: '14:27', end: '14:30' },
        { activity_name: 'Not Ready', start: '14:30', end: '14:31' },
        { activity_name: 'Answer Calls', start: '14:31', end: '14:47' },
        { activity_name: 'Not Ready', start: '14:47', end: '14:48' },
        { activity_name: 'Other', start: '14:48', end: '14:49' },
        { activity_name: 'Answer Calls', start: '14:49', end: '14:53' },
        { activity_name: 'Available', start: '14:53', end: '14:55' },
        { activity_name: 'Not Ready', start: '14:55', end: '14:56' },
        { activity_name: 'Available', start: '14:56', end: '14:57' },
        { activity_name: 'Answer Calls', start: '14:57', end: '14:59' },
        { activity_name: 'Not Ready', start: '14:59', end: '15:00' },
        { activity_name: 'Available', start: '15:00', end: '15:02' },
        { activity_name: 'Answer Calls', start: '15:02', end: '15:04' },
        { activity_name: 'Available', start: '15:04', end: '15:05' },
        { activity_name: 'Answer Calls', start: '15:05', end: '15:06' },
        { activity_name: 'Available', start: '15:06', end: '15:07' },
        { activity_name: 'Answer Calls', start: '15:07', end: '15:11' },
        { activity_name: 'Available', start: '15:11', end: '15:12' },
        { activity_name: 'Answer Calls', start: '15:12', end: '15:16' },
        { activity_name: 'Available', start: '15:16', end: '15:17' },
        { activity_name: 'Answer Calls', start: '15:17', end: '15:20' },
        { activity_name: 'Available', start: '15:20', end: '15:21' },
        { activity_name: 'Answer Calls', start: '15:21', end: '15:25' },
        { activity_name: 'Not Ready', start: '15:25', end: '15:26' },
        { activity_name: 'Answer Calls', start: '15:26', end: '15:30' },
        { activity_name: 'Not Ready', start: '15:30', end: '15:32' },
        { activity_name: 'Available', start: '15:32', end: '15:33' },
        { activity_name: 'Answer Calls', start: '15:33', end: '15:34' },
        { activity_name: 'Available', start: '15:34', end: '15:35' },
        { activity_name: 'Answer Calls', start: '15:35', end: '15:37' },
        { activity_name: 'Not Ready', start: '15:37', end: '15:38' },
        { activity_name: 'Answer Calls', start: '15:38', end: '15:41' },
        { activity_name: 'Not Ready', start: '15:41', end: '15:42' },
        { activity_name: 'Available', start: '15:42', end: '15:43' },
        { activity_name: 'Answer Calls', start: '15:43', end: '15:54' },
        { activity_name: 'Available', start: '15:54', end: '15:56' },
        { activity_name: 'Answer Calls', start: '15:56', end: '16:00' },
        { activity_name: 'Not Ready', start: '16:00', end: '16:01' },
        { activity_name: 'Answer Calls', start: '16:01', end: '16:06' },
        { activity_name: 'Not Ready', start: '16:06', end: '16:09' },
        { activity_name: 'Other', start: '16:09', end: '16:10' },
        { activity_name: 'Not Ready', start: '16:10', end: '16:13' },
        { activity_name: 'Answer Calls', start: '16:13', end: '16:14' },
        { activity_name: 'Not Ready', start: '16:14', end: '16:15' },
        { activity_name: 'Outbound', start: '16:41', end: '16:42' },
        { activity_name: 'Available', start: '16:42', end: '16:43' },
        { activity_name: 'Answer Calls', start: '16:43', end: '16:49' },
        { activity_name: 'Not Ready', start: '16:49', end: '16:50' },
        { activity_name: 'Available', start: '16:50', end: '16:51' },
        { activity_name: 'Answer Calls', start: '16:51', end: '16:55' },
        { activity_name: 'Available', start: '16:55', end: '16:56' },
        { activity_name: 'Answer Calls', start: '16:56', end: '17:03' },
        { activity_name: 'Not Ready', start: '17:03', end: '17:04' },
        { activity_name: 'Other', start: '17:06', end: '17:07' },
        { activity_name: 'Not Ready', start: '17:07', end: '17:09' },
        { activity_name: 'Other', start: '17:09', end: '17:10' },
        { activity_name: 'Not Ready', start: '17:10', end: '17:12' },
        { activity_name: 'Answer Calls', start: '17:12', end: '17:17' },
        { activity_name: 'Not Ready', start: '17:17', end: '17:18' },
        { activity_name: 'Available', start: '17:19', end: '17:21' },
        { activity_name: 'Answer Calls', start: '17:21', end: '17:25' },
        { activity_name: 'Not Ready', start: '17:25', end: '17:27' },
        { activity_name: 'ACW', start: '17:27', end: '17:28' },
        { activity_name: 'Not Ready', start: '17:28', end: '17:29' },
        { activity_name: 'Available', start: '17:29', end: '17:30' },
        { activity_name: 'Answer Calls', start: '17:30', end: '17:34' },
        { activity_name: 'Not Ready', start: '17:34', end: '17:35' },
        { activity_name: 'Available', start: '17:35', end: '17:37' },
        { activity_name: 'Answer Calls', start: '17:37', end: '17:41' },
        { activity_name: 'Not Ready', start: '17:41', end: '17:45' },
        { activity_name: 'Available', start: '17:45', end: '17:46' },
        { activity_name: 'Answer Calls', start: '17:46', end: '17:53' },
        { activity_name: 'Not Ready', start: '17:53', end: '17:56' },
        { activity_name: 'Answer Calls', start: '17:56', end: '17:57' },
        { activity_name: 'Not Ready', start: '17:57', end: '17:58' },
        { activity_name: 'Available', start: '17:58', end: '17:59' },
        { activity_name: 'Answer Calls', start: '17:59', end: '18:04' },
        { activity_name: 'Available', start: '18:04', end: '18:05' },
        { activity_name: 'Answer Calls', start: '18:05', end: '18:10' },
        { activity_name: 'Not Ready', start: '18:10', end: '18:11' },
        { activity_name: 'Answer Calls', start: '18:11', end: '18:12' },
        { activity_name: 'Available', start: '18:12', end: '18:13' },
        { activity_name: 'Answer Calls', start: '18:13', end: '18:14' },
        { activity_name: 'Available', start: '18:14', end: '18:17' },
        { activity_name: 'Answer Calls', start: '18:17', end: '18:22' },
        { activity_name: 'Not Ready', start: '18:22', end: '18:23' },
        { activity_name: 'Other', start: '18:23', end: '21:04' },
    ]

}]

//check ช่วงเวลาของแต่ละ SL ไปเช็ค activity ของ TR ตามช่วงเวลาของ SL ว่าตรงตามหรือไม่
//ถ้าเจอ activity ใน SL แต่ไม่เจอใน TR ให้ไปเช็ค Activity พิเศษถ้าพบ ให้ลงเป็นเวลาทำงานแทน
//check วันที่ทำงาน ว่าเป็น วันหยุด นักขัตฤกษ์หรือไม่ ถ้ามีวันหยุดแล้วมาทำงาน จะได้ OT Com จะเข้าเงื่อนไข OT COM


//ค่ากะและค่ารถ check จากไฟล์ SL ว่ามีเวลาเข้างานอยู่ในช่วงเวลาดังกล่าวไหม 
//ถ้าไม่มีก็ตัดทิ้ง ถ้ามีไป  check ไฟล์ TR และ clockin out ตามลำดับว่าครบ8 ชม ไหม

function spiltData(data, symbol) {


}


function hasShiftOrTransport(objSL, objTR) {

    let flagPaid = { shift: false, transport: false }
    let hasSchedule = checkSchedule(objSL)
    let isPaid = checkTimeRecord(objTR)
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
    listActivitySL.sort(function (a, b) {
        return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    });

    return isBetweenCondTime(listActivitySL[0].start, listTimerecord[listTimerecord.length - 1].end)          //schedule start time


}

function checkTimeRecord(listTimerecord) {
    listTimerecord.sort(function (a, b) {
        return Date.parse('1970/01/01 ' + a.start.slice(0, -2) + ' ' + a.start.slice(-2)) - Date.parse('1970/01/01 ' + b.start.slice(0, -2) + ' ' + b.start.slice(-2))
    });
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
    if (time.isAfter(startTransportTime) || time.isBefore(endTransportTime)) {
        console.log('is between Transport')
        if (checkStandardWorkTime(clockInTime, clockOutTime)) {
            isPaid.transport = true
        }

    }


    return isPaid

}

//จะเหลือ case กรณี overlap กัน
function checkStandardWorkTime(clockInTime, clockOutTime) {

    //var clockInNextDay = moment('16:00:00', format)

    let workTime = moment(clockInTime, format).add(standardWorkTime, 'hours');
    let clockOutTime = moment(clockOutTime, format)

    // if(moment(clockInTime, format).isSame(clockInNextDay)||moment(clockInTime, format).isAfter(clockInNextDay)){
    //     // let xxx = moment('2018-03-04 22:00:00', "YYYY-MM-DD"+format).add(1, 'days');
    //     let xxx = moment('2018-03-04 22:00:00',+format).add(1, 'days');
    // }
    if (workTime.isSame(clockOutTime) || workTime.isBefore(clockOutTime)) {
        return true
    } else {
        return false
    }


}


