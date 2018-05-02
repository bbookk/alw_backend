
//configuration
//leave 5 วัน
//ลาพักร้อน 3วัน
//ลา birthday 1 วัน 
//perfect paid 1500
//imperfect paid 500

const txUsedQuotaDetail = require('../models').TxUsedQuotaDetail;
const txSummaryDetail = require('../models').TxSummaryDetail;
const moment = require('moment');

let recordType = {
    leaveType: {
        SL: 'SL',
        BL: 'BL',
        VL: 'VL',
        BD: 'BD'
    },
    ON: 'ON',
    OT: 'OT',
    OT_COM: 'OT_COM',
    OFF: 'OFF'
}

let leaveFlag = {
    late: 'Y',
    not_late: 'N'
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
    },
    {
        pin: '0004'
    },
    {
        pin: '0005'
    }
]

let pin_result = {};

let perfect_pin = [];
let imperfect_pin = [];


module.exports.isPerfectAttenDance = async (req, res) => {
    console.log('check perfect')
    //mockup pin ที่ส่งมา
    req = mockObj;
    let all_emp = [];

    //push all employee to array
    for (let i = 0; i < req.length; i++) {
        let emp = await getEmployee(req[i]);
        all_emp.push(emp)
    }

    //check clockin clockout เพื่อดูว่ามาสายมั้ย
    await checkLate(all_emp);

    let result = {};
    for (let i = 0; i < all_emp.length; i++) {
        let all = []
        all = all_emp[i];

        for (let j = 0; j < all.length; j++) {
            if (all[j].useFlag === leaveFlag.late) {
                let pin = await getTooLate(all[j]);
                // console.log(pin)
                //array เก็บค่า employee ที่ไม่เคยมาสาย
                result = await spliceArray(all_emp, pin);

            }
        }
    }

    //เก็บค่า array ของคนไม่เคยมาสาย
    let emp_not_late = [];
    for (let z = 0; z < result.no_late.length; z++) {
        emp_not_late.push(result.no_late[z]);
    }

    let perfect_pin = [];
    for (let i = 0; i < emp_not_late.length; i++) {
        let arr = [];
        arr = emp_not_late[i];
        let countVL = 0; //ตัวนับวันลาพักร้อน
        let countOFF = 0; //ตัวนับวันลาพักร้อน + วันหยุด
        for (let j = 0; j < arr.length; j++) {
            let emp_usedLeave = await getQuotaLeave(arr[j]);
            for (let k = 0; k < emp_usedLeave.length; k++) {
                let use = emp_usedLeave[k].used;
                //ลาน้อยกว่า 5 วันต่อเดือน
                if (use <= 5) {
                    //check วันลาทุกอย่างว่าเกิน 5 วัน / เดือน ?
                    if (arr[j].recordType === recordType.leaveType.SL || arr[j].recordType === recordType.leaveType.VL ||
                        arr[j].recordType === recordType.leaveType.BL || arr[j].recordType === recordType.leaveType.BD) {
                        //check ว่าลาพักร้อนติดกัน 3 วันมั้ย
                        if (arr[j].recordType === recordType.leaveType.VL) {
                            let date1 = arr[j].scheduleStartDt;
                            let date2 = arr[j].scheduleEndDt;
                            let diff = convertMS(calVacation(date1, date2)); //คนวณหาค่าว่าวันที่ลาห่งกัน 1 วันรึป่าว
                            if (diff === 1) {
                                countVL++; //เอามาไว้นับวันลาพักร้อน
                            }
                        }

                        //check ว่าลาพักร้อน + วันหยุด <=5 มั้ย
                        if (arr[j].recordType === recordType.leaveType.VL || arr[j].recordType === recordType.leaveType.OFF
                            || arr[j].recordType === recordType.leaveType.BD) {
                            countOFF++;
                        }

                        //กรณีลาพักร้อนติดกันไม่เกิน 3 วัน และลาพักร้อน + วันหยุดรวมกันไม่เกิน 5 วัน
                        if (countVL <= 3 && countOFF <= 5) {
                            //check ว่าล่า BD แล้วมี SL BL ?
                            if (arr[j].recordType === recordType.leaveType.BD) {
                                let emp = await getEmployee(emp_usedLeave[k]);
                                cal_hours(emp, arr[j].pin);
                            }
                            if (arr[j].recordType === recordType.leaveType.VL) {
                                if (countVL <= 3) {
                                    // console.log(arr[j].pin + ' : perfect paid 1500')
                                    if (!perfect_pin.includes(arr[j].pin)) {
                                        perfect_pin.push(arr[j].pin)
                                    }

                                }
                            }
                        }
                        //กรณ๊ลาพักร้อนเกิน 3 วันหรือลาพักร้อน + วันหยุดรวมกันเกิน 5 วัน
                        else {
                            // console.log(arr[j].pin + ' : no attendance ')
                        }
                    }
                    //กรณีไม่เคยลา
                    if (use == 0) {
                        // console.log(arr[j].pin + ' : perfect paid 1500')
                        if (!perfect_pin.includes(arr[j].pin)) {
                            perfect_pin.push(arr[j].pin)
                        }
                    }
                }
                //กรณ๊วันลาเกิน 5 วันต่อเดือน
                else {
                    await cal_hours(arr, arr[j].pin);
                }
            }
        }
    }

    pin_result.perfect = perfect_pin;
    pin_result.imperfect_pin = imperfect_pin;
    
    console.log(pin_result)
    return pin_result;

}

