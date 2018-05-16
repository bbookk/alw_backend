const modelTrHeader = require('../models').TxTrHeader;
const modelTrDetail = require('../models').TxTrDetail;
const modelSlHeader = require('../models').TxSlHeader;
const modelSlDetail = require('../models').TxSlDetail;
const modelInfoSummary = require('../models').InfoSummaryCheck;
const model = require('../models');
const chokidar = require('chokidar');
const watch = require('node-watch');
const csv = require('csvtojson');
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');
const arrayToTxtFile = require('array-to-txt-file')
const Sequelize = require('sequelize');
const pg = require('pg')
const pgFormat = require('pg-format');
const Pool = require('pg-pool')

let localPathSL = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/SL/';
let localPathTR = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/TR/';
let localPath = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/';
let nasPath = 'C:/Users/dell-2018/Desktop/NAZ/';
let archire = 'C:/Users/dell-2018/Desktop/alw/app/alw/archire/';
let nasPathTR = 'C:/Users/dell-2018/Desktop/NAZ/TR/';

// let localPathSL = 'C:/Users/Asus/Desktop/local/app/ALW/data/SL/';
// let localPathTR = 'C:/Users/Asus/Desktop/local/app/ALW/data/TR/';
// let localPath = 'C:/Users/Asus/Desktop/local/app/ALW/data/';
// let nasPath = 'C:/Users/Asus/Desktop/NAZ/';
// let archire = 'C:/Users/Asus/Desktop/local/app/ALW/archire/';
// let nasPathTR = 'C:/Users/dell-2018/Desktop/NAZ/TR/';

//let folder = getDirectories(localPath) + '/';

let start_process = new Date().getTime();// startto count time
let format = 'YYYY-MM-DD HH:mm:ss';
let dateFormat = 'YYYY-MM-DD 00:00:00';
const keyPath = {
    SL: 'SL',
    TR: 'TR',
    quota: 'QUATA',
    activity: 'ACT'
}

const config = {
    database: "alwsdb",
    user: "alwsdbuser",
    password: "ais@1234",
    host: "10.138.47.138",
    port: 5432,
    max: 5, // set pool max size to 5 
    min: 0, // set min pool size to 0 
    idleTimeoutMillis: 30000, // close idle clients after 1 second 
};

const pool = new Pool(config);

module.exports.copyFromNas = async (req, res) => {
    var dir_name = getDirectories(nasPath);
    // console.log(dir_name)
    for (var i = 0; i < dir_name.length; i++) {
        let folder = dir_name[i];
        let file_dest = localPath + folder + '/';
        fs.readdir(nasPath + folder + '/', function (err, file) {
            // console.log(folder)
            if (err) throw err;
            for (var j = 0; j < file.length; j++) {
                let file_nas = nasPath + folder + '/' + file[j];
                var f = path.basename(file_nas);
                source = fs.createReadStream(file_nas);
                var dest = fs.createWriteStream(path.resolve(file_dest, f));
                source.pipe(dest);
                source.on('end', function () {
                });
                source.on('error', function (err) {
                    console.log(err);
                });
            }
        });
    }
    console.log('copy file from NAS success')
}

module.exports.importTR = async (req, res) => {
    console.log('import TR')
    let pathTR = getPath(keyPath.TR)
    let watcher = chokidar.watch(pathTR, { ignored: /^\./, persistent: true });
    let txtFile = [];
    let syncFile = [];
    await watcher
        .on('add' || 'change', async function (file) {
            if (path.parse(file).ext === '.txt') {
                console.log('File in TR', file, 'has been added or change');
                // txtFile.push(file);
                // for(let i = 0; i < txtFile.length; i++){
                let sync = await createSyncFile(file);
                // }
                // watcher.close();
            }
            if (path.parse(file).ext === '.sync') {
                console.log('File sync TR has been added or change');
                // syncFile.push(file);
                // for(let i = 0; i < txtFile.length; i++){
                let read = await renameToProcess(file);
                // }
                // watcher.close();
            }
        })
        .on('unlink', function (path) {
            // console.log('File', path, 'has been removed');
        })
        .on('error', function (error) {
            console.error('Error happened', error);
        })
}

