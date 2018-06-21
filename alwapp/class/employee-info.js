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

        this.clearAllOrganize();
        parseOrganizeInfoList(this);
    }
    get organizeInfoList() {
        return this._organizeInfoList;
    }
    
    // CO
    set orgCodeCO(orgCodeCO) {
        this._orgCodeCO = orgCodeCO;
    }
    set orgNameCO(orgNameCO) {
        this._orgNameCO = orgNameCO;
    }
    get orgCodeCO() {
        return this._orgCodeCO;
    }
    get orgNameCO() {
        return this._orgNameCO;
    }

    // BL
    set orgCodeBL(orgCodeBL) {
        this._orgCodeBL = orgCodeBL;
    }
    set orgNameBL(orgNameBL) {
        this._orgNameBL = orgNameBL;
    }
    get orgCodeBL() {
        return this._orgCodeBL;
    }
    get orgNameBL() {
        return this._orgNameBL;
    }
    
    // BU
    set orgCodeBU(orgCodeBU) {
        this._orgCodeBU = orgCodeBU;
    }
    set orgNameBU(orgNameBU) {
        this._orgNameBU = orgNameBU;
    }
    get orgCodeBU() {
        return this._orgCodeBU;
    }
    get orgNameBU() {
        return this._orgNameBU;
    }

    // DP
    set orgCodeDP(orgCodeDP) {
        this._orgCodeDP = orgCodeDP;
    }
    set orgNameDP(orgNameDP) {
        this._orgNameDP = orgNameDP;
    }
    get orgCodeDP() {
        return this._orgCodeDP;
    }
    get orgNameDP() {
        return this._orgNameDP;
    }

    // SC
    set orgCodeSC(orgCodeSC) {
        this._orgCodeSC = orgCodeSC;
    }
    set orgNameSC(orgNameSC) {
        this._orgNameSC = orgNameSC;
    }
    get orgCodeSC() {
        return this._orgCodeSC;
    }
    get orgNameSC() {
        return this._orgNameSC;
    }

    //FC
    set orgCodeFC(orgCodeFC) {
        this._orgCodeFC = orgCodeFC;
    }
    set orgNameFC(orgNameFC) {
        this._orgNameFC = orgNameFC;
    }
    get orgCodeFC() {
        return this._orgCodeFC;
    }
    get orgNameFC() {
        return this._orgNameFC;
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

    clearAllOrganize() {
        this._orgCodeCO = NaN;
        this._orgNameCO = NaN;
        this._orgCodeBL = NaN;
        this._orgNameBL = NaN;
        this._orgCodeBU = NaN;
        this._orgNameBU = NaN;
        this._orgCodeDP = NaN;
        this._orgNameDP = NaN;
        this._orgCodeSC = NaN;
        this._orgNameSC = NaN;
        this._orgCodeFC = NaN;
        this._orgNameFC = NaN;
    }
}

function parseOrganizeInfoList(employeeInfo) {
    
    if (employeeInfo.organizeInfoList && employeeInfo.organizeInfoList.length > 0) {
      employeeInfo.organizeInfoList.forEach(function (organizeInfo) {
        if (organizeInfo.orgLevel == 'BU') {
            employeeInfo.orgCodeBU = organizeInfo.orgCode;
            employeeInfo.orgNameBU = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
        } else if (organizeInfo.orgLevel == 'BL') {
            employeeInfo.orgCodeBL = organizeInfo.orgCode;
            employeeInfo.orgNameBL = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
        } else if (organizeInfo.orgLevel == 'DP') {
            employeeInfo.orgCodeDP = organizeInfo.orgCode;
            employeeInfo.orgNameDP = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
        } else if (organizeInfo.orgLevel == 'CO') {
            employeeInfo.orgCodeCO = organizeInfo.orgCode;
            employeeInfo.orgNameCO = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";  
        } else if (organizeInfo.orgLevel == 'FC') {
            employeeInfo.orgCodeFC = organizeInfo.orgCode;
            employeeInfo.orgNameFC = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";  
        } else if (organizeInfo.orgLevel == 'SC') {
            employeeInfo.orgCodeSC = organizeInfo.orgCode;
            employeeInfo.orgNameSC = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";  
        }
      });
    }
}