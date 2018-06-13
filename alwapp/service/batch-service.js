const modelTrHeader = require('../models').TxTrHeader;
const modelTrDetail = require('../models').TxTrDetail;
const modelSlHeader = require('../models').TxSlHeader;
const modelSlDetail = require('../models').TxSlDetail;
const modelInfoSummary = require('../models').InfoSummaryCheck;
const cdpService = require('../service/cbp-service')
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
const constant = require('../../alwapp/class/constant').Constant;
const batchConfig = require('../config/batch-config.json')
const LineByLineReader = require('line-by-line')
const logger = require('./log-service')

let localPathSL = batchConfig.local.localPathSL;
let localPathTR = batchConfig.local.localPathTR;
let localPath = batchConfig.local.localPath;
let nasPath = batchConfig.local.nasPath;
let archire = batchConfig.local.archive;

let format = 'YYYY-MM-DD HH:mm:ss';
let dateFormat = 'YYYY-MM-DD 00:00:00';
const keyPath = batchConfig.local.keyPath;

//pattern prefix pin 
let prefix = {
    shopPIN: new ReqExp(batchConfig.local.prefix.shopPIN),
    tmpPIN: new ReqExp(batchConfig.local.prefix.tmpPIN)
}

const config = batchConfig.local.config_database;

const pool = new Pool(config);

module.exports.copyFromNas = async (req, res) => {
    logger.info('start copy file from NAS');
    var dir_name = getDirectories(nasPath);
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
    logger.info('copy file from NAS success');
    console.log('copy file from NAS success');
}

module.exports.importTR = async (req, res) => {
    logger.info('start import TR');
    console.log('import TR')
    let pathTR = getPath(keyPath.TR)
    let watcher = chokidar.watch(pathTR, { ignored: /^\./, persistent: true });
    let txtFile = [];
    let syncFile = [];
    await watcher
        .on('add' || 'change', async function (file) {
            if (path.parse(file).ext === '.txt') {
                // console.log('File in TR', file, 'has been added or change');
                let sync = await createSyncFile(file);
            }
            if (path.parse(file).ext === '.sync') {
                // console.log('File sync TR has been added or change');
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

module.exports.importSL = async (req, res) => {
    logger.info('start import SL');
    console.log('import SL file')
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
async function createHeader(file, param) {
    let today = moment();
    let today_dt = moment(today).format(format);
    let header, headerId;
    if (param === keyPath.SL) {
        header = await modelSlHeader.create({
            fileName: file,
            recSuccess: '0',
            recFail: '0',
            status: 'fail',
            errorMsg: '',
            createDt: today_dt,
            createBy: 'batch',
        })
    }
    if (param === keyPath.TR) {
        header = await modelTrHeader.create({
            fileName: file,
            recSuccess: '0',
            recFail: '0',
            status: 'fail',
            errorMsg: '',
            createDt: today_dt,
            createBy: 'batch',
        })
    }
    headerId = header.dataValues.headerId;
    logger.info('create header success');
    return headerId;
}

function updateStatusHeader(param, obj) {
    if (param === keyPath.SL) {
        let updateData = pgFormat('UPDATE public.tx_sl_header SET rec_success = %L , rec_fail = %L , status = %L WHERE header_id = %L', obj.recSuccess, obj.recFail, obj.status, obj.headerId);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(updateData)
            } finally {
                client.release()
                logger.info('update status SL header success');
            }
        })().catch(e => console.error(e.message, e.stack))
    }
    if (param === keyPath.TR) {
        let updateData = pgFormat('UPDATE public.tx_tr_header SET rec_success = %L , rec_fail = %L , status = %L WHERE header_id = %L', obj.recSuccess, obj.recFail, obj.status, obj.headerId);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(updateData)
            } finally {
                client.release()
                logger.info('update status TR header success');
            }
        })().catch(e => console.error(e.message, e.stack))
    }
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
                logger.info('stamp data SL success');
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
                logger.info('stamp data TR success');
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
    logger.info('map data to json');
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
        logger.info('create sync file');
    });
    return sync_file;

}

function renameToProcess(syncPath) {
    console.log('rename to proc');
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
                    logger.info('rename to proc');
                    await addToObj(dirName, txtProc)
                    getnameSync(syncProc); //get name of sync proc file
                });
            }
        });
    }
}