module.exports.importSL = async (req, res) => {
    console.log('import SL')
    let pathSL = getPath(keyPath.SL)
    let watcher = chokidar.watch(pathSL, { ignored: /^\./, persistent: true });
    await watcher
        .on('add' || 'change', async function (file) {
            if (path.parse(file).ext === '.txt') {
                // console.log('File in SL', file, 'has been added or change');
                let sync = await createSyncFile(file);
            }
            if (path.parse(file).ext === '.sync') {
                // console.log('File sync SL has been added or change');
                let read = await renameToProcess(file);
            }
        })
        .on('unlink', function (path) {
            // console.log('File', path, 'has been removed');
        })
        .on('error', function (error) {
            console.error('Error happened', error);
        })
}

async function createHeader(file, param, len) {
    let today = moment();
    let today_dt = moment(today).format(format);
    let header, headerId;
    if (param === keyPath.SL) {
        header = await modelSlHeader.create({
            fileName: file,
            recSuccess: len,
            recFail: '0',
            status: 'success',
            errorMsg: '',
            createDt: today_dt,
            createBy: 'batch',
        })
    }
    if (param === keyPath.TR) {
        header = await modelTrHeader.create({
            fileName: file,
            recSuccess: len,
            recFail: '0',
            status: 'success',
            errorMsg: '',
            createDt: today_dt,
            createBy: 'batch',
        })
    }
    headerId = header.dataValues.headerId;
    return headerId;
}

async function createDetail(param, objTR) {
    if (param === keyPath.SL) {
        let insertData = pgFormat('INSERT INTO public.tx_sl_detail (header_id, emp_id, ssn, activity, schedule_date, time_zone, start_dt, stop_dt, exec_date, create_dt, create_by) VALUES %L', objTR);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(insertData)
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))
    }
    if (param === keyPath.TR) {
        let insertData = pgFormat('INSERT INTO public.tx_tr_detail (header_id, modify, ssn, organize_name, agent_name, schedule_date, time_zone, activity, start_dt, stop_dt, create_dt, create_by) VALUES %L', objTR);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(insertData)
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))
    }
}

function mapJson2Obj(param, jsonObj, headerId) {
    let today = moment();
    let today_dt = moment(today).format(format);
    if (keyPath.SL === param) {
        let schedule_date = convertFormatDate(jsonObj.field4);
        let execDt = convertFormatDate(jsonObj.field6)
        let start_time = jsonObj.field7;
        let stop_time = jsonObj.field8;
        let start = moment(schedule_date + start_time, format);
        let schedule_start = moment(start).format(format);
        let stop = moment(schedule_date + stop_time, format);
        let schedule_stop = moment(stop).format(format);
        let time_schedule = moment(schedule_date + '00:00:00', format);
        let scheduleDt = moment(time_schedule).format(format);
        let time_exec = moment(execDt + '00:00:00', format);
        let executeDt = moment(time_exec).format(format);
        return [
            headerId, jsonObj.field1, jsonObj.field2, jsonObj.field3, scheduleDt, jsonObj.field5, schedule_start,
            schedule_stop, executeDt, today_dt, 'batch']
        // return {
        //     emp_id: jsonObj.field1,
        //     ssn: jsonObj.field2,
        //     activity: jsonObj.field3,
        //     scheduleDate: scheduleDt,
        //     time_zone: jsonObj.field5,
        //     startDt: schedule_start,
        //     stopDt: schedule_stop,
        //     execDate: executeDt,
        //     createDt: today_dt,
        //     createBy: 'batch',
        // }
    }
    else if (keyPath.TR === param) {
        let date = jsonObj.field5;
        let start_date = jsonObj.field8;
        let stop_date = jsonObj.field9;
        let time = moment(date + start_date, format);
        let start_dt = moment(time).format(format);
        let time2 = moment(date + stop_date, format);
        let stop_dt = moment(time2).format(format);
        let time_schedule = moment(date + '00:00:00', format);
        let scheduleDt = moment(time_schedule).format(format);
        return [
            headerId, jsonObj.field1, jsonObj.field2, jsonObj.field3, jsonObj.field4, scheduleDt,
            jsonObj.field6, jsonObj.field7, start_dt, stop_dt, today_dt, 'batch'
        ]
        // return {
        //     modify: jsonObj.field1,
        //     ssn: jsonObj.field2,
        //     organizeName: jsonObj.field3,
        //     agentName: jsonObj.field4,
        //     scheduleDate: scheduleDt,
        //     time_zone: jsonObj.field6,
        //     activity: jsonObj.field7,
        //     startDt: start_dt,
        //     stopDt: stop_dt,
        //     createDt: today_dt,
        //     createBy: 'batch',
        // }
    }
}

