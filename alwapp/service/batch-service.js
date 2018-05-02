const modelTrHeader = require('../models').TxTrHeader;
const modelTrDetail = require('../models').TxTrDetail;
const modelSlHeader = require('../models').TxSlHeader;
const modelSlDetail = require('../models').TxSlDetail;
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
var sortBy = require('sort-by')


// const txTRHeaderClass = require('../class/tx-tr-header');
// const trHeaderModelImpl = require('../models/impl/tx/tr-header-impl');

let localPathSL = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/SL/';
let localPathTR = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/TR/';
let localPath = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/';
let nasPath = 'C:/Users/dell-2018/Desktop/NAZ/';
let archire = 'C:/Users/dell-2018/Desktop/alw/app/alw/archire/';
let nasPathTR = 'C:/Users/dell-2018/Desktop/NAZ/TR/';

//let folder = getDirectories(localPath) + '/';

let format = 'YYYY-MM-DD HH:mm:ss';
let check = false;

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
            // TxSlDetailHeaderIdFkeys: objTR
            // [{
            //     organizeName: 'ACC',
            //     agentName: 'worawud',
            //     activity: objTR.activity_name,
            //     startDt: objTR.start_time,
            //     stopDt: objTR.end_time,
            //     createDt: '2017-03-03',
            //     createBy: 'batch',
            // }]
        }
            // , {
            //     include: [{
            //         model: modelSlDetail,
            //         as: 'TxSlDetailHeaderIdFkeys'
            //     }]
            // }
        )
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
            // TxTrDetailHeaderIdFkeys: objTR
            // [{
            //     organizeName: 'ACC',
            //     agentName: 'worawud',
            //     activity: objTR.activity_name,
            //     startDt: objTR.start_time,
            //     stopDt: objTR.end_time,
            //     createDt: '2017-03-03',
            //     createBy: 'batch',
            // }]
        }
            // , {
            //     include: [{
            //         model: modelTrDetail,
            //         as: 'TxTrDetailHeaderIdFkeys'
            //     }]
            // }
        )
    }
    headerId = header.dataValues.headerId;
    return headerId;
}

async function createDetail(param, objTR) {
    // let today = moment();
    // let today_dt = moment(today).format(format);

    if (param === 'SL') {
        let insertData = pgFormat('INSERT INTO public.tx_sl_detail (header_id, emp_id, ssn, activity, schedule_date, time_zone, start_dt, stop_dt, exec_date, create_dt, create_by) VALUES %L', objTR);
        // console.log(queryData)

        // with async/await 
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(insertData)
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))

        //  for (let i = 0; i < objTR.length; i++) {
        // await modelSlDetail.create(objTR
        //     {
        //     headerId: headerId,
        //     emp_id: objTR[i].emp_id,
        //     ssn: objTR[i].ssn,
        //     activity: objTR[i].activity,
        //     scheduleDate: objTR[i].scheduleDate,
        //     time_zone: objTR[i].time_zone,
        //     startDt: objTR[i].startDt,
        //     stopDt: objTR[i].stopDt,
        //     execDate: objTR[i].execDate,
        //     createDt: today_dt,
        //     createBy: 'batch',
        // }
        // )
        //  }
    }
    if (param === 'TR') {
        let insertData = pgFormat('INSERT INTO public.tx_tr_detail (header_id, modify, ssn, organize_name, agent_name, schedule_date, time_zone, activity, start_dt, stop_dt, create_dt, create_by) VALUES %L', objTR);

        // with async/await 
        (async () => {
            var client = await pool.connect()
            try {
                var result = await client.query(insertData)
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.message, e.stack))
        // for (let i = 0; i < 1; i++) {
        //     await modelTRDetail.create({
        //         headerId: headerId,
        //         modify: objTR[i].modify,
        //         ssn: objTR[i].ssn,
        //         organizeName: objTR[i].organizeName,
        //         agentName: objTR[i].agentName,
        //         scheduleDate: objTR[i].scheduleDate,
        //         time_zone: objTR[i].time_zone,
        //         activity: objTR[i].activity,
        //         startDt: objTR[i].startDt,
        //     })
        // }
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
let result = false;

async function addToObj(param, filepath) {
    let sum = -2; //delete header file 2 line
    console.log('adding obj')
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
        data = chunk(objTR.slice(3), 1000)
        // console.log(sum)
        let headerId = await createHeader(filename, param, sum)
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

            await readInSplit(arr_file[j], param, headerId).then(async (obj) => {
                await createDetail(param, obj)
            });
        }
        console.log('stamp all data to db')

        let end = new Date().getTime();
        let time = end - start;
        let second = convertMS(time)
        console.log(param + ' File success on ' + second + ' second')

        //move .dat.proc and .sync.proc to archire folder (ไฟล์หลัก) 
        let sync_proc = getPath(param) + filename + '.sync.proc';
        moveFile(param, filepath)
        moveFile(param, sync_proc)
    });
}

