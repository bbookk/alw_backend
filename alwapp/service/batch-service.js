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

let format = 'MM/DD/YYYY HH:mm:ss';
let dateFormat = 'MM/DD/YYYY 00:00:00';
const keyPath = batchConfig.local.keyPath;

//pattern prefix pin 
let prefix = {
    shopPIN: new RegExp(batchConfig.local.prefix.shopPIN),
    tmpPIN: new RegExp(batchConfig.local.prefix.tmpPIN)
}

const config = batchConfig.local.config_database;

const pool = new Pool(config);

module.exports.copyFromNas = async (req, res) => {
    logger.info('start : copy file from NAS');
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
    logger.info(' end : copy file from NAS');
    // console.log('copy file from NAS success');
}

module.exports.importTR = async (req, res) => {
    logger.info('start : import TR file');
    // console.log('import TR')
    let pathTR = getPath(keyPath.TR)
    let watcher = chokidar.watch(pathTR, { ignored: /^\./, persistent: true });
    await watcher
        .on('add' || 'change', async function (file) {
            if (path.parse(file).ext === '.dat') {
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
    logger.info('start : import SL file');
    // console.log('import SL file')
    let pathSL = getPath(keyPath.SL)
    let watcher = chokidar.watch(pathSL, { ignored: /^\./, persistent: true });
    await watcher
        .on('add' || 'change', async function (file) {
            if (path.parse(file).ext === '.dat') {
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
    logger.info('start : create header');
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
    logger.info('end : create header');
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
                logger.info('end : update SL headerStatus');
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
                logger.info('end : update TR headerStatus');
            }
        })().catch(e => console.error(e.message, e.stack))
    }
}

async function createDetail(param, objTR) {
    if (param === keyPath.SL) {
        let insertData = pgFormat('INSERT INTO public.tx_sl_detail (header_id, emp_id, ssn, activity, schedule_date, start_dt, stop_dt, exec_date, is_paid, time_zone, create_dt, create_by) VALUES %L', objTR);
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
        let insertData = pgFormat('INSERT INTO public.tx_tr_detail (header_id, modify, ssn, agent_name, last_update_dt, last_update_time, last_update_by, is_approve, organize_name, time_zone, activity, schedule_date, start_dt, exec_dt, stop_dt, duration, is_paid, time_source_code, event_type, create_dt, create_by) VALUES %L', objTR);
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
        let start_date = jsonObj.field4;
        let start_time = jsonObj.field5;
        let end_date = jsonObj.field6;
        let end_time = jsonObj.field7;
        let startDt = moment(start_date + start_time, format).format(format);
        let endDt = moment(end_date + end_time, format).format(format);
        let scheduleDt = moment(start_date + '00:00:00', format).format(format);
        let execDt = moment(end_date + '00:00:00', format).format(format);
        if (jsonObj.field8 == 'true') {
            jsonObj.field8 = 'Y'
        }
        if (jsonObj.field8 == 'false') {
            jsonObj.field8 = 'N'
        }
        return [
            headerId,
            jsonObj.field1, //emp_id
            jsonObj.field2, //ssn
            jsonObj.field3, //activity
            scheduleDt,
            startDt,
            endDt,
            execDt,
            jsonObj.field8, //is paid
            jsonObj.field9, //time zone
            today_dt, //create date
            'batch'] //create by
    }
    else if (keyPath.TR === param) {
        let agentName = jsonObj.field3 + ' ' + jsonObj.field4;
        let lastUpdDt = moment(jsonObj.field5 + '00:00:00', format).format(format);
        let lastUpdTime = moment(jsonObj.field5 + jsonObj.field6, format).format(format);
        let start_date = jsonObj.field12;
        let start_time = jsonObj.field13;
        let end_date = jsonObj.field14;
        let end_time = jsonObj.field15;
        let startDt = moment(start_date + start_time, format).format(format);
        let endDt = moment(end_date + end_time, format).format(format);
        let scheduleDt = moment(start_date + '00:00:00', format).format(format);
        let execDt = moment(end_date + '00:00:00', format).format(format);
        if (jsonObj.field8 == 'true') {
            jsonObj.field8 = 'Y'
        }
        if (jsonObj.field8 == 'false') {
            jsonObj.field8 = 'N'
        }
        if (jsonObj.field17 == 'true') {
            jsonObj.field17 = 'Y'
        }
        if (jsonObj.field17 == 'false') {
            jsonObj.field17 = 'N'
        }
        return [
            headerId,
            jsonObj.field1, //modify
            jsonObj.field2, //ssn
            agentName,
            lastUpdDt,
            lastUpdTime,
            jsonObj.field7, //last update by
            jsonObj.field8, //isApprove 
            jsonObj.field9, //OrgName
            jsonObj.field10, //time zone
            jsonObj.field11, //activity
            scheduleDt,
            startDt,
            execDt,
            endDt,
            jsonObj.field16, //duration
            jsonObj.field17, //is paid
            jsonObj.field18, //time source code
            jsonObj.field19, //event type
            today_dt, //create date
            'batch'] //create by
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
    let beforeConvertdate = moment(date, format);
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
    let sync_file = txt_path.replace('.dat', '.sync');
    fs.writeFile(sync_file, txt_fileName, async function (err) {
        if (err) throw err;
        // console.log('create sync file');
        logger.info('end : create sync file');
    });
    return sync_file;

}

function renameToProcess(syncPath) {
    let syncProc = syncPath + '.proc';
    let txtName = syncPath.replace('.sync', '.dat');
    let txtProc = txtName + '.proc';
    let dirName = path.parse(path.parse(syncPath).dir).name;
    if (fs.existsSync(syncPath)) {
        fs.rename(syncPath, syncProc, function (err) {
            if (err) console.log(err)
            if (fs.existsSync(txtName)) {
                fs.rename(txtName, txtProc, async function (err) {
                    if (err) console.log(err)
                    // console.log('read data')
                    logger.info('start : read data');
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
    // console.log(filename + ' adding obj')
    let value = {};
    value.filepath = filepath;
    value.param = param;

    let dataInfo = await splitFileAndReadToStamp(value);

    let time = checkTime(start)
    logger.info(filename + ' stamp all data to db success on ' + time.minute + ' minute ' + time.second + ' second')

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
    logger.info('start :' + param + ' inserting to info_summary_check')

    for (let k = 0; k < ssn.length; k++) {
        if (ssn[k] !== '') {
            let dataUpdate = await insertOrUpdateSummaryCheck(ssn[k], recordDt[k], dataInfo[k]);
        }
    }

    await updateInfoSummaryProcess(dataInfo, param);
    logger.info('end :' + param + ' update flag and HeaderId in info_summary_check')

    let timeUpdate = checkTime(start_update);
    logger.info('end :' + param + ' insert and update on info_summary_check success on ' + timeUpdate.minute + ' minute ' + timeUpdate.second + ' second')
    // console.log('insert and update success on ' + timeUpdate + ' second')

    //move .txt.proc and .sync.proc to archire folder (ไฟล์หลัก) 
    let syncProc = getPath(param) + filename + '.sync.proc';
    moveFile(param, filepath)//move file .txt.proc
    moveFile(param, syncProc)//move file .sync.proc

    await autoInsertProcess();
}

async function splitFileAndReadToStamp(value) {
    let filepath = value.filepath;
    let file = path.parse(filepath).name;//file.txt or file.sync
    let filename = path.parse(file).name;//filename not have extension file
    let param = value.param;
    let objTR = [], data = [];
    let arr_file = [];
    let file_split;
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
            if (param == keyPath.SL) {
                data = chunk(objTR.slice(2), 1000)
            }
            if (param == keyPath.TR) {
                data = chunk(objTR.slice(1), 1000)
            }

            // let headerId = await createHeader(filename, param, sum)//create headerId to stamp in db
            let headerId = 0;
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
                    // await createDetail(param, obj) //stamp obj in split file to db
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
                if (subArray[0] === arr_summary[2] && subArray[1] === arr_summary[11]) {
                    check = false
                    break;
                }
            }
            //arr_summary[2] is ssn , arr_summay[11] is schedule date in file TR
            if (check)
                //array is have not same primary key (pin + recordDt)
                arr.push(mapToArraySummary(arr_summary[2], arr_summary[11], headerId, param))
        }
    }
    return arr;
}

async function updateInfoSummaryProcess(arr, param) {
    logger.info('start : updating in info_summary_check')
    // logger.debug('update process')
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
                    // logger.debug('start update')
                    await updateInfoSummary(flag, headerIdArr, pinArr, recordDtArr, param);
                    // logger.debug('end update')
                }
                if (param === keyPath.TR) {
                    sub_arr[3] = 'Y';
                    pinArr = sub_arr[0];
                    recordDtArr = sub_arr[1];
                    flag = sub_arr[3];
                    headerIdArr = sub_arr[5];
                    // logger.debug('start update')
                    await updateInfoSummary(flag, headerIdArr, pinArr, recordDtArr, param);
                    // logger.debug('end update')
                }
            }
        }
    }
}

async function autoInsertProcess() {
    let dataFromInfo = await querySSN();
    // ทำ auto insert กรณีวัน off
    let startTime = new Date();
    logger.info('start : auto insert process')
    for (let index = 0; index < dataFromInfo.ssn.length; index++) {
        let auto_insert = await getDate(dataFromInfo.ssn[index], dataFromInfo.startDt, dataFromInfo.endDt);
    }
    let time = checkTime(startTime);
    logger.info('end : auto insert process ' + time.minute + ' minute ' + time.second + ' second')
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
    logger.info('start :' + param + ' move file to archive')
    var oldPath = filepath;
    let filename = path.parse(oldPath).name;
    var newPath = archire + param + '/' + filename + '.proc';
    var name = archire + param + '/' + filename;
    fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
        fs.rename(newPath, name, function (err) {
        })
    })

    logger.info('end :' + param + ' move file to archive')
}