function getPath(paramPath) {
    if (keyPath.SL === paramPath) {
        return localPathSL
    }
    else if (keyPath.TR === paramPath) {
        return localPathTR
    }
    return null
}

function convertFormatDate(date) {
    let beforeConvertdate = moment(date, 'YYYYMMDD');
    let convert_todate = beforeConvertdate.format('YYYY-MM-DD');
    return convert_todate;
}

//get directory form path
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

function createSyncFile(txt_path) {
    let txt_fileName = path.parse(txt_path).base;
    let sync_file = txt_path.replace('.txt', '.sync');
    fs.writeFile(sync_file, txt_fileName, async function (err) {
        if (err) throw err;
        console.log('create sync file');
    });
    return sync_file;
}

function renameToProcess(syncPath) {
    console.log('rename to proc');
    let obj = {};
    let syncProc = syncPath + '.proc';
    let txtName = syncPath.replace('.sync', '.txt');
    let txtProc = txtName + '.proc';
    let dirName = path.parse(path.parse(syncPath).dir).name;
    if (fs.existsSync(syncPath)) {
        fs.rename(syncPath, syncProc, function (err) {
            if (err) console.log(err)
            if (fs.existsSync(txtName)) {
                fs.rename(txtName, txtProc, async function (err) {
                    if (err) console.log(err)
                    console.log('read data')
                    await addToObj(dirName, txtProc)
                    getnameSync(syncProc); //get name of sync proc file
                });
            }
        });
    }
    obj.dirName = dirName;
    obj.txtProc = txtProc;
    // console.log(obj)
    return obj;
}

function getnameSync(sync_proc) {
    let sync_name = path.parse(sync_proc).name;
    return sync_name;
}