function readInSplit(filepath, param, headerId) {
    let obj = [];
    return new Promise(async (resolve, reject) => {
        const promises = []
        await csv({
            noheader: true,
            delimiter: ["|"]
        }).fromFile(filepath)
            .on('json', jsonObj => obj.push(mapJson2Obj(param, jsonObj, headerId)))
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

let mockPin = {
    emp_id: '539453'
}

// MOMENT_TZ = modelSlDetail.DATE.extend({
//     down: function (value) {
//         return moment(value);
//     },
//     up: function (date) {
//         return date.format('YYYY-MM-DD HH:mm:ss');
//     }
// });

module.exports.testQuery = async (req, res) => {
    req = mockPin;
    return await modelSlDetail.
        findAll({
            // scheduleDate: sequelize.cast(sequelize.col("schedule_date"), 'text'),
            where: {
                emp_id: req.emp_id,
            },
            include: [{
                all: true
            }], raw: true,
        }).then(res => {

            // objSL.sort();
            sortTime(objTR, 'true');
            // console.log(obj_ordered)
            // console.log(res);
            //    console.log(res)            
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

let objSL = [
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '22:00', stopDt: '01:00' },
    { tvid: '1048', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '01:00', stopDt: '04:00' },
    { tvid: '1048', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', execDate: '2017-11-12', startDt: '05:00', stopDt: '07:00' },
    // { tvid: '1047', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-10', time_zone: 'Asia/Bangkok', execDate: '2017-11-10', startDt: '23:00', stopDt: '01:00' },
    // { tvid: '1047', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-10', time_zone: 'Asia/Bangkok', execDate: '2017-11-10', startDt: '01:00', stopDt: '04:00' },
    // { tvid: '1047', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-10', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '05:00', stopDt: '08:00' },
    // { tvid: '1049', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-10', time_zone: 'Asia/Bangkok', execDate: '2017-11-10', startDt: '00:00', stopDt: '05:00' },
    // { tvid: '1049', ssn: '31049', activity: 'Meal', scheduleDate: '2017-11-10', time_zone: 'Asia/Bangkok', execDate: '2017-11-10', startDt: '05:00', stopDt: '08:00' },
    // { tvid: '1049', ssn: '31049', activity: 'Answer Calls', scheduleDate: '2017-11-10', time_zone: 'Asia/Bangkok', execDate: '2017-11-11', startDt: '08:00', stopDt: '10:00' }
]

function sortTime(list, overlap) {
    // let xxx = moment('2018-03-04 22:00:00', "YYYY-MM-DD" + format).add(1, 'days');
    if (overlap === 'true') {
        list.sort(function (a, b) {
            return Date.parse(a.startDt) - Date.parse(b.startDt);
        });
        for (let i = 0; i < list.length; i++) {
            console.log(list[i].startDt)
        }

    } else {
        list.sort(function (a, b) {
            // console.log( Date.parse('1970/01/01 ' + a.startDt.slice(0, -2) + ' ' + a.startDt.slice(-2)))
            return Date.parse('1970/01/01 ' + a.startDt.slice(0, -2) + ' ' + a.startDt.slice(-2)) - Date.parse('1970/01/01 ' + b.startDt.slice(0, -2) + ' ' + b.startDt.slice(-2))
        });

        for (let i = 0; i < list.length; i++) {
            console.log(list[i].startDt)
        }
    }
}

let objTR = [
    { modify: '1510364499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '22:00', stopDt: '22:03' },
    { modify: '1510365756', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '22:03', stopDt: '22:05' },
    { modify: '1510366077', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '22:05', stopDt: '22:08' },
    { modify: '1510366077', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '22:08', stopDt: '22:10' },
    { modify: '1510366705', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '22:10', stopDt: '22:15' },
    { modify: '1510366705', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '22:15', stopDt: '22:18' },
    { modify: '1510367334', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Rest Room', startDt: '22:18', stopDt: '22:23' },
    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '22:23', stopDt: '22:30' },
    { modify: '1510367963', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '22:30', stopDt: '22:36' },
    { modify: '1510368277', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '22:36', stopDt: '22:40' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '22:40', stopDt: '22:45' },
    { modify: '1510368591', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '22:45', stopDt: '22:49' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '22:49', stopDt: '22:52' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '22:52', stopDt: '22:54' },
    { modify: '1510368907', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '22:54', stopDt: '22:55' },
    { modify: '1510369550', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '22:55', stopDt: '23:02' },
    { modify: '1510369550', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:02', stopDt: '23:03' },
    { modify: '1510369550', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:03', stopDt: '23:05' },
    { modify: '1510369869', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:05', stopDt: '23:06' },
    { modify: '1510369869', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:06', stopDt: '23:11' },
    { modify: '1510370192', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '23:11', stopDt: '23:12' },
    { modify: '1510370192', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:12', stopDt: '23:13' },
    { modify: '1510370192', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:13', stopDt: '23:14' },
    { modify: '1510370510', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:14', stopDt: '23:17' },
    { modify: '1510370510', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:17', stopDt: '23:19' },
    { modify: '1510370827', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:19', stopDt: '23:24' },
    { modify: '1510370827', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '23:24', stopDt: '23:26' },
    { modify: '1510371145', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:26', stopDt: '23:28' },
    { modify: '1510371145', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '23:28', stopDt: '23:30' },
    { modify: '1510371145', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:30', stopDt: '23:31' },
    { modify: '1510371465', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:31', stopDt: '23:35' },
    { modify: '1510371465', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:35', stopDt: '23:36' },
    { modify: '1510372097', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:36', stopDt: '23:44' },
    { modify: '1510372097', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '23:44', stopDt: '23:46' },
    { modify: '1510372097', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:46', stopDt: '23:48' },
    { modify: '1510372416', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '23:48', stopDt: '23:49' },
    { modify: '1510372416', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:49', stopDt: '23:52' },
    { modify: '1510372416', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '23:52', stopDt: '23:53' },
    { modify: '1510372736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:53', stopDt: '23:57' },
    { modify: '1510372736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '23:57', stopDt: '23:58' },
    { modify: '1510373700', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '23:58', stopDt: '00:12' },
    { modify: '1510373700', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '00:12', stopDt: '00:14' },
    { modify: '1510374017', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:14', stopDt: '00:15' },
    { modify: '1510374017', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:15', stopDt: '00:17' },
    { modify: '1510374017', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:17', stopDt: '00:19' },
    { modify: '1510374335', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:19', stopDt: '00:22' },
    { modify: '1510374335', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:22', stopDt: '00:24' },
    { modify: '1510374653', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:24', stopDt: '00:29' },
    { modify: '1510374653', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:29', stopDt: '00:30' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '00:30', stopDt: '00:31' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:31', stopDt: '00:34' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:34', stopDt: '00:35' },
    { modify: '1510374971', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '00:35', stopDt: '00:36' },
    { modify: '1510375607', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:36', stopDt: '00:42' },
    { modify: '1510375607', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '00:42', stopDt: '00:43' },
    { modify: '1510375607', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:43', stopDt: '00:46' },
    { modify: '1510375924', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:46', stopDt: '00:49' },
    { modify: '1510375924', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '00:49', stopDt: '00:52' },
    { modify: '1510376242', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '00:52', stopDt: '00:54' },
    { modify: '1510376561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '00:54', stopDt: '01:00' },
    { modify: '1510376561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '01:00', stopDt: '01:02' },
    { modify: '1510376881', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:02', stopDt: '01:06' },
    { modify: '1510376881', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:06', stopDt: '01:07' },
    { modify: '1510377199', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '01:07', stopDt: '01:08' },
    { modify: '1510377199', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:08', stopDt: '01:13' },
    { modify: '1510377516', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:13', stopDt: '01:15' },
    { modify: '1510377832', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:15', stopDt: '01:22' },
    { modify: '1510378149', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '01:22', stopDt: '01:25' },
    { modify: '1510378149', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:25', stopDt: '01:29' },
    { modify: '1510378466', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:29', stopDt: '01:30' },
    { modify: '1510378782', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:30', stopDt: '01:35' },
    { modify: '1510378782', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:35', stopDt: '01:37' },
    { modify: '1510378782', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '01:37', stopDt: '01:38' },
    { modify: '1510379099', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:38', stopDt: '01:40' },
    { modify: '1510379099', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:40', stopDt: '01:42' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:42', stopDt: '01:45' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:45', stopDt: '01:47' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:47', stopDt: '01:49' },
    { modify: '1510379418', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:49', stopDt: '01:50' },
    { modify: '1510379736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:50', stopDt: '01:52' },
    { modify: '1510379736', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:52', stopDt: '01:54' },
    { modify: '1510380056', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '01:54', stopDt: '01:56' },
    { modify: '1510380056', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '01:56', stopDt: '01:58' },
    { modify: '1510380380', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '01:58', stopDt: '02:02' },
    { modify: '1510380380', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:02', stopDt: '02:03' },
    { modify: '1510383922', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Not Ready', startDt: '02:00', stopDt: '02:02' },
    { modify: '1510383922', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:02', stopDt: '02:04' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:04', stopDt: '02:06' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:06', stopDt: '02:07' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:07', stopDt: '02:09' },
    { modify: '1510384238', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '02:09', stopDt: '02:10' },
    { modify: '1510384561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:10', stopDt: '02:12' },
    { modify: '1510384561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:12', stopDt: '02:13' },
    { modify: '1510384561', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:13', stopDt: '02:15' },
    { modify: '1510384885', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '02:15', stopDt: '02:17' },
    { modify: '1510384885', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:17', stopDt: '02:20' },
    { modify: '1510384885', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:20', stopDt: '02:21' },
    { modify: '1510385207', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:21', stopDt: '02:26' },
    { modify: '1510385531', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:26', stopDt: '02:27' },
    { modify: '1510385531', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:27', stopDt: '02:29' },
    { modify: '1510385531', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:29', stopDt: '02:30' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:30', stopDt: '02:34' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '02:34', stopDt: '02:35' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:35', stopDt: '02:36' },
    { modify: '1510385856', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:36', stopDt: '02:37' },
    { modify: '1510386179', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:37', stopDt: '02:40' },
    { modify: '1510386179', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:40', stopDt: '02:42' },
    { modify: '1510386501', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:42', stopDt: '02:43' },
    { modify: '1510386501', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:43', stopDt: '02:46' },
    { modify: '1510386834', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:46', stopDt: '02:51' },
    { modify: '1510386834', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:51', stopDt: '02:52' },
    { modify: '1510386834', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '02:52', stopDt: '02:53' },
    { modify: '1510387160', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:53', stopDt: '02:56' },
    { modify: '1510387160', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '02:56', stopDt: '02:58' },
    { modify: '1510387160', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '02:58', stopDt: '02:59' },
    { modify: '1510387485', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '02:59', stopDt: '03:04' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:04', stopDt: '03:10' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:10', stopDt: '03:11' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Outbound', startDt: '03:11', stopDt: '03:12' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '03:12', stopDt: '03:13' },
    { modify: '1510388123', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:13', stopDt: '03:14' },
    { modify: '1510388446', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:14', stopDt: '03:17' },
    { modify: '1510388446', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '03:17', stopDt: '03:18' },
    { modify: '1510388766', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:18', stopDt: '03:21' },
    { modify: '1510388766', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:21', stopDt: '03:23' },
    { modify: '1510389088', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:23', stopDt: '03:28' },
    { modify: '1510389088', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:28', stopDt: '03:30' },
    { modify: '1510389088', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '03:30', stopDt: '03:31' },
    { modify: '1510389409', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:31', stopDt: '03:32' },
    { modify: '1510389409', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '03:32', stopDt: '03:33' },
    { modify: '1510389409', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:33', stopDt: '03:36' },
    { modify: '1510389732', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:36', stopDt: '03:38' },
    { modify: '1510390053', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:38', stopDt: '03:47' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '03:47', stopDt: '03:48' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:48', stopDt: '03:49' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '03:49', stopDt: '03:50' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '03:50', stopDt: '03:51' },
    { modify: '1510390374', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '03:51', stopDt: '03:52' },
    { modify: '1510390695', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '03:52', stopDt: '03:55' },
    { modify: '1510391030', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Rest Room', startDt: '03:55', stopDt: '04:01' },
    { modify: '1510391030', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:01', stopDt: '04:02' },
    { modify: '1510391030', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '04:02', stopDt: '04:03' },
    { modify: '1510391343', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:03', stopDt: '04:05' },
    { modify: '1510391663', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:05', stopDt: '04:09' },
    { modify: '1510391663', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:09', stopDt: '04:12' },
    { modify: '1510391663', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '04:12', stopDt: '04:13' },
    { modify: '1510391983', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:13', stopDt: '04:15' },
    { modify: '1510391983', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '04:15', stopDt: '04:16' },
    { modify: '1510391983', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Available', startDt: '04:16', stopDt: '04:17' },
    { modify: '1510392620', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:17', stopDt: '04:26' },
    { modify: '1510392620', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:26', stopDt: '04:27' },
    { modify: '1510392939', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:27', stopDt: '04:32' },
    { modify: '1510393258', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:32', stopDt: '04:36' },
    { modify: '1510393576', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:36', stopDt: '04:42' },
    { modify: '1510393576', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:42', stopDt: '04:44' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:44', stopDt: '04:47' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:47', stopDt: '04:49' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '04:49', stopDt: '04:50' },
    { modify: '1510393897', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:50', stopDt: '04:51' },
    { modify: '1510394217', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:51', stopDt: '04:53' },
    { modify: '1510394537', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '04:53', stopDt: '04:58' },
    { modify: '1510394537', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '04:58', stopDt: '04:59' },
    { modify: '1510394537', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '04:59', stopDt: '05:01' },
    { modify: '1510394858', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:01', stopDt: '05:03' },
    { modify: '1510394858', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '05:03', stopDt: '05:05' },
    { modify: '1510394858', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:05', stopDt: '05:07' },
    { modify: '1510395180', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '05:07', stopDt: '05:09' },
    { modify: '1510395180', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:09', stopDt: '05:10' },
    { modify: '1510395180', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '05:10', stopDt: '05:11' },
    { modify: '1510395499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:11', stopDt: '05:15' },
    { modify: '1510395499', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '05:15', stopDt: '05:16' },
    { modify: '1510396134', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:16', stopDt: '05:26' },
    { modify: '1510396134', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '05:26', stopDt: '05:27' },
    { modify: '1510396134', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '05:27', stopDt: '05:28' },
    { modify: '1510397080', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:28', stopDt: '05:42' },
    { modify: '1510397080', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '05:42', stopDt: '05:44' },
    { modify: '1510397396', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:44', stopDt: '05:47' },
    { modify: '1510397396', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '05:47', stopDt: '05:48' },
    { modify: '1510397713', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:48', stopDt: '05:53' },
    { modify: '1510397713', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '05:53', stopDt: '05:54' },
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '05:54', stopDt: '05:57' },
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '05:57', stopDt: '05:58' },
    { modify: '1510398029', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'ACW', startDt: '05:58', stopDt: '06:00' },
    { modify: '1510398345', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Follow Case', startDt: '06:00', stopDt: '06:02' },
    { modify: '1510398661', ssn: '31049', organizeName: 'Serenade', agentName: 'Klangtong, Rungaroon S_PHP', scheduleDate: '2017-11-11', time_zone: 'Asia/Bangkok', activity: 'Answer Calls', startDt: '06:02', stopDt: '07:00' },
]


