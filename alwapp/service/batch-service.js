const modelTrHeader = require('../models').TxTrHeader;
const modelTrDetail = require('../models').TxTrDetail;
const modelSlHeader = require('../models').TxSlHeader;
const modelSlDetail = require('../models').TxSlDetail;
const modelinfoSummary = require('../models').InfoSummaryCheck;
const model = require('../models');
const chokidar = require('chokidar');
const watch = require('node-watch');
const csv = require('csvtojson');
const moment = require('moment');
const fs = require('fs');
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

let format = 'YYYY-MM-DD HH:mm:ss';
let dateFormat = 'YYYY-MM-DD';
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
var myClient;

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

module.exports.importTR = (req, res) => {
    console.log('import TR')
    let pathWatchTR = getPath('TR')
    let watcher = chokidar.watch(pathWatchTR, { ignored: /^\./, persistent: true });
    let objFileTR = [];
    watcher
        .on('add' || 'change', async function (path) {
            // console.log('File in TR', path, 'has been added or change');
            let rename = await renameToDAT('TR', path);
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
    let pathWatchSL = getPath('SL')
    let watcher = chokidar.watch(pathWatchSL, { ignored: /^\./, persistent: true });
    await watcher
        .on('add' || 'change', async function (path) {
            // console.log('File in SL', path, 'has been added or change');
            let rename = await renameToDAT('SL', path);
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
    if (param === 'SL') {
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
    if (param === 'TR') {
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
    if (param === 'SL') {
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
    if (param === 'TR') {
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

async function renameToDAT(param, file) {
    let dat_path;
    let filename = path.parse(file).name;
    if (param === 'TR') {
        dat_path = getPath('TR') + filename + '.dat'
    }
    if (param === 'SL') {
        dat_path = getPath('SL') + filename + '.dat'
    }
    if (path.parse(file).ext == '.csv') {
        fs.rename(file, dat_path, async function (err) {
            if (err) console.log(err)
            console.log('rename to dat')
            let sync = await createSyncFile(dat_path);
        })
    }
    return dat_path;
}

function createSyncFile(dat_path) {
    let dat_file, sync_file, dir;
    dat_file = path.parse(dat_path).name;
    dir = path.parse(dat_path).dir + '/';
    sync_file = dir + dat_file + '.sync';
    let sync_name = dir + dat_file;
    fs.writeFile(sync_file, dat_file + '.dat', async function (err) {
        if (err) throw err;
        console.log('create sync file');
        let read = await readDataToObj(sync_name);
    });
    return sync_name;
}

function readDataToObj(sync_path) {
    let sync_name = path.parse(sync_path).name;
    let dir = path.parse(sync_path).dir;
    let dir_name = path.parse(dir).name;
    let dat = sync_path + '.dat';
    let dat_proc = sync_path + '.dat.proc';
    let sync = sync_path + '.sync';
    let sync_proc = sync_path + '.sync.proc';
    if (fs.existsSync(sync)) {
        fs.rename(sync, sync_proc, function (err) {
            if (err) console.log(err)
            if (fs.existsSync(dat)) {
                fs.rename(dat, dat_proc, async function (err) {
                    if (err) console.log(err)
                    console.log('read data')
                    let add = await addToObj(dir_name, dat_proc)
                    getnameSync(sync_proc); //get name of sync proc file
                });
            }
        });
    }
    return dat_proc;
}

function getnameSync(sync_proc) {
    let sync_name = path.parse(sync_proc).name;
    return sync_name;
}

async function addToObj(param, filepath) {
    let sum = -2; //delete header file 2 line
    console.log(param + ' adding obj')
    let objTR = [], data = [];
    let arr_file = [];
    let file_split;
    let file = path.parse(filepath).name;
    let filename = path.parse(file).name;
    let start = new Date().getTime();// startto count time
    var LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader(filepath);
    lr.on('error', function (err) {
        // 'err' contains error object
    });
    lr.on('line', function (line) {
        objTR.push(line);
        if (line === '') {
            // sum--;
        } else {
            sum++;
        }
    });
    lr.on('end', async function () {
        let obj_summary = {};
        data = chunk(objTR.slice(3), 1000)
        // let headerId = await createHeader(filename, param, sum)
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
            await readInSplit(arr_file[j], param, 'headerId').then(async (obj) => {
                // await createDetail(param, obj)
                for (let x = 0; x < obj.length; x++) {
                    arr_summary = obj[x];
                    let check = true;
                    if (param == 'SL') {
                        //check if element in array qre equal don't push
                        for (let loop = 0; loop < arr.length; loop++) {
                            let ans = arr[loop];
                            if (ans[0] === arr_summary[2] && ans[1] === arr_summary[4]) {
                                check = false
                                break;
                            }
                        }
                        //arr_summary[2] is ssn , arr_summay[4] is schedule date in file SL
                        if (check)
                            arr.push(mapToArraySummary(arr_summary[2], arr_summary[4], 'headerId', param))
                    }
                    else if (param == 'TR') {
                        //check if element in array qre equal don't push
                        for (let loop = 0; loop < arr.length; loop++) {
                            let ans = arr[loop];
                            if (ans[0] === arr_summary[2] && ans[1] === arr_summary[5]) {
                                check = false
                                break;
                            }
                        }
                        //arr_summary[2] is ssn , arr_summay[5] is schedule date in file TR
                        if (check)
                            arr.push(mapToArraySummary(arr_summary[2], arr_summary[5], 'headerId', param))
                    }
                }
            });
        }
        console.log(param + ' stamp all data to db');

        let end = new Date().getTime();
        let time = end - start;
        let second = convertMS(time)
        console.log(param + ' File success on ' + second + ' second')
       
        let pin = [];
        let sl, tr;

        if (param === 'SL') {
            await createSummaryCheck(arr);
            console.log('insert to summary check success')
        }
        //เก็บ pin จากอาเรย์ที่ได้หลังจากตัดตัวซ้ำ เพื่อเอาไป query ต่อ 
        for (let y = 0; y < arr.length; y++) {
            let sub_arr = [];
            sub_arr = arr[y];
            if (!pin.includes(sub_arr[0])) {
                pin.push(sub_arr[0]);
            }
            sl = sub_arr[2]; //sl flag
            tr = sub_arr[3];//tr flag
        }
        //update data in info_summary_check
        await checkFile_update(arr, pin, sl, tr);

        //move .dat.proc and .sync.proc to archire folder (ไฟล์หลัก) 
        let sync_proc = getPath(param) + filename + '.sync.proc';
        moveFile(param, filepath)
        moveFile(param, sync_proc)
    });
}

async function checkFile_update(arr, pin, sl_flag, tr_flag) {
    let result = {};
    //SL before TR
    if (sl_flag === 'Y' && tr_flag === 'N') {
        let data_update;
        for (let x = 0; x < pin.length; x++) {
            //query data ว่ามี pin นี้รึยังใน TR 
            data_update = await getSummaryCheck(pin[x]);
            if (data_update !== undefined) {
                for (let t = 0; t < arr.length; t++) {
                    let a = arr[t];
                    if (a[0] === data_update.ssn) {
                        a[3] = 'Y';//tr flag
                        result.flag = a[3];
                        result.pin = data_update.ssn;
                        result.headerId = data_update.headerId;
                    }
                }
            }
            //update headerId and Tr_flag
            await updateFlag(result)
        }
    }
    //insert TR before SL
    if (sl_flag === 'N' && tr_flag === 'Y') {
        let data_update;
        for (let x = 0; x < pin.length; x++) {
            data_update = await getSummaryCheck(pin[x]);
            if (data_update !== undefined) {
                for (let t = 0; t < arr.length; t++) {
                    let a = arr[t];
                    if (a[0] === data_update.ssn) {
                        a[2] = 'Y';//sl flag
                        result.flag = a[2];
                        result.pin = data_update.ssn;
                        result.headerId = data_update.headerId;
                    }
                }
            }
            await updateFlag(result)
        }
    }
    console.log('update to info_summary success')
}

function mapToArraySummary(pin, recordDt, headerId, param) {
    let sl_flag, tr_flag, sl_headerId, tr_headerId, sum_flag, sum_startDt, sum_endDt;
    let today = moment();
    let today_dt = moment(today).format(dateFormat);
    sum_flag = 'N';
    sum_startDt = today_dt;
    sum_endDt = today_dt;
    if (param == 'SL') {
        sl_headerId = headerId;
        sl_flag = 'Y';
        tr_flag = 'N';
    }
    else if (param == 'TR') {
        tr_headerId = headerId;
        sl_flag = 'N';
        tr_flag = 'Y';
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
        await csv({
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
                    resolve(obj)
                })
            })
    })
}

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
}

async function createSummaryCheck(obj) {
    let insertData = pgFormat('INSERT INTO public.info_summary_check (pin, record_dt, sl_flag, tr_flag, sl_header_id, tr_header_id, gen_sum_flag, gen_sum_start_dt, gen_sum_end_dt) VALUES %L', obj);
    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query(insertData)
        } finally {
            client.release()
        }
    })().catch(e => console.error(e.message, e.stack))
}

const updateFlag = async (req, res) => {
    let updateData = pgFormat('UPDATE public.info_summary_check SET tr_flag = %L , tr_header_id = %L WHERE pin = %L', req.flag, req.headerId, req.pin);

    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query(updateData)
        } finally {
            client.release()
        }
    })().catch(e => console.error(e.message, e.stack))
}

const getSummaryCheck = async (req, res) => {
    let result = {};
    return await modelTrDetail.
        findAll({
            where: {
                ssn: req,
            },
            include: [{
                all: true
            }], raw: true,
        }).then(res => {
            for (let i = 0; i < res.length; i++) {
                result.ssn = res[i].ssn;
                result.headerId = res[i].headerId
                return result;
            }
        })
}



let mockPin = {
    emp_id: '539453'
}

module.exports.testQuery = async (req, res) => {
    req = mockPin;
    return await modelSlDetail.
        findAll({
            where: {
                emp_id: req.emp_id,
            },
            include: [{
                all: true
            }], raw: true,
        }).then(res => {
            return res;
        })
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
    return second;
};