async function addToObj(param, filepath) {
    let sum = -2; //delete header file 2 line
    let objTR = [], data = [];
    let arr_file = [];
    let file_split;
    let file = path.parse(filepath).name;//file.txt or file.sync
    let filename = path.parse(file).name;//filename not have extension file

    console.log(file + ' adding obj')
    let start = new Date().getTime();// startto count time

    var LineByLineReader = require('line-by-line'),//read data from main file line-by-line
        lr = new LineByLineReader(filepath);
    lr.on('error', function (err) {
        // 'err' contains error object
    });
    lr.on('line', function (line) {
        objTR.push(line);//obj to keep data all line in file
        if (line === '') {
        } else {
            sum++;//sum to count line of file
        }
    });
    lr.on('end', async function () {
        let obj_summary = {};
        data = chunk(objTR.slice(3), 1000)
        // let headerId = await createHeader(filename, param, sum)//create headerId to stamp in db
        let headerId = 0;
        for (let i = 0; i < data.length; i++) {
            file_split = filepath + '.part' + i;
            arrayToTxtFile(data[i], file_split, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            arr_file.push(file_split)
        }

        let arr = [];
        let arr_summary = [];

        for (let j = 0; j < arr_file.length; j++) {
            await readInSplit(arr_file[j], param, headerId).then(async (obj) => {//read data in split file
                fs.appendFile('output.txt', filepath + '\r\n', function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
                // await createDetail(param, obj) //stamp obj in split file to db
                for (let x = 0; x < obj.length; x++) {
                    arr_summary = obj[x];
                    let check = true;
                    if (param == keyPath.SL) {
                        //check if element in array have primary are equal don't push
                        for (let loop = 0; loop < arr.length; loop++) {
                            let subArray = arr[loop];
                            //check pin and recordDt are equal?
                            if (subArray[0] === arr_summary[2] && subArray[1] === arr_summary[4]) {
                                check = false
                                break;
                            }
                        }
                        //arr_summary[2] is ssn , arr_summay[4] is schedule date in file SL
                        if (check)
                            //array is have not same primary key (pin + recordDt)
                            arr.push(mapToArraySummary(arr_summary[2], arr_summary[4], headerId, param))
                    }
                    else if (param == keyPath.TR) {
                        //check if element in array have primary are equal don't push
                        for (let loop = 0; loop < arr.length; loop++) {
                            let subArray = arr[loop];
                            //check pin and recordDt are equal?
                            if (subArray[0] === arr_summary[2] && subArray[1] === arr_summary[5]) {
                                check = false
                                break;
                            }
                        }
                        //arr_summary[2] is ssn , arr_summay[5] is schedule date in file TR
                        if (check)
                            //array is have not same primary key (pin + recordDt)
                            arr.push(mapToArraySummary(arr_summary[2], arr_summary[5], headerId, param))
                    }
                }
            });
        }

        //ค่า arr คือค่าที่เก็บอาเรย์ข้อมูลที่มี pin , recordDt เป็น primary key
        let end = new Date().getTime();
        let time = end - start;
        let second = convertMS(time)
        console.log(file + ' stamp all data to db success on ' + second + ' second')

        let pin = [];//เก็บค่า pin ที่มีใน arr 
        let pin_query_date = [];//เก็บค่า pin เพื่อเอาไปจับคู่กับ recordDt ทั้งหมดในเดือน เพื่อเอาไปทำ auto insert ต่อไป
        let recordDt = [];//เก็บค่า recordDt ที่มีใน arr 

        // let start_update = new Date().getTime();// startto count time
        // เก็บ pin , recordDt จากอาเรย์ที่ได้หลังจากตัดตัวซ้ำ เพื่อเอาไป query ต่อ 
        for (let y = 0; y < arr.length; y++) {
            let subArr = [];
            subArr = arr[y];
            pin.push(subArr[0]);
            recordDt.push(subArr[1]);

            if (!pin_query_date.includes(subArr[0])) {
                pin_query_date.push(subArr[0]) //pin to query for auto_insert process
            }
            ssnArr = pin_query_date;
        }
        // console.log(pin_query_date)
        let start_update = new Date().getTime();// start to count time
        console.log('inserting to info_summary_check....')
        for (let k = 0; k < pin.length; k++) {
            //query pin , headerId , recordDt from info_summary_check 
            //เพื่อดูว่ามีใน table รึยังถ้ามีก็ update header ถ้าไม่มีก็ insert ลงไปใหม่
            // let dataUpdate = await getSummaryCheck(pin[k], recordDt[k], arr[k], param);
        }

        console.log('updating info_summary_check....')
        let obj = {};
        let headerIdArr, pinArr, flag, recordDtArr;
        for (let k = 0; k < arr.length; k++) {
            //update tr header in info_summary_success
            let sub_arr = arr[k];
            for (let j = 0; j < sub_arr.length; j++) {
                if (sub_arr[0] !== '') {
                    if (param === keyPath.SL) {
                        sub_arr[2] = 'Y';
                        pinArr = sub_arr[0];
                        recordDtArr = sub_arr[1];
                        flag = sub_arr[2];
                        headerIdArr = sub_arr[4];
                        // await updateInfoSummary(flag, headerIdArr, pinArr, recordDtArr, param);
                    }
                    if (param === keyPath.TR) {
                        sub_arr[3] = 'Y';
                        pinArr = sub_arr[0];
                        recordDtArr = sub_arr[1];
                        flag = sub_arr[3];
                        headerIdArr = sub_arr[5];
                        // await updateInfoSummary(flag, headerIdArr, pinArr, recordDtArr, param);
                    }
                }
            }
        }

        let end_update = new Date().getTime();
        let time_update = end_update - start_update;
        let second_update = convertMS(time_update)
        console.log('insert and update success on ' + second_update + ' second');

        //move .txt.proc and .sync.proc to archire folder (ไฟล์หลัก) 
        let syncProc = getPath(param) + filename + '.sync.proc';
        moveFile(param, filepath)//move file .txt.proc
        moveFile(param, syncProc)//move file .sync.proc

        //ทำ auto insert กรณีวัน off
        console.log('auto inserting .....')
        for (let index = 0; index < pin_query_date.length; index++) {
            let auto_insert = await getDate(pin_query_date[index]);
        }
        console.log('auto insert success');
    });
}

function mapToArraySummary(pin, recordDt, headerId, param) {
    let sl_flag, tr_flag, sl_headerId, tr_headerId, sum_flag, sum_startDt, sum_endDt;
    let today = moment();
    let today_dt = moment(today).format(dateFormat);
    sum_flag = 'N';
    sum_startDt = today_dt;
    sum_endDt = today_dt;
    //กรณี SL มาก่อน TR
    if (param == keyPath.SL) {
        sl_headerId = headerId;
        sl_flag = 'Y';
        tr_flag = 'N';
    }
    //กรณี TR มาก่อน SL
    else if (param == keyPath.TR) {
        tr_headerId = headerId;
        sl_flag = 'N';
        tr_flag = 'Y';
    }
    //กรณีเป็นวัน off
    else if (param == 'auto_insert') {
        sl_headerId = null;
        tr_headerId = null;
        sl_flag = 'N';
        tr_flag = 'N';
    }
    return [
        pin, recordDt, sl_flag, tr_flag, sl_headerId, tr_headerId, sum_flag, sum_startDt, sum_endDt
    ]
}

function readInSplit(filepath, param, headerId) {
    let obj = [];
    let arr = [];
    return new Promise(async (resolve, reject) => {
        const promises = []
        await csv({//read data from text file to json object
            noheader: true,
            delimiter: ["|"]
        }).fromFile(filepath)
            .on('json', jsonObj => {
                obj.push(mapJson2Obj(param, jsonObj, headerId))
            })
            .on('done', error => {
                if (error) {
                    reject(error)
                    return
                }
                Promise.all(promises).then(result_obj => {
                    resolve(obj)//return obj ofthis function
                })
            })
    })
}

//function for split array to sub array
function chunk(arr, len) {
    var chunks = [],
        i = 0,
        n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }
    return chunks;
}

function moveFile(param, filepath) {
    console.log('move to archire')
    var oldPath = filepath;
    let filename = path.parse(oldPath).name;
    var newPath = archire + param + '/' + filename + '.proc';
    var name = archire + param + '/' + filename;
    fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
        fs.rename(newPath, name, function (err) {
        })
    })

    let end_process = new Date().getTime();
    let time = end_process - start_process;
    let second = convertMS(time)
    console.log('all process success on ' + second + ' second')
}

