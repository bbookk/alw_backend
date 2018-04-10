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

// const txTRHeaderClass = require('../class/tx-tr-header');
// const trHeaderModelImpl = require('../models/impl/tx/tr-header-impl');

let localPathSL = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/SL/';
let localPathTR = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/TR/';
let localPath = 'C:/Users/dell-2018/Desktop/alw/app/alw/data/';
let nasPath = 'C:/Users/dell-2018/Desktop/NAZ/';
// let nasPathTR = 'C:/Users/dell-2018/Desktop/NAZ/TR/';

let archire = 'C:/Users/dell-2018/Desktop/alw/app/alw/archire/';
let folder = getDirectories(localPath) + '/';

let format = 'YYYY-MM-DD HH:mm:ss';
// 'YYYY-MM-DD HH:mm:ss'

const keyPath = {
    SL: 'SL',
    TR: 'TR',
    quota: 'QUATA',
    activity: 'ACT'
}

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
            console.log('File in TR', path, 'has been added or change');
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
            console.log('File in SL', path, 'has been added or change');
            let rename = await renameToDAT('SL', path);
        })
        .on('unlink', function (path) {
            // console.log('File', path, 'has been removed');
        })
        .on('error', function (error) {
            console.error('Error happened', error);
        })
}

module.exports.test = async (req, res) => {
    console.log('import test')
    return await model['InfoAccess'].find({
        // include: [{
        //   all:true

        // }],
        // order: [
        //   ['createDt', 'DESC'],
        // ],
        where: {
            accessInfoId: '1'
        }
    })
        .then((todos) => { return todos.dataValues })
        .catch((error) => console.log('xxxxxxxx' + error))
}

async function createHeader(file, param, objTR) {
    console.log(objTR);
    if (param === 'SL') {
        return await modelSlHeader.create({
            fileName: file,
            recSuccess: '2500',
            recFail: '0',
            status: 'success',
            errorMsg: '',
            createDt: '2017-03-03',
            createBy: 'batch',
            TxSlDetailHeaderIdFkeys: objTR
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
            , {
                include: [{
                    model: modelSlDetail,
                    as: 'TxSlDetailHeaderIdFkeys'
                }]
            })
    }
    if (param === 'TR') {
        return await modelTrHeader.create({
            fileName: file,
            recSuccess: '2500',
            recFail: '0',
            status: 'success',
            errorMsg: '',
            createDt: '2017-03-03',
            createBy: 'batch',
            TxTrDetailHeaderIdFkeys: objTR
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
            , {
                include: [{
                    model: modelTrDetail,
                    as: 'TxTrDetailHeaderIdFkeys'
                }]
            })
    }
    // }
    //  let success = await trHeaderModelImpl.insert(trHeaderObj)  //insert to database and asassociate
    //console.log(success)
}


function mapJson2Obj(param, jsonObj) {
    if (keyPath.SL === param) {
        let start_date = convertFormatDate(jsonObj.field4);
        let start_time = jsonObj.field5;
        let stop_date = convertFormatDate(jsonObj.field6);
        let stop_time = jsonObj.field7;
        let time = moment(start_date + start_time, format);
        let start_dt = moment(time).format(format);
        let time2 = moment(stop_date + stop_time, format);
        let stop_dt = moment(time2).format(format);
        return {
            emp_id: jsonObj.field1,
            external_emp_id: jsonObj.field2,
            activity: jsonObj.field3,
            startDt: start_dt,
            // start_time: jsonObj.field5,
            stopDt: stop_dt,
            // end_time: jsonObj.field7,
            is_paid: jsonObj.field8,
            time_zone: jsonObj.field9,
            createDt: '2017-03-03',
            createBy: 'batch',
        }
    }
    else if (keyPath.TR === param) {
        let date = jsonObj.field5;
        let start_date = jsonObj.field8;
        let stop_date = jsonObj.field9;
        let time = moment(date + start_date, format);
        let start_dt = moment(time).format(format);
        let time2 = moment(date + stop_date, format);
        let stop_dt = moment(time2).format(format);
        // console.log(date)
        return {
            modify: jsonObj.field1,
            ssn: jsonObj.field2,
            organizeName: jsonObj.field3,
            agentName: jsonObj.field4,
            // date: convertFormatDate(jsonObj.field5),
            time_zone: jsonObj.field6,
            activity: jsonObj.field7,
            startDt: start_dt,
            stopDt: stop_dt,
            createDt: '2017-03-03',
            createBy: 'batch',
        }
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
    // let test = moment(date, 'MM/DD/YYYY');
    let beforeConvertdate = moment(date, 'MM/DD/YYYY');
    let convert_todate = beforeConvertdate.format('YYYY-MM-DD');
    return convert_todate;
    // console.log(convert_todate);
}

//get directory form path
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

function renameToDAT(param, file) {
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
        //  console.log(sync_name)
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
    console.log('adding obj')
    let objTR = [];
    csv({
        noheader: true,
        delimiter: [",", "|"]
    })
        .fromFile(filepath)
        .on('json', (jsonObj) => {
            objTR.push(mapJson2Obj(param, jsonObj))
        })
        .on('done', async (error) => {
            // console.log('add done')
            // console.log(error)
            // let trHeaderObj = new txTRHeaderClass()
            // trHeaderObj.fileName = 
            // objTR.slice(2);
            let file = path.parse(filepath).name;
            let filename = path.parse(file).name;
            createHeader(filename, param, objTR[3]);  // delete headerfile
            console.log(objTR[3])
            console.log(objTR.length)

            let sync_proc = getPath(param) + filename + '.sync.proc';
            moveFile(param, filepath)
            moveFile(param, sync_proc)
        })

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