function getnameSync(sync_proc) {
    let sync_name = path.parse(sync_proc).name;
    return sync_name;
}

async function addToObj(param, filepath) {
    let start = new Date().getTime();// startto count time
    let file = path.parse(filepath).name;//file.txt or file.sync
    let filename = path.parse(file).name;//filename not have extension file
    console.log(filename + ' adding obj')
    let value = {};
    value.filepath = filepath;
    value.param = param;

    let dataInfo = await splitFileAndReadToStamp(value);

    let second = checkTime(start)
    console.log(filename + ' stamp all data to db success on ' + second + ' second')
    let ssn = [];//เก็บค่า ssn ที่มีใน arr 
    let ssnUnique = [];//เก็บค่า pin เพื่อเอาไปจับคู่กับ recordDt ทั้งหมดในเดือน เพื่อเอาไปทำ auto insert ต่อไป
    let recordDt = [];//เก็บค่า recordDt ที่มีใน arr 

    // เก็บ pin , recordDt จากอาเรย์ที่ได้หลังจากตัดตัวซ้ำ เพื่อเอาไป query ต่อ 
    for (let y = 0; y < dataInfo.length; y++) {
        let subArr = [];
        let objSSN = {};
        subArr = dataInfo[y];
        ssn.push(subArr[0]);
        recordDt.push(subArr[1]);

        if (!ssnUnique.includes(subArr[0])) {
            ssnUnique.push(subArr[0]) //pin to query for auto_insert process
            objSSN.ssn = subArr[0];
        }
    }

    let start_update = new Date().getTime();// start to count time
    console.log('inserting to info_summary_check....')
    for (let k = 0; k < ssn.length; k++) {
        //query pin , headerId , recordDt from info_summary_check 
        //เพื่อดูว่ามีใน table รึยังถ้ามีก็ update header ถ้าไม่มีก็ insert ลงไปใหม่
        if (ssn[k] !== '') {
            // console.log(ssn[k] + ' '+ recordDt[k] + ' ' + dataInfo[k])
            let dataUpdate = await getSummaryCheck(ssn[k], recordDt[k], dataInfo[k], param);
        }
    }

    await updateInfoSummaryProcess(dataInfo, param);

    let timeUpdate = checkTime(start_update);
    console.log('insert and update success on ' + timeUpdate + ' second');

    //move .txt.proc and .sync.proc to archire folder (ไฟล์หลัก) 
    let syncProc = getPath(param) + filename + '.sync.proc';
    moveFile(param, filepath)//move file .txt.proc
    moveFile(param, syncProc)//move file .sync.proc

    if (param === keyPath.SL) {
        console.log('auto insert process')
        await autoInsertProcess();
    }

    await mapPinProcess(ssnUnique)

}

async function splitFileAndReadToStamp(value) {
    logger.info('start read data from file');
    let filepath = value.filepath;
    let param = value.param;
    let objTR = [], data = [];
    let arr_file = [];
    let file_split;
    let file = path.parse(filepath).name;//file.txt or file.sync
    let filename = path.parse(file).name;//filename not have extension file
    let sum = -2; //delete header file 2 line
    let dataInfo = [];

    return new Promise(async (resolve, reject) => {
        lr = new LineByLineReader(filepath);//read data from main file line-by-line
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

            let headerId = await createHeader(filename, param, sum)//create headerId to stamp in db
            // let headerId = 0;
            logger.info('start split file');
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

            for (let j = 0; j < arr_file.length; j++) {
                await readInSplit(arr_file[j], param, headerId).then(async (obj) => {//read data in split file
                    await createDetail(param, obj) //stamp obj in split file to db
                    let arr = await mapToArrayPrimaryKey(param, obj, headerId);
                    for (let i = 0; i < arr.length; i++) {
                        if (!dataInfo.includes(arr[i])) {
                            dataInfo.push(arr[i])
                        }
                    }
                });
            }

            dataInfo.sort();

            let objHeader = {};
            objHeader.headerId = headerId;
            objHeader.recSuccess = sum;
            objHeader.recFail = '0';
            objHeader.status = 'success';

            await updateStatusHeader(param, objHeader)
            resolve(dataInfo)

        });
    })

}