//function to insert data from SL,TR to info_summary_check table
async function createSummaryCheck(obj) {
    let insertData = pgFormat('INSERT INTO public.info_summary_check (pin, record_dt, sl_flag, tr_flag, sl_header_id, tr_header_id, gen_sum_flag, gen_sum_start_dt, gen_sum_end_dt) VALUES (%L)', obj);

    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query(insertData)
        } finally {
            client.release();
        }
    })().catch(e => console.error(e.message, e.stack))
}

//function for update sl_header tr_header and tr_flag sl_flagin info_summary_check
async function updateInfoSummary(flag, headerId, pin, recordDt, param) {

    if (param === keyPath.SL) {
        let updateData = pgFormat('UPDATE public.info_summary_check SET sl_flag = %L , sl_header_id = %L WHERE pin = %L AND record_dt = %L', flag, headerId, pin, recordDt);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(updateData)
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))
    }

    if (param === keyPath.TR) {
        // console.log(headerId)
        let updateData = pgFormat('UPDATE public.info_summary_check SET tr_flag = %L , tr_header_id = %L WHERE pin = %L AND record_dt = %L', flag, headerId, pin, recordDt);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(updateData)
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))
    }

}

//function for update sl_header in info_summary_check
async function updateHeaderId(headerId, pin, recordDt) {
    let updateData = pgFormat('UPDATE public.info_summary_check SET sl_header_id = %L WHERE pin = %L AND record_dt = %L', headerId, pin, recordDt);

    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query(updateData)
        } finally {
            client.release()
            // checkInsertSummary = true;
        }
    })().catch(e => console.error(e.message, e.stack))
}

