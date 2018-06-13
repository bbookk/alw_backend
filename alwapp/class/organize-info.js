// TODO: to complete all attributes
// ORGCODE
// ORGNAME
// ORGDESC
// ORGLEVEL
// HIGHERORG
// HIGHERORGNAME
// HIGHERORGDESC
// HIGHERORGLEVEL
// DISPLAYLEVEL
// ObjectID
// CompanyCode
// Description_EN
// Description_TH

module.exports = class OrganizeInfo {
    constructor() {
    }

    // ObjectID
    set objectId(objectId) {
        this._objectId = objectId;
    }
    get objectId() {
        return this._objectId;
    }

    // CompanyCode
    set companyCode(companyCode) {
        this._companyCode = companyCode;
    }
    get companyCode() {
        return this._companyCode;
    }
    
    // Description_EN
    set companyDescEn(companyDescEn) {
        this._companyDescEn = companyDescEn;
    }
    get companyDescEn() {
        return this._companyDescEn;
    }

    // Description_TH
    set companyDescTh(companyDescTh) {
        this._companyDescTh = companyDescTh;
    }
    get companyDescTh() {
        return this._companyDescTh;
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
    
    // ORGDESC
    set orgDesc(orgDesc) {
        this._orgDesc = orgDesc;
    }
    get orgDesc() {
        return this._orgDesc;
    }

    // ORGLEVEL
    set orgLevel(orgLevel) {
        this._orgLevel= orgLevel;
    }
    get orgLevel() {
        return this._orgLevel;
    }
    
    // HIGHERORG
    set higherOrg(higherOrg) {
        this._higherOrg= higherOrg;
    }
    get higherOrg() {
        return this._higherOrg;
    }
    
    // HIGHERORGNAME
    set higherOrgName(higherOrgName) {
        this._higherOrgName= higherOrgName;
    }
    get higherOrgName() {
        return this._higherOrgName;
    }

    // HIGHERORGDESC
    set higherOrgDesc(higherOrgDesc) {
        this._higherOrgDesc= higherOrgDesc;
    }
    get higherOrgDesc() {
        return this._higherOrgDesc;
    }

    // HIGHERORGLEVEL
    set higherOrgLevel(higherOrgLevel) {
        this._higherOrgLevel= higherOrgLevel;
    }
    get higherOrgLevel() {
        return this._higherOrgLevel;
    }

    // DISPLAYLEVEL
    set displayLevel(displayLevel) {
        this._displayLevel= displayLevel;
    }
    get displayLevel() {
        return this._displayLevel;
    }

    toJSON() {
        return {
            "company_code" : this._companyCode,
            "company_dec_en" : this._companyDescEn,
            "company_dec_th" : this._companyDescTh,
            "object_id" : this._objectId,
            "org_code": this._orgCode,
            "org_name": this._orgName,
            "org_desc": this._orgDesc,
            "org_level": this._orgLevel,
            "higher_org": this._higherOrg,
            "higher_org_name": this._higherOrgName,
            "higher_org_desc": this._higherOrgDesc,
            "higher_org_level": this._higherOrgLevel,
            "display_level": this._displayLevel
        };
    }
}