async function mapToArrayPrimaryKey(param, obj, headerId) {
    logger.info('map data from file with primary key');
    let arr = [];
    let arr_summary = [];
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
    return arr;
}

async function updateInfoSummaryProcess(arr, param) {
    logger.info('updating info_summary_check....')
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
                    await updateInfoSummary(flag, headerIdArr, pinArr, recordDtArr, param);
                }
                if (param === keyPath.TR) {
                    sub_arr[3] = 'Y';
                    pinArr = sub_arr[0];
                    recordDtArr = sub_arr[1];
                    flag = sub_arr[3];
                    headerIdArr = sub_arr[5];
                    await updateInfoSummary(flag, headerIdArr, pinArr, recordDtArr, param);
                }
            }
        }
    }
}

async function autoInsertProcess() {
    let dataFromInfo = await querySSN();
    // ทำ auto insert กรณีวัน off
    console.log('auto inserting .....')
    logger.info('auto insert process')
    for (let index = 0; index < dataFromInfo.ssn.length; index++) {
        let auto_insert = await getDate(dataFromInfo.ssn[index], dataFromInfo.startDt, dataFromInfo.endDt);
    }
    console.log('auto insert success');
}

function mapToArraySummary(pin, recordDt, headerId, param) {
    logger.info('map data to array for insert to info_summary_check')
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
    logger.info('read data from split file');
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
    console.log('move to archive')
    logger.info('move file to archive')
    var oldPath = filepath;
    let filename = path.parse(oldPath).name;
    var newPath = archire + param + '/' + filename + '.proc';
    var name = archire + param + '/' + filename;
    fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
        fs.rename(newPath, name, function (err) {
        })
    })
}

//function to insert data from SL,TR to info_summary_check table
async function createSummaryCheck(obj) {
    let insertData = pgFormat('INSERT INTO public.info_summary_check (ssn, record_dt, sl_flag, tr_flag, sl_header_id, tr_header_id, gen_sum_flag, gen_sum_start_dt, gen_sum_end_dt) VALUES (%L)', obj);

    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query(insertData)
        } finally {
            client.release();
            logger.info('insert data to info_summary_check')
        }
    })().catch(e => console.error(e.message, e.stack))
}

//function for update sl_header tr_header and tr_flag sl_flagin info_summary_check
async function updateInfoSummary(flag, headerId, ssn, recordDt, param) {
    if (param === keyPath.SL) {
        let updateData = pgFormat('UPDATE public.info_summary_check SET sl_flag = %L , sl_header_id = %L WHERE ssn = %L AND record_dt = %L', flag, headerId, ssn, recordDt);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(updateData)
            } finally {
                client.release()
                logger.info('update SL_flag and SL_HeaderId in info_summary_check')
            }
        })().catch(e => console.error(e.message, e.stack))
    }

    if (param === keyPath.TR) {
        let updateData = pgFormat('UPDATE public.info_summary_check SET tr_flag = %L , tr_header_id = %L WHERE ssn = %L AND record_dt = %L', flag, headerId, ssn, recordDt);
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(updateData)
            } finally {
                client.release()
                logger.info('update Tr_flag and TR_HeaderId in info_summary_check')
            }
        })().catch(e => console.error(e.message, e.stack))
    }

}

//function for update sl_header in info_summary_check
async function updateHeaderId(headerId, ssn, recordDt) {
    let updateData = pgFormat('UPDATE public.info_summary_check SET sl_header_id = %L WHERE ssn = %L AND record_dt = %L', headerId, ssn, recordDt);

    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query(updateData)
        } finally {
            client.release()
            logger.info('update headerId in info_summary_check')
        }
    })().catch(e => console.error(e.message, e.stack))
}

//function for get date in this month to auto insert process
async function getDate(ssn, startDt, endDt) {
    let now = new Date();//current time
    let firstDay = new Date(startDt);
    let lastDay = new Date(endDt);

    logger.info('get date in SL file to fix range to auto_insert')
    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
        let day = new Date(d);
        let convertDay = moment(day).format('YYYY-MM-DD 00:00:00');
        // console.log(day)
        // query เพื่อดูว่าใน table info_summary_check และทำ auto_insert 
        if (ssn !== '') {
            await querySummary(ssn, convertDay);
        }
    }
}