//function to query ssn, header_id and schedule_date form sl_detail,tr_detail 
//return release ssn , schedule_date and header_id
const getDetail = async (pin, recordDt, param) => {
    let result = {};
    let formatSQL = "'YYYY-MM-DD HH24:MI:ss'";
    if (param === keyPath.SL) {
        let selectData = pgFormat('SELECT ssn, header_id, TO_CHAR(schedule_date, ' + formatSQL + ') FROM public.tx_sl_detail WHERE ssn IN (%L) AND schedule_date IN (%L)', pin, recordDt);

        return new Promise(async (resolve, reject) => {
            (async () => {
                var client = await pool.connect()
                try {
                    await client.query(selectData).then(async res => {
                        res = JSON.stringify(res.rows)
                        let obj = JSON.parse(res)
                        let pin = [], recordDt = [], headerId = [];

                        result.pin = obj[obj.length - 1].ssn
                        result.recordDt = obj[obj.length - 1].to_char
                        result.headerId = obj[obj.length - 1].header_id
                        resolve(result)
                    })
                } finally {
                    client.release()
                }
            })().catch(e => console.error(e.message, e.stack))
        })
    }
    if (param === keyPath.TR) {
        let selectData = pgFormat('SELECT ssn, header_id, TO_CHAR(schedule_date, ' + formatSQL + ') FROM public.tx_tr_detail WHERE ssn IN (%L) AND schedule_date IN (%L)', pin, recordDt);

        return new Promise(async (resolve, reject) => {
            (async () => {
                var client = await pool.connect()
                try {
                    await client.query(selectData).then(async res => {
                        res = JSON.stringify(res.rows)
                        let obj = JSON.parse(res)
                        let pin = [], recordDt = [], headerId = [];

                        result.pin = obj[obj.length - 1].ssn
                        result.recordDt = obj[obj.length - 1].to_char
                        result.headerId = obj[obj.length - 1].header_id
                        resolve(result)
                    })
                } finally {
                    client.release()
                }
            })().catch(e => console.error(e.message, e.stack))
        })
    }

}

//function for get date in this month to auto insert process
async function getDate(pin) {
    let now = new Date();//current time
    //current date
    // let firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    // let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    //mock Date
    let firstDay = new Date(2017, 10, 1);
    let lastDay = new Date(2017, 10 + 1, 0);

    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
        let day = new Date(d);
        let convertDay = moment(day).format(format);

        //query เพื่อดูว่าใน table info_summary_check และทำ auto_insert 
        await querySummary(pin, convertDay);
    }
}