module.exports.imPerfectAttenDance = async (req, res) => {
    console.log('check imperfect')
    //mockup pin ที่ส่งมา
    req = mockObj;
    let all_emp = [];
    //push all employee to array
    for (let i = 0; i < req.length; i++) {
        let emp = await getEmployee(req[i]);
        all_emp.push(emp)
    }

    //check clockin clockout เพื่อดูว่ามาสายมั้ย
    await checkLate(all_emp);

    let result = {};
    for (let i = 0; i < all_emp.length; i++) {
        let all = []
        all = all_emp[i];
        for (let j = 0; j < all.length; j++) {
            if (all[j].useFlag === leaveFlag.late) {
                let pin = await getTooLate(all[j]);
                //ส่งค่าไปตัด array
                result = await spliceArray(all_emp, pin);
            }
        }
    }

    //array เฉพาะของคนที่เคยมาสาย
    let emp_array_late = [];
    for (let z = 0; z < result.is_late.length; z++) {
        emp_array_late.push(result.is_late[z]);
    }

    for (let i = 0; i < result.is_late.length; i++) {
        let arr = result.is_late[i];
        for (let j = 0; j < arr.length; j++) {
            let emp_late = arr[j];
            await cal_hours(emp_late, emp_late[j].pin)
        }
    }

    pin_result.perfect = perfect_pin;
    pin_result.imperfect_pin = imperfect_pin;
    
    // console.log(pin_result)
    return pin_result;
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
        }).then(res => {
            return res;
        })
}

// query พวกที่มาสาย หรือออกก่อนเวลาทำงาน return ออกมาเป็น pin  เพื่อ ตัดออกจาก list ของพนักงานทั้งหมด
const getTooLate = async (req, res) => {
    let array_pin = [];
    return await txSummaryDetail.
        findAll({
            where: {
                useFlag: req.useFlag
            },
            include: [{
                all: true
            }], raw: true,
        }).then(res => {
            // console.log(res)
            for (let i = 0; i < res.length; i++) {
                array_pin.push(res[i].pin)
            }
            return array_pin;
        })
}

// get พนักงานที่มีทั้งหมดใน summary detail return เป็น list จะมี flag column มาสายหรือกลับก่อนเวลา 
const getEmployee = async (req, res) => {
    return await txSummaryDetail.
        findAll({
            where: {
                pin: req.pin
            },
            include: [{
                all: true
            }], raw: true,
        }).then(res => {
            return res;
        })
}


function cal_hours(array, pin) {
    let hour = 0;
    for (let x = 0; x < array.length; x++) {
        //กรณีมีลาป่วย หรือลากิจ ในเดือนที่มีการลาวันเกิด ต้องไปคำนวณ imperfect
        if (array[x].recordType === recordType.leaveType.SL || array[x].recordType === recordType.leaveType.BL) {
            //check time
            let start = getTime(array[x].scheduleStartDt);
            let end = getTime(array[x].scheduleEndDt);
            //calculate time 
            hour = hour + (end - start) - 1;
        }
    }
    if (hour <= 8) {
        // console.log(pin + ' : imperfect paid 500')
        if (!imperfect_pin.includes(pin)) {
            imperfect_pin.push(pin)
        }
    }
    else {
        //ไม่ได้ค่าเบี้ยขยัน
        // console.log(pin + ' : no attendance ')
    }

    // return imperfect_pin;
}

function spliceArray(all_emp_array, emp_pin) {
    let no_late = [];
    let userarr = [];
    let is_late = [];
    let result = {}
    no_late = all_emp_array;
    for (let i = all_emp_array.length - 1; i >= 0; i--) {
        //userarr เป็นอาเรย์ย่อยของแต่ะละก้อนของ pin 
        userarr = all_emp_array[i];
        //เอาไว้เช็คว่ามีวันมาสายมั้ย 
        let checklate = false;
        for (let j = 0; j < userarr.length; j++) {
            for (let k = 0; k < emp_pin.length; k++) {
                if (userarr[j].pin === emp_pin[k]) {
                    checklate = true;
                }
            }
        }
        if (checklate) {
            is_late.push(no_late.splice(i, 1));
        }
    }
    //เก็บค่าอาเรย์ของคนที่ไม่เคยสาย
    result.no_late = no_late;
    //เก็บอาเรย์ของคนที่มาสาย ตัดคนที่ไม่เคยมาสายออก
    result.is_late = is_late;
    return result;
}

function getDate(date) {
    let data = {};
    var check = moment(date, 'YYYY-MM-DD HH:mm:ss');
    var month = check.format('MM');
    var day = check.format('DD');
    var year = check.format('YYYY');
    data.day = day;
    data.month = month;
    data.year = year;
    return data;
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
    // console.log('checี้k late')
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

function calVacation(date1, date2) {
    let dt1 = moment(date1, "YYYY-MM-DD");
    let dt2 = moment(date2, "YYYY-MM-DD");
    let diff = dt2.diff(dt1);
    return diff;
}

function convertMS(ms) {
    var day, hour, minute, second;
    second = Math.floor(ms / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day;
};


