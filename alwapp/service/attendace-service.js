//configuration
//leave 5 วัน
//ลาพักร้อน 3วัน
//ลา birthday 1 วัน 
//perfect paid 1500
//imperfect paid 500

const txUsedQuotaDetail = require('../models').TxUsedQuotaDetail;
const txSummaryDetail = require('../models').TxSummaryDetail;
const moment = require('moment');


let leaveType = {
    SL: 'SL',
    BL: 'BL',
    VL: 'VL',
    BD: 'BD'
}

let mockObj = [
    {
        pin: '0001'
    },
    {
        pin: '0002'
    },
    {
        pin: '0003'
    }
]

let mockRes = [
    [{
        summaryDetailId: '1',
        txDetailSlId: '1',
        txDetailTrId: '1',
        pin: '0001',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 18:00:00',
        otStartDt: null,
        otEndDt: null,
        actualClockinDt: '2018-03-01 08:00:00',
        actualClockoutDt: '2018-03-01 17:00:00',
        recordType: 'ON',
        shiftFlag: null,
        transportFlag: null,
        ot10: null,
        ot15: null,
        ot30: null,
        recordDate: null,
        recordMonth: null,
        remark: null,
        useFlag: 'Y',
        createBy: null,
        createDt: null
    },
    {
        summaryDetailId: '2',
        txDetailSlId: '1',
        txDetailTrId: '1',
        pin: '0001',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 18:00:00',
        otStartDt: null,
        otEndDt: null,
        actualClockinDt: '2018-03-01 08:00:00',
        actualClockoutDt: '2018-03-01 18:00:00',
        recordType: 'ON',
        shiftFlag: null,
        transportFlag: null,
        ot10: null,
        ot15: null,
        ot30: null,
        recordDate: null,
        recordMonth: null,
        remark: null,
        useFlag: 'N',
        createBy: null,
        createDt: null
    }],
    {
        summaryDetailId: '1',
        txDetailSlId: '1',
        txDetailTrId: '1',
        pin: '0002',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 18:00:00',
        otStartDt: null,
        otEndDt: null,
        actualClockinDt: '2018-03-01 08:00:00',
        actualClockoutDt: '2018-03-01 18:00:00',
        recordType: 'ON',
        shiftFlag: null,
        transportFlag: null,
        ot10: null,
        ot15: null,
        ot30: null,
        recordDate: null,
        recordMonth: null,
        remark: null,
        useFlag: 'N',
        createBy: null,
        createDt: null
    }, {
        summaryDetailId: '1',
        txDetailSlId: '1',
        txDetailTrId: '1',
        pin: '0003',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 18:00:00',
        otStartDt: null,
        otEndDt: null,
        actualClockinDt: '2018-03-01 09:00:00',
        actualClockoutDt: '2018-03-01 18:00:00',
        recordType: 'ON',
        shiftFlag: null,
        transportFlag: null,
        ot10: null,
        ot15: null,
        ot30: null,
        recordDate: null,
        recordMonth: null,
        remark: null,
        useFlag: 'Y',
        createBy: null,
        createDt: null
    },
    {
        summaryDetailId: '1',
        txDetailSlId: '1',
        txDetailTrId: '1',
        pin: '0004',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 18:00:00',
        otStartDt: null,
        otEndDt: null,
        actualClockinDt: '2018-03-01 09:00:00',
        actualClockoutDt: '2018-03-01 18:00:00',
        recordType: 'ON',
        shiftFlag: null,
        transportFlag: null,
        ot10: null,
        ot15: null,
        ot30: null,
        recordDate: null,
        recordMonth: null,
        remark: null,
        useFlag: 'N',
        createBy: null,
        createDt: null
    }, {
        summaryDetailId: '1',
        txDetailSlId: '1',
        txDetailTrId: '1',
        pin: '0005',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 18:00:00',
        otStartDt: null,
        otEndDt: null,
        actualClockinDt: '2018-03-01 09:00:00',
        actualClockoutDt: '2018-03-01 18:00:00',
        recordType: 'ON',
        shiftFlag: null,
        transportFlag: null,
        ot10: null,
        ot15: null,
        ot30: null,
        recordDate: null,
        recordMonth: null,
        remark: null,
        useFlag: 'Y',
        createBy: null,
        createDt: null
    }

]


