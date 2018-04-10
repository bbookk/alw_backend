module.exports = class TxSLHeader {
    constructor() {
    }
    set fileName(fileName) {
        this.fileName = fileName
    }
    get fileName() {
        return this.fileName;
    }
    set recSuccess(recSuccess) {
        this.recSuccess = recSuccess;
    }
    get recSuccess() {
        return this.recSuccess;
    }
    set recFail(recFail) {
        this.recFail = recFail;
    }
    get recFail() {
        return this.recFail;
    }
    set status(status) {
        this.status = status;
    }
    get status() {
        return this.status;
    }
    set errorMsg(errorMsg) {
        this.errorMsg = errorMsg;
    }
    get errorMsg() {
        return this.errorMsg;
    }
    set createDt(createDt) {
        this.createDt = createDt;
    }
    get createDt() {
        return this.createDt;
    }
    set createBy(createBy) {
        this.createBy = createBy;
    }
    get createBy() {
        return this.createBy;
    }
    sayHello() {

    }
}