//function to insert data from SL,TR to info_summary_check table
async function createSummaryCheck(obj) {
    logger.debug('insert to info')
    let insertData = pgFormat('INSERT INTO public.info_summary_check (ssn, record_dt, sl_flag, tr_flag, sl_header_id, tr_header_id, gen_sum_flag, gen_sum_start_dt, gen_sum_end_dt) VALUES (%L)', obj);
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
async function updateInfoSummary(flag, headerId, ssn, recordDt, param) {
    if (param === keyPath.SL) {
        // logger.debug('update SL')
        let updateData = pgFormat('UPDATE public.info_summary_check SET sl_flag = %L , sl_header_id = %L WHERE ssn = %L AND record_dt = %L', flag, headerId, ssn, recordDt);
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
        // logger.debug('update TR')
        let updateData = pgFormat('UPDATE public.info_summary_check SET tr_flag = %L , tr_header_id = %L WHERE ssn = %L AND record_dt = %L', flag, headerId, ssn, recordDt);
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

//function for get date in this month to auto insert process
async function getDate(ssn, startDt, endDt) {
    let firstDay = new Date(startDt);
    let lastDay = new Date(endDt);
    let obj = {};

    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
        let day = new Date(d);
        let convertDay = moment(day).format('YYYY-MM-DD 00:00:00');

        obj.ssn = ssn;
        obj.date = convertDay;

        // query เพื่อดูว่าใน table info_summary_check และทำ auto_insert 
        if (ssn !== '') {
            let data = await querySummary(obj);
        }
    }
}

//function query data from info_summary_check for check pin and recordDt are exist ?
async function insertOrUpdateSummaryCheck(ssn, recordDt, arr) {
    logger.debug('insert process')
    let formatSQL = "'YYYY-MM-DD HH24:MI:ss'";
    let selectData = pgFormat('SELECT ssn, sl_header_id, tr_header_id, TO_CHAR(record_dt, ' + formatSQL + ') FROM public.info_summary_check WHERE ssn IN (%L) AND record_dt IN (%L)', ssn, recordDt);

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
                    (async () => {
                       await createSummaryCheck(arr) 
                    })
                }
            })
        } finally {
            client.release()
        }
    })().catch(e => console.error(e.message, e.stack))
}