module.exports.isPerfectAttenDance = async (req, res) => {
    console.log('check perfect')
    req = mockObj;
    // let all_emp = [];
    // //push all employee to array
    // for (let i = 0; i < req.length; i++) {
    //     let emp = await getEmployee(req[i]);
    //     all_emp.push(emp)
    // }

    // await checkLate(all_emp);

    // let emp_not_late = [];
    // for (let i = 0; i < all_emp.length; i++) {
    //     let all = []
    //     all = all_emp[i];
    //     for (let j = 0; j < all.length; j++) {
    //         let emp_late_pin;
    //         if (all[j].useFlag === 'Y') {
    //             emp_late_pin = await getTooLate(all[j]);

    //         }
    //         console.log(all[j])
    //         // emp_late_pin = await getTooLate(all[j]);
    //         // console.log(emp_late_pin)
    //         // if(all[j].pin === emp_late_pin){
    //         //         console.log(all[j])
    //         // }
    //     }
    // }
    //=========================================================================================

    let late_pin = await getTooLate(mockRes);
    // console.log(late_pin);
    //อาเรย์ของคนทีไม่มาสาย
    let per = await getCiphers(mockRes, late_pin);
    console.log(per);

    //=====================================================================================================


    // for (let i = 0; i < all_emp.length; i++) {
    //     let all = all_emp[i];
    //     let countLeave = 0;
    //     for (let j = 0; j < all.length; j++) {
    //         //check วันลาทุกอย่างว่าเกิน 5 วัน/เดือน ?
    //         if (all[j].recordType === leaveType.SL || all[j].recordType === leaveType.VL ||
    //             all[j].recordType === leaveType.BL || all[j].recordType === leaveType.BD) {
    //             countLeave++;
    //             // console.log(all[j].pin + ' ' + countLeave);
    //             if (countLeave <= 5) {
    //                 //check ว่าล่า BD แล้วมี SL BL ?
    //                 if (all[j].recordType === leaveType.BD) {
    //                     if (all[j].recordType === leaveType.SL || all[j].recordType === leaveType.BL) {
    //                         imPerfectAttenDance();
    //                     }
    //                     else {
    //                         // console.log(all[j].pin + ' : perfect paid 1500')
    //                     }
    //                 }
    //             }
    //         }
    //         if (countLeave === 0) {
    //             // console.log(all[j].pin + ' : perfect paid 1500')
    //         }
    //     }
    // }
}

function getCiphers(mockRes, pin_late) {
    let no_late = [];
    no_late = mockRes;
    for (let i = mockRes.length - 1; i >= 0; i--) {
        //userarr เป็นอาเรย์ย่อยของแต่ะละก้อนของ pin 
        let userarr = [];
        userarr = mockRes[i];
        //เอาไว้เช็คว่ามีวันมาสายมั้ย 
       let checklate = false;
        if (Array.isArray(userarr)) {
            for (let j = 0; j < userarr.length; j++) {
                for (let k = 0; k < pin_late.length; k++) {
                    if (userarr[j].pin === pin_late[k]) {
                        checklate = true;
                    }
                }
            }
            if (checklate) {
                no_late.splice(i, 1);
            }
        } else {
            for (let j = 0; j < pin_late.length; j++) {
                if (userarr.pin === pin_late[j]) {
                    checklate = true;
                }
            }
            if (checklate) {
                no_late.splice(i, 1);
            }
        }
    }
    return no_late;
}

// function cutArray(all, select) {
//     // for (let i = 0; i < all.length; i++) {
//     //     if (all[i].pin == select) {
//     //         all.splice(i);
//     //     }
//     // }
//     for(let i =0;i<all.length;i++){
//         if()
//         all.splice(index, 1);
//     }

// }

