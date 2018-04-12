
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
        pin : '0005'
    }
]

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
        for (let j = 0; j < arr.length; j++) {
            let emp_usedLeave = await getQuotaLeave(arr[j]);
            for (let k = 0; k < emp_usedLeave.length; k++) {
                let use = emp_usedLeave[k].used;
                //check วันลาทุกอย่างว่าเกิน 5 วัน / เดือน ?
                if (arr[j].recordType === recordType.leaveType.SL || arr[j].recordType === recordType.leaveType.VL ||
                    arr[j].recordType === recordType.leaveType.BL || arr[j].recordType === recordType.leaveType.BD) {
                    if (use <= 5) {
                        let date = await getDate(arr[j].scheduleStartDt);
                        //check ว่าลาพักร้อนติดกัน 3 วันมั้ย
                        if(arr[j].recordType === recordType.leaveType.VL){
                          
                        }
                        //check ว่าล่า BD แล้วมี SL BL ?
                        if (arr[j].recordType === recordType.leaveType.BD) {
                            let emp = await getEmployee(emp_usedLeave[k]);
                            
                            for(let x = 0; x < emp.length; x++){
                                if (emp[x].recordType === recordType.leaveType.SL || emp[x].recordType === recordType.leaveType.BL) {
                                    // console.log('go to cal in imperfect')
                                    //check time
                                    let start = getTime(emp[x].scheduleStartDt);
                                    let end = getTime(emp[x].scheduleEndDt);
                                    //calculate time 
                                    let result = (end - start) - 1;
                                    if (result <= 8) {
                                        // console.log(emp_usedLeave[k].pin + ' : imperfect paid 500')
                                    }
                                }
                                else {
                                    // console.log(emp_usedLeave[k].pin + ' : perfect paid 1500')
                                }
                            }
                        }
                    }
                }
                //ไม่ได้ลา
                if (use == 'NaN' || use == 0) {
                    // console.log(emp_usedLeave[k].pin + ' : perfect paid 1500')
                }
            }
        }
    }
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
            for (let k = 0; k < emp_late.length; k++) {
                if (emp_late[k].recordType === recordType.leaveType.BL || emp_late[k].recordType === recordType.leaveType.SL) {
                    //check time
                    let start = getTime(emp_late[k].scheduleStartDt);
                    let end = getTime(emp_late[k].scheduleEndDt);
                    //calculate time 
                    let result = (end - start) - 1;
                    if (result <= 8) {
                        // console.log(emp_late[k].pin + ' : imperfect paid 500')
                    }
                }
                //ไม่ได้ลา
                if (emp_late[k].recordType === recordType.ON) {
                    // console.log(emp_late[k].pin + ' : imperfect paid 500')
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
                // userarr = userarr.filter(function (item) {
                //     return item !== emp_pin;
                // })
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