//function query data from info_summary_check for auto insert process
async function querySummary(obj) {
    return await modelInfoSummary.
        findAll({
            where: {
                ssn: obj.ssn,
                recordDt: obj.date
            }
        }).then(async res => {
            if (res.length == 1) {//exist in table
            }
            if (res.length == 0) {//not exist in table
                let data = mapToArraySummary(obj.ssn, obj.date, '', 'auto_insert');//map to array obj
                await createSummaryCheck(data)
            }
            // return data;
        })
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
            resolve(result)
        })
    })
}

function checkTime(startTime) {
    let timeObj = {}
    let endTime = new Date().getTime();
    let time = endTime - startTime;
    let convertMinute = convertMS(time)
    let convertSecond = convertMS(time)
    timeObj.minute = convertMinute.minute;
    timeObj.second = convertSecond.second;
    return timeObj;
}

//function convert time to other unit.
function convertMS(ms) {
    let time = {};
    var day, hour, minute, second;
    second = Math.floor(ms / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    time.second = second;
    time.minute = minute;
    return time;
};

const mapPIN = async (list, ssn) => {
    let newListArray = [];
    logger.info('start : map pin process')
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
            await updatePIN(obj)
        }
    }
    logger.info('end : update pin in table')
    logger.info('end : all process')
}

//update pin after map pin by ssn success
const updatePIN = (req, res) => {
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

async function mapPinProcess(ssn) {
    logger.info('map pin process')
    let agent = await cdpService.getAllAgents();

    let list = [];

    for (let i = 0; i < agent.length; i++) {
        list.push(agent[i])
    }
    await mapPIN(list, ssn);
}