module.exports.imPerfectAttenDance = async (req, res) => {
    console.log('check imperfect')
    req = mockObj;
    let all_emp = [];
    //push all employee to array
    for (let i = 0; i < req.length; i++) {
        let emp = await getEmployee(req[i]);
        all_emp.push(emp)
    }

    await checkLate(all_emp);

    for (let i = 0; i < all_emp.length; i++) {
        let all = all_emp[i];
        let countLeave = 0;
        for (let j = 0; j < all.length; j++) {
            //check BL SL ว่าเกิน 8 ชม. ?
            if (all[j].recordType === 'BL' || all[j].recordType === 'SL') {
                //check time
                let start = getTime(all[j].scheduleStartDt);
                let end = getTime(all[j].scheduleEndDt);
                //calculate time 
                let result = (end - start) - 1;
                if (result <= 8) {
                    // console.log(all[j].pin + /' : imperfect paid 500')
                }
            }
        }
    }
}

// query list การลาของพนักงาน ขึ้นมาทั้งหมด 
const getQuotaLeave = async (req, res) => {
    return await txUsedQuotaDetail.
        findAll({
            where: {
                pin: req.pin
            },
            include: [{
                all: true
            }], raw: true,
        })
}

// query พวกที่มาสาย หรือออกก่อนเวลาทำงาน return ออกมาเป็น pin  เพื่อ ตัดออกจาก list ของพนักงานทั้งหมด
const getTooLate = async (req, res) => {
    let array_pin = [];
    // console.log(req);
    // return await txSummaryDetail.
    //     findAll({
    //         where: {
    //             useFlag: req.useFlag
    //         },
    //         include: [{
    //             all: true
    //         }], raw: true,
    //     }).then(res => {
    // for (let i = 0; i < req.length; i++) {
    //     // console.log(req[i].pin)
    //     return req[i].pin;
    // }
    //console.log(req);
    for (let i = 0; i < req.length; i++) {

        let isarray = req[i];
        // console.log(isarray)
        // console.log("========================");
        if (isarray.length > 1) {
            for (let j = 0; j < isarray.length; j++) {
                //console.log(isarray[i].useFlag)
                if (isarray[j].useFlag === 'Y') {
                    array_pin.push(isarray[j].pin)
                }
            }

        } else {

            if (req[i].useFlag === 'Y') {
                array_pin.push(req[i].pin)
            }
        }

    }
    return array_pin;
    //     })
}

// get พsนักงานที่มีทั้งหมดใน summary detail return เป็น list จะมี flag column มาสายหรือกลับก่อนเวลา 
const getEmployee = async (req, res) => {
    return mockRes;
    // return await txSummaryDetail.
    //     findAll({
    //         where: {
    //             pin: req.pin
    //         },
    //         include: [{
    //             all: true
    //         }], raw: true,
    //     }).then(res => {
    //         return res;
    //     })
}

function getMonth(date) {
    var check = moment(date, 'YYYY-MM-DD HH:mm:ss');
    var month = check.format('MM');
    var day = check.format('DD');
    var year = check.format('YYYY');
    return month;
}

function getTime(param) {
    let time = moment(param).format("HH:mm");
    let beforeConvert = time.replace(':', '');
    let convertTime = parseInt(beforeConvert) / 100;
    return convertTime;
}

const updateLateFlag = async (req, res) => {
    //update flag มาสาย ในฐานข้อมูล
    txSummaryDetail.update(
        { useFlag: req.useFlag },
        { where: { summaryDetailId: req.summaryDetailId } }
    )
}

async function checkLate(emp_array) {
    // console.log('check late')
    let all_emp = [];
    all_emp = emp_array;
    for (let i = 0; i < all_emp.length; i++) {
        let all = all_emp[i];
        for (let j = 0; j < all.length; j++) {
            let actual_clockin = getTime(all[j].actualClockinDt);
            let actual_clockout = getTime(all[j].actualClockoutDt);
            let schedule_start = getTime(all[j].scheduleStartDt);
            let schedule_end = getTime(all[j].scheduleEndDt);

            // check ว่าพนักงานมาสาย ? 
            //มาสาย
            if (actual_clockin > schedule_start || actual_clockout < schedule_end) {
                all[j].useFlag = 'Y';
            }
            //ไม่ได้มาสาย
            else {
                all[j].useFlag = 'N';
            }
            //update flag 
            await updateLateFlag(all[j]);
        }

    }
}