//function query data from info_summary_check for check pin and recordDt are exist ?
async function getSummaryCheck(pin, recordDt, arr, param) {
    let result_update = {};
    let formatSQL = "'YYYY-MM-DD HH24:MI:ss'";
    let selectData = pgFormat('SELECT pin, sl_header_id, tr_header_id, TO_CHAR(record_dt, ' + formatSQL + ') FROM public.info_summary_check  WHERE pin IN (%L) AND record_dt IN (%L)', pin, recordDt);

    return new Promise(async (resolve, reject) => {
        (async () => {
            var client = await pool.connect()
            try {
                await client.query(selectData).then(async res => {
                    res = JSON.stringify(res.rows)
                    let obj = JSON.parse(res)
                    if (obj.length === 1) {//exists in table
                        // //update header
                    }
                    if (obj.length === 0) {//not exists in table
                        //insert ค่าที่ยังไม่มีใน table info_summary_check
                        await createSummaryCheck(arr)
                    }
                    resolve(result_update)
                })
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))
    })
}

//function query data from info_summary_check for auto insert process
async function querySummary(pin, recordDt) {
    return await modelInfoSummary.
        findAll({
            where: {
                pin: pin,
                recordDt: recordDt
            },
            include: [{
                all: true
            }], raw: true,
        }).then(async res => {
            if (res.length == 1) {//exist in table

            }
            if (res.length == 0) {//not exist in table
                let obj = await mapToArraySummary(pin, recordDt, '', 'auto_insert');//map to array obj
                let auto_insert = await createSummaryCheck(obj);//auto insert 
            }
            return res;
        })
}

//function convert time to other unit.
function convertMS(ms) {
    var day, hour, minute, second;
    second = Math.floor(ms / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return second;
};

let mockList = [
    { pin: '80000001', ssn: '31001' },//correct 
    { pin: '80500002', ssn: '31002' },//correct
    { pin: '8000003', ssn: '31003' },
    { pin: '80000004', ssn: '31004' },//correct
    { pin: '80100005', ssn: '31005' },//correct
    { pin: '80300006', ssn: '31006' },
    { pin: '80200007', ssn: '31007' },
]

let ssnToFind = ['31002', '1', '31003', '31004']

let prefix = {
    shopPIN: /^(800|801)[0-9]{5}/,
    tmpPIN: /^(80)5[0-9]{5}/
}

const testMapPIN = async (list, ssn) => {
    // list = mockList;
    // ssn = ssnToFind;
    let newListArray = [];
    console.log(list)
    //loop for check pattern of pin is coreect ?
    for (let i = 0; i < list.length; i++) {
        let checkShop = prefix.shopPIN.test(list[i].pin);
        let checkTmp = prefix.tmpPIN.test(list[i].pin);
        if (checkShop) {
            newListArray.push(list[i])
        }
        if (checkTmp) {
            newListArray.push(list[i])
        }
        if (!checkShop && !checkTmp) {
        }
    }

    for (let j = 0; j < ssn.length; j++) {
        let obj = newListArray.find(array => array.ssn === ssn[j]);//map pin in list by ssn
        if (obj != undefined) {
            // console.log(obj);
        }

    }
}

//function query ssn to create mockup PIN
module.exports.querySSN = async (req, res) => {
    let obj = {};
    let ssnArr = [];
    let list = [];
    return await modelInfoSummary.
        findAll({
            include: [{
                all: true
            }], raw: true,
        }).then(res => {
            console.log(res.length)
            for (let i = 0; i < res.length; i++) {
                if (!ssnArr.includes(res[i].pin)) {
                    ssnArr.push(res[i].pin)
                    if (i % 2 === 0) {
                        obj.pin = '8000000' + i;
                        obj.ssn = res[i].pin;
                    }
                    else {
                        obj.pin = '8050000' + i;
                        obj.ssn = res[i].pin;
                    }
                }
            } console.log(list)
                    return list;
            //   return list;

        })

}
