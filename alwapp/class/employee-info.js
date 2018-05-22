// TODO: to complete all attributes
// ENGNAME
// ENGSURNAME
// THNAME
// THSURNAME
// POSITION
// ORGDESC
// ORGCODE
// ORGNAME
// NICKNAME
// JOBDESC
// POSITIONID
// PIN
// EMAIL
// PGGROUP
// MOBILENO
// TELNO
// DPDESC
// MANAGERNAME
// BUILDINGNAME
// PROVINCECODE
// FLOOR
// EMPLOYEETYPE
// IDCARD

module.exports = class EmployeeInfo {
    constructor() {
    }
    set engName(engName) {
        this._engName = engName;
    }
    get engName() {
        return this._engName;
    }

    set engSurname(engSurname) {
        this._engSurname = engSurname;
    }
    get engSurname() {
        return this._engSurname;
    }

    set thName(thName) {
        this._thName = thName;
    }
    get thName() {
        return this._thName;
    }

    set thSurname(thSurname) {
        this._thSurname = thSurname;
    }
    get thSurname() {
        return this._thSurname;
    }

    set pin(pin) {
        this._pin = pin;
    }
    get pin() {
        return this._pin;
    }

    toJSON() {
        return {
            "engName": this._engName,
            "engSurname": this._engSurname,
            "thName": this._thName,
            "thSurname": this._thSurname,
            "pin": this._pin
        };
    }
}