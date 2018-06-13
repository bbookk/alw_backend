

//var Constant = require('./constant').Constant;
let defaultFlag = 'N';
let defaultHour = '0.00'
let defaultHourAutoOT = '8.00'
let defaultUseFlag = 'Y'
let defaultCreateby = 'Batch'
module.exports = class SummaryInfo {

    constructor(type) {
        defaultValue(type, this)
    }

    set txDetailSLId(txDetailSLId) {
        this._txDetailSLId = txDetailSLId;
    }
    get txDetailSLId() {
        return this._txDetailSLId;
    }
    set txDetailTRId(txDetailTRId) {
        this._txDetailTRId = txDetailTRId;
    }
    get txDetailTRId() {
        return this._txDetailTRId;
    }
    set pin(pin) {
        this._pin = pin;
    }
    get pin() {
        return this._pin;
    }
    set scheduleStartDt(scheduleStartDt) {
        this._scheduleStartDt = scheduleStartDt;
    }
    get scheduleStartDt() {
        return this._scheduleStartDt;
    }
    set scheduleEndDt(scheduleEndDt) {
        this._scheduleEndDt = scheduleEndDt;
    }
    get scheduleEndDt() {
        return this._scheduleEndDt;
    }
    set otStartDt(otStartDt) {
        this._otStartDt = otStartDt;
    }
    get otStartDt() {
        return this._otStartDt;
    }
    set otEndDt(otEndDt) {
        this._otEndDt = otEndDt;
    }
    get otEndDt() {
        return this._otEndDt;
    }
    set actualClockinDt(actualClockinDt) {
        this._actualClockinDt = actualClockinDt;
    }
    get actualClockinDt() {
        return this._actualClockinDt;
    }
    set actualClockoutDt(actualClockoutDt) {
        this._actualClockoutDt = actualClockoutDt;
    }
    get actualClockoutDt() {
        return this._actualClockoutDt;
    }
    set recordType(recordType) {
        this._recordType = recordType;
    }
    get recordType() {
        return this._recordType;
    }
    set shiftFlag(shiftFlag) {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._shiftFlag = defaultFlag
        } else {
            this._shiftFlag = shiftFlag;
        }
    }
    get shiftFlag() {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._shiftFlag = defaultFlag
        } else {
            this._shiftFlag = shiftFlag;
        }
        return this._shiftFlag;
    }
    set transportFlag(transportFlag) {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._transportFlag = defaultFlag
        } else {
            this._transportFlag = transportFlag;
        }
    }
    get transportFlag() {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._transportFlag = defaultFlag
        } else {
            this._transportFlag = transportFlag;
        }
        return this._transportFlag;
    }
    set workHour(workHour) {
        this._workHour = workHour;
    }
    get workHour() {
        return this._workHour;
    }
    set ot10(ot10) {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._ot10 = defaultHour
        }
        if (this._type == 'AutoOT') {
            this._ot10 = defaultHourAutoOT
        }
        if (this._type == 'ON' || this._type == 'OTCOM') {
            this._ot10 = ot10;
        }
    }
    get ot10() {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._ot10 = defaultHour
        }
        if (this._type == 'AutoOT') {
            this._ot10 = defaultHourAutoOT
        }
        if (this._type == 'ON' || this._type == 'OTCOM') {
            this._ot10 = ot10;
        }
        return this._ot10;
    }
    set ot15(ot15) {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._ot15 = defaultHour
        }
        if (this._type == 'ON' || this._type == 'OTCOM') {
            this._ot15 = ot15;
        }
    }
    get ot15() {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._ot15 = defaultHour
        }
        if (this._type == 'ON' || this._type == 'OTCOM') {
            this._ot15 = ot15;
        }
        return this._ot15;
    }
    set ot30(ot30) {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._ot30 = defaultHour
        }
        if (this._type == 'ON' || this._type == 'OTCOM') {
            this._ot30 = ot30;
        }
    }
    get ot30() {
        if (this._type == 'OFF' || this._type == 'LV') {
            this._ot30 = defaultHour
        }
        if (this._type == 'ON' || this._type == 'OTCOM') {
            this._ot30 = ot30;
        }
        return this._ot30;
    }
    set recordDate(recordDate) {
        this._recordDate = recordDate;
    }
    get recordDate() {
        return this._recordDate;
    }
    set recordMonth(recordMonth) {
        this._recordMonth = recordMonth;
    }
    get recordMonth() {
        return this._recordMonth;
    }
    set useFlag(useFlag) {
        this._useFlag = useFlag;
    }
    get useFlag() {
        return this._useFlag;
    }
    set remark(remark) {
        this._remark = remark;
    }
    get remark() {
        return this._remark;
    }
    set lateTime(lateTime) {
        this._lateTime = lateTime;
    }
    get lateTime() {
        return this._lateTime;
    }
    set lostTime(lostTime) {
        this._lostTime = lostTime;
    }
    get lostTime() {
        return this._lostTime;
    }
    set createBy(createBy) {
        this._createBy = createBy;
    }
    get createBy() {
        return this._createBy;
    }
    set createDt(createDt) {
        this._createDt = createDt;
    }
    get createDt() {
        return this._createDt;
    }
    // addtionnal
    set managerPin(managerPin) {
        this._managerPin = managerPin;
    }
    get managerPin() {
        return this._managerPin;
    }
    set superPin(superPin) {
        this._superPin = superPin;
    }
    get superPin() {
        return this._superPin;
    }
    set cmpy(cmpy) {
        this._cmpy = cmpy;
    }
    get cmpy() {
        return this._cmpy;
    }
    set bu(bu) {
        this._bu = bu;
    }
    get bu() {
        return this._bu;
    }
    set fn(fn) {
        this._fn = fn;
    }
    get fn() {
        return this._fn;
    }
    set dp(dp) {
        this._dp = dp;
    }
    get dp() {
        return this._dp;
    }
    set section(section) {
        this._section = section;
    }
    get section() {
        return this._section;
    }


    toObject() {
        return {
            txDetailSLId: this._txDetailSLId,
            txDetailTRId: this._txDetailTRId,
            pin: this._pin,
            scheduleStartDt: this._scheduleStartDt,
            scheduleEndDt: this._scheduleEndDt,
            otStartDt: this._otStartDt,
            otEndDt: this._otEndDt,
            actualClockinDt: this._actualClockinDt,
            actualClockoutDt: this._actualClockoutDt,
            recordType: this._recordType,
            shiftFlag: this._shiftFlag,
            transportFlag: this._transportFlag,
            workHour: this._workHour,
            ot10: this._ot10,
            ot15: this._ot15,
            ot30: this._ot30,
            recordDate: this._recordDate,
            recordMonth: this._recordMonth,
            useFlag: this._useFlag,
            remark: this._remark,
            lateTime: this._lateTime,
            lostTime: this._lostTime,
            createBy: this._createBy,
            createDt: this._createDt,
            managerPin: this._managerPin,
            superPin: this._superPin,
            cmpy: this._cmpy,
            bu: this._bu,
            fn: this._fn,
            dp: this._dp,
            section: this._section,
        }
    }
}


