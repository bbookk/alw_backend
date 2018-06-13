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

// parameter from get employee detail
// EMPLOYEEGROUP
// COMPANYNAME
// COMPANYCODE

// organizeInfoList
module.exports = class EmployeeInfo {
    constructor() {
    }

    // ENGNAME
    set nameEng(nameEng) {
        this._nameEng = nameEng;
    }
    get nameEng() {
        return this._nameEng;
    }

    // ENGSURNAME
    set surnameEng(surnameEng) {
        this._surnameEng = surnameEng;
    }
    get surnameEng() {
        return this._surnameEng;
    }

    // THNAME
    set nameTh(nameTh) {
        this._nameTh = nameTh;
    }
    get nameTh() {
        return this._nameTh;
    }

    // THSURNAME
    set surnameTh(surnameTh) {
        this._surnameTh = surnameTh;
    }
    get surnameTh() {
        return this._surnameTh;
    }

    // PIN
    set pin(pin) {
        this._pin = pin;
    }
    get pin() {
        return this._pin;
    }

    // POSITION
    set position(position) {
        this._position = position;
    }
    get position() {
        return this._position;
    }

    // ORGDESC
    set orgDesc(orgDesc) {
        this._orgDesc = orgDesc;
    }
    get orgDesc() {
        return this._orgDesc;
    }

    // ORGCODE
    set orgCode(orgCode) {
        this._orgCode = orgCode;
    }
    get orgCode() {
        return this._orgCode;
    }

    // ORGNAME
    set orgName(orgName) {
        this._orgName = orgName;
    }
    get orgName() {
        return this._orgName;
    }

    // NICKNAME
    set nickname(nickname) {
        this._nickname = nickname;
    }
    get nickname() {
        return this._nickname;
    }

    // JOBDESC
    set jobDesc(jobDesc) {
        this._jobDesc = jobDesc;
    }
    get jobDesc() {
        return this._jobDesc;
    }

    // POSITIONID
    set positionId(positionId) {
        this._positionId = positionId;
    }
    get positionId() {
        return this._positionId;
    }

    // EMAIL
    set email(email) {
        this._email = email;
    }
    get email() {
        return this._email;
    }

    // PGGROUP
    set pgGroup(pgGroup) {
        this._pgGroup = pgGroup;
    }
    get pgGroup() {
        return this._pgGroup;
    }

    // MOBILENO
    set mobileNo(mobileNo) {
        this._pmobileNo = mobileNo;
    }
    get mobileNo() {
        return this._mobileNo;
    }

    // TELNO
    set telNo(telNo) {
        this._telNo = telNo;
    }
    get telNo() {
        return this._telNo;
    }

    // DPDESC
    set dpDesc(dpDesc) {
        this._dpDesc = dpDesc;
    }
    get dpDesc() {
        return this._dpDesc;
    }

    // MANAGERNAME
    set managerName(managerName) {
        this._managerName = managerName;
    }
    get managerName() {
        return this._managerName;
    }

    // BUILDINGNAME
    set buildingName(buildingName) {
        this._buildingName = buildingName;
    }
    get buildingName() {
        return this._buildingName;
    }

    // PROVINCECODE
    set provinceCode(provinceCode) {
        this._provinceCode = provinceCode;
    }
    get provinceCode() {
        return this._provinceCode;
    }

    // FLOOR
    set floor(floor) {
        this._floor = floor;
    }
    get floor() {
        return this._floor;
    }

    // EMPLOYEETYPE
    set employeeType(employeeType) {
        this._employeeType = employeeType;
    }
    get employeeType() {
        return this._employeeType;
    }

    // IDCARD
    set idCard(idCard) {
        this._idCard = idCard;
    }
    get idCard() {
        return this._idCard;
    }

    // authorization from allowance system
    set authorizeInfo(authorizeInfo) {
        this._authorizeInfo = authorizeInfo;
    }
    get authorizeInfo() {
        return this._authorizeInfo;
    }

    // COMPANYNAME
    set companyName(companyName) {
        this._companyName = companyName;
    }
    get companyName() {
        return this._companyName;
    }
    
    // EMPLOYEEGROUP
    set employeeGroup(employeeGroup) {
        this._employeeGroup = employeeGroup;
    }
    get employeeGroup() {
        return this._employeeGroup;
    }

    // COMPANYCODE
    set companyCode(companyCode) {
        this._companyCode = companyCode;
    }
    get companyCode() {
        return this._companyCode;
    }

    // organizeInfoList
    set organizeInfoList(organizeInfoList) {
        this._organizeInfoList = organizeInfoList;
    }
    get organizeInfoList() {
        return this._organizeInfoList;
    }
    
    
    toJSON() {
        return {
            "name_eng": this._nameEng,
            "surname_eng": this._surnameEng,
            "name_th": this._nameTh,
            "surname_th": this._surnameTh,
            "pin": this._pin,
            "position": this._position,
            "org_desc": this._orgDesc,
            "org_code": this._orgCode,
            "org_name": this._orgName,
            "nickname": this._nickname,
            "job_desc": this._jobDesc,
            "position_id": this._positionId,
            "email": this._email,
            "pg_group": this._pgGroup,
            "mobile_no": this._mobileNo,
            "tel_no": this._telNo,
            "dp_desc": this._dpDesc,
            "manager_name": this._managerName,
            "building_name": this._buildingName,
            "province_code": this._provinceCode,
            "floor": this._floor,
            "employee_type": this._employeeType,
            "id_card": this._idCard,
            "company_name": this._companyName,
            "company_code": this._companyCode,
            "employee_group": this._employeeGroup,
            "authorize_info": this._authorizeInfo
        };
    }
}