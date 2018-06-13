module.exports = class ParamInfo {
    constructor() {
    }

    set cronTR(cronTR) {
        this._cronTR = cronTR;
    }
    get cronTR() {
        return this._cronTR;
    }
    set cronSL(cronSL) {
        this._cronSL = cronSL;
    }
    get cronSL() {
        return this._cronSL;
    }
    set cronQuota(cronQuota) {
        this._cronQuota = cronQuota;
    }
    get cronQuota() {
        return this._cronQuota;
    }
    set cronAct(cronAct) {
        this._cronAct = cronAct;
    }
    get cronAct() {
        return this._cronAct;
    }
    set otBeforeACC(otBeforeACC) {
        this._otBeforeACC = otBeforeACC;
    }
    get otBeforeACC() {
        return this._otBeforeACC;
    }
    set otAfterACC(otAfterACC) {
        this._otAfterACC = otAfterACC;
    }
    get otAfterACC() {
        return this._otAfterACC;
    }
    set otAfterShop(otAfterShop) {
        this._otAfterShop = otAfterShop;
    }
    get otAfterShop() {
        return this._otAfterShop;
    }
    set otBeforeShop(otBeforeShop) {
        this._otBeforeShop = otBeforeShop;
    }
    get otBeforeShop() {
        return this._otBeforeShop;
    }

    set rdpDateFormat(rdpDateFormat) {
        this._rdpDateFormat = rdpDateFormat;
    }
    get rdpDateFormat() {
        return this._rdpDateFormat;
    }
    set summaryDateFormat(summaryDateFormat) {
        this._summaryDateFormat = summaryDateFormat;
    }
    get summaryDateFormat() {
        return this._summaryDateFormat;
    }
    set summaryTimeFormat(summaryTimeFormat) {
        this._summaryTimeFormat = summaryTimeFormat;
    }
    get summaryTimeFormat() {
        return this._summaryTimeFormat;
    }
    set summaryHourFormat(summaryHourFormat) {
        this._summaryHourFormat = summaryHourFormat;
    }
    get summaryHourFormat() {
        return this._summaryHourFormat;
    }
    set appDateTimeFormat(appDateTimeFormat) {
        this._appDateTimeFormat = appDateTimeFormat;
    }
    get appDateTimeFormat() {
        return this._appDateTimeFormat;
    }
    set nasWFMPath(nasWFMPath) {
        this._nasWFMPath = nasWFMPath;
    }
    get nasWFMPath() {
        return this._nasWFMPath
    }

    set trPath(trPath) {
        this._trPath = trPath;
    }
    get trPath() {
        return this._trPath
    }

    set slPath(slPath) {
        this._slPath = slPath;
    }
    get slPath() {
        return this._slPath
    }

    set shiftTime(shiftTime) {
        this._shiftTime = shiftTime;
    }
    get shiftTime() {
        return this._shiftTime;
    }

    set transportTime(transportTime) {
        this._transportTime = transportTime;
    }
    get transportTime() {
        return this._transportTime;
    }

    set standardWork(standardWork) {
        this._standardWork = standardWork;
    }
    get standardWork() {
        return this._standardWork;
    }
    set shiftPaid(shiftPaid) {
        this._shiftPaid = shiftPaid;
    }
    get shiftPaid() {
        return this._shiftPaid;
    }
    set transportPaid(transportPaid) {
        this._transportPaid = transportPaid;
    }
    get transportPaid() {
        return this._transportPaid;
    }
    set perfectAttd(perfectAttd) {
        this._perfectAttd = perfectAttd;
    }
    get perfectAttd() {
        return this._perfectAttd;
    }
    set imPerfectAttd(imPerfectAttd) {
        this._imPerfectAttd = imPerfectAttd;
    }
    get imPerfectAttd() {
        return this._imPerfectAttd;
    }
    set ot1(ot1) {
        this._ot1 = ot1;
    }
    get ot1() {
        return this._ot1;
    }
    set ot1_5(ot1_5) {
        this._ot1_5 = ot1_5;
    }
    get ot1_5() {
        return this._ot1_5;
    }
    set ot3(ot3) {
        this._ot3 = ot3;
    }
    get ot3() {
        return this._ot3;
    }
    toObject() {
        return {
            CRON_TR: this._cronTR,
            CRON_SL: this._cronSL,
            CRON_QUOTA: this._cronQuota,
            CRON_ACTIVITY: this.cronAct,
            OT_BEFORE_ACC: this._otBeforeACC,
            OT_AFTER_ACC: this._otAfterACC,
            OT_BEFORE_SHOP: this._otBeforeShop,
            OT_AFTER_SHOP: this._otAfterShop,
            RDP_DATE_FORMAT: this._rdpDateFormat,
            SUMMARY_DATE_FORMAT: this._summaryDateFormat,
            SUMMARY_TIME_FORMAT: this._summaryTimeFormat,
            SUMMARY_HOUR_FORMAT: this._summaryHourFormat,
            APP_DATETIME_FORMAT: this._appDateTimeFormat,
            NAS_WFM_PATH: this._nasWFMPath,
            TR_PATH: this._trPath,
            SL_PATH: this._slPath,
            SHIFT_TIME: this._shiftTime,
            TRANSPORT_TIME: this._transportTime,
            STANDARD_WORK: this._standardWork,
            SHIFT_PAID: this._shiftPaid,
            TRANSPORT_PAID: this._transportPaid,
            PERFECT_ATTD: this._perfectAttd,
            IMPERFECT_ATTD: this._imPerfectAttd,
            OT_1: this._ot1,
            OT_1_5: this._ot1_5,
            OT_3: this._ot3,
        };
    }

}