function defaultValue(type, ref) {

    if (type == 'OFF' || type == 'LV'||type=='ON') {
        ref._transportFlag = defaultFlag
    } else {
        ref._transportFlag = '';
    }

    if (type == 'OFF' || type == 'LV'||type=='ON') {
        ref._shiftFlag = defaultFlag
    } else {
        ref._shiftFlag = '';
    }

    if (type == 'OFF' || type == 'LV') {
        ref._ot10 = defaultHour
    }
    if (type == 'AutoOT') {
        ref._ot10 = defaultHourAutoOT
    }
    if (type == 'ON' || type == 'OTCOM') {
        ref._ot10 = '0.00';
    }

    if (type == 'OFF' || type == 'LV') {
        ref._ot15 = defaultHour
    }
    if (type == 'ON' || type == 'OTCOM') {
        ref._ot15 = '0.00';
    }

    if (type == 'OFF' || type == 'LV') {
        ref._ot30 = defaultHour
    }
    if (type == 'ON' || type == 'OTCOM') {
        ref._ot30 = '0.00';
    }

    ref.actualClockinDt = null;
    ref.actualClockoutDt = null;
    ref.scheduleEndDt = null;
    ref.scheduleStartDt = null;
    ref.otEndDt = null;
    ref.otStartDt = null;

    ref.txDetailSLId = '';
    ref.txDetailTRId = '';
    ref.lateTime = '';
    ref.lostTime = '';
    ref.recordMonth = '';
    ref.useFlag = defaultUseFlag;
    ref.createBy = defaultCreateby;
    ref.recordType = type;

    ref.managerPin = '';
    ref.superPin = '';
    ref.cmpy = '';
    ref.bu = '';
    ref.section = '';
    ref.dp = '';
    ref.fn = '';
}

