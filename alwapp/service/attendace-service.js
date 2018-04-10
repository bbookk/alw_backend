
//configuration
//leave 5 วัน
//ลาพักร้อน 3วัน
//ลา birthday 1 วัน 
//perfect paid 1500
//imperfect paid 500

const txUsedQuotaDetail = require('../models').TxUsedQuotaDetail;
const txSummaryDetail = require('../models').TxSummaryDetail;




module.exports.isPerfectAttenDance = async (req, res) => {

    // let all_emp = await getEmployee(mockObj);
    let all_emp = await getEmployee(mockObj);
    for (let i = 0; i < all_emp.length; i++) {
        let emp_late = await getTooLate(all_emp.useFlag);
        if (emp_late[i].useFlag === 'N') {
            let quota = await getQuotaLeave(emp_late[i].pin);
            if(quota[i].used <= 5){
                console.log('perfect')
            }
        }
        if (emp_late[i].useFlag === 'Y') {
            // console.log('imperfect');
        }
    }
}


module.exports.imPerfectAttenDance = async (req, res) => {


}



let mockObj =
    {
        pin: '0001'
    }

let mockRes = [
    {
        pin: '0001',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 17:00:00',
        actualClockinDt: '2018-03-01 07:50:00',
        actualClockoutDt: '2018-03-01 17:00:00',
        useFlag: 'N',
        recordType:'BL',

    }, {
        pin: '0002',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 17:00:00',
        actualClockinDt: '2018-03-01 07:50:00',
        actualClockoutDt: '2018-03-01 17:00:00',
        useFlag: 'N'
    }, {
        pin: '0003',
        scheduleStartDt: '2018-03-01 08:00:00',
        scheduleEndDt: '2018-03-01 17:00:00',
        actualClockinDt: '2018-03-01 07:50:00',
        actualClockoutDt: '2018-03-01 17:00:00',
        useFlag: 'Y'
    }

]

let mockLeave = [
    {
        pin: '0001',
        used: '5'
    },   {
        pin: '0002',
        used: '4'
    },   {
        pin: '0003',
        used: '6'
    },
]

// query list การลาของพนักงาน ขึ้นมาทั้งหมด 
const getQuotaLeave = async (req, res) => {
    return mockLeave;
    // return await txUsedQuotaDetail.
    //     findAll({
    //         where: {
    //             pin: req.pin
    //         },
    //         include: [{
    //             all: true
    //         }], raw: true,
    //     })
}

// query พวกที่มาสาย หรือออกก่อนเวลาทำงาน return ออกมาเป็น pin  เพื่อ ตัดออกจาก list ของพนักงานทั้งหมด
const getTooLate = async (req, res) => {
    res = mockRes;
    return res;
    // return await txSummaryDetail.
    //     findAll({
    //         where: {
    //             pin : req.pin
    //         },
    //         include: [{
    //             all: true
    //         }], raw: true,
    //     })
}

// get พนักงานที่มีทั้งหมดใน summary detail return เป็น list จะมี flag column มาสายหรือกลับก่อนเวลา 
const getEmployee = async (req, res) => {
    res = mockRes;
    return res;
    // return await txSummaryDetail.
    //     findAll({
    //         where: {
    //             pin: req.pin
    //         },
    //         include: [{
    //             all: true
    //         }], raw: true,
    //     }).then(res => {
    //         console.log(res)
    //     })
}