//function query data from info_summary_check for check pin and recordDt are exist ?
async function getSummaryCheck(ssn, recordDt, arr, param) {
    let result_update = {};
    let formatSQL = "'YYYY-MM-DD HH24:MI:ss'";
    let selectData = pgFormat('SELECT ssn, sl_header_id, tr_header_id, TO_CHAR(record_dt, ' + formatSQL + ') FROM public.info_summary_check WHERE ssn IN (%L) AND record_dt IN (%L)', ssn, recordDt);

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
async function querySummary(ssn, recordDt) {
    // console.log(ssn)
    return await modelInfoSummary.
        findAll({
            where: {
                ssn: ssn,
                recordDt: recordDt
            },
            include: [{
                all: true
            }], raw: true,
        }).then(async res => {
            // console.log(res)
            if (res.length == 1) {//exist in table

            }
            if (res.length == 0) {//not exist in table
                let obj = mapToArraySummary(ssn, recordDt, '', 'auto_insert');//map to array obj
                let auto_insert = await createSummaryCheck(obj);//auto insert 
            }
            return res;
        })
}

function checkTime(startTime) {
    let endTime = new Date().getTime();
    let time = endTime - startTime;
    let second = convertMS(time)

    return second;
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

const mapPIN = async (list, ssn) => {
    let newListArray = [];
    let empType;
    logger.info('map pin process')
    //loop for check pattern of pin is coreect ?
    for (let i = 0; i < list.length; i++) {
        let checkShop = prefix.shopPIN.test(list[i]._pin);
        let checkTmp = prefix.tmpPIN.test(list[i]._pin);
        if (checkShop) {
            list[i].empType = 'Shop';
            // newListArray.push(list[i])
        }
        if (checkTmp) {
            list[i].empType = 'ACC'
            // newListArray.push(list[i])
        }
        if (!checkShop && !checkTmp) { }
        newListArray.push(list[i])
    }

    for (let j = 0; j < ssn.length; j++) {
        let obj = newListArray.find(array => array._loginId === ssn[j]);//map pin in list by ssn
        if (obj != undefined) {
            updatePIN(obj)
        }

    }
}

//update pin after map pin by ssn success
const updatePIN = (req, res) => {
    logger.info('update pin in info_summary_check')
    modelInfoSummary.update(
        {
            pin: req._pin,
            managerPin: req._managerPin,
            supervisorPin: req._supervisorPin
        },
        {
            where: { ssn: req._loginId }
        }
    )
}

//query ssn from info_summary check to crate auto insert 
const querySSN = async (req, res) => {
    let result = {};
    let ssn = [];
    let date = [];
    return new Promise(async (resolve, reject) => {
        modelInfoSummary.findAll({
            attributes: ['ssn', 'recordDt'],
        }).then(res => {
            for (let i = 0; i < res.length; i++) {
                let ssnQuery = res[i].dataValues.ssn;
                let dateQuery = moment(res[i].dataValues.recordDt);
                let convertDate = moment(dateQuery).format('YYYY-MM-DD')
                if (!ssn.includes(ssnQuery)) {
                    ssn.push(ssnQuery)
                }
                date.push(convertDate)
            }
            date.sort();
            result.ssn = ssn;
            result.startDt = date[0];
            result.endDt = date[date.length - 1];
            // console.log(result)
            resolve(result)
        })
    })
}

async function mapPinProcess(ssn) {
    // console.log(ssn)
    console.log('map pin process')
    let agent = await cdpService.getAllAgents();

    let list = [];

    for (let i = 0; i < agent.length; i++) {
        list.push(agent[i])
    }
    // list = [{
    //     _pin: '00001',
    //     _loginId: '31002',
    //     _managerPin: '1234567',
    //     _supervisorPin: '0000001'
    // },
    // {
    //     _pin: '00002',
    //     _loginId: '31005',
    //     _managerPin: '1456789',
    //     _supervisorPin: '00000123'
    // }]

    await mapPIN(list, ssn);
    // return list;

}

module.exports.testCallConst = async (req, res) => {


}

