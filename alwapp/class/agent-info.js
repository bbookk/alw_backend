// TODO: to complete all attributes
{/* <xs:element name="Table">
<xs:complexType>
   <xs:sequence>
      <xs:element name="UPD_DATE" type="xs:dateTime" minOccurs="0"/>
      <xs:element name="DATEMONTH" type="xs:dateTime" minOccurs="0"/>
      <xs:element name="PINCODE" type="xs:string" minOccurs="0"/>
      <xs:element name="AGENT" type="xs:string" minOccurs="0"/>
      <xs:element name="USERNAME" type="xs:string" minOccurs="0"/>
      <xs:element name="LOGIN_ID" type="xs:string" minOccurs="0"/>
      <xs:element name="PINCODE_MANAGER" type="xs:string" minOccurs="0"/>
      <xs:element name="MANAGER" type="xs:string" minOccurs="0"/>
      <xs:element name="PINCODE_SUP" type="xs:string" minOccurs="0"/>
      <xs:element name="SUPERVISOR" type="xs:string" minOccurs="0"/>
      <xs:element name="CBP_TEAM_ID" type="xs:int" minOccurs="0"/>
      <xs:element name="CBP_TEAM" type="xs:string" minOccurs="0"/>
      <xs:element name="CBP_GROUP_ID" type="xs:int" minOccurs="0"/>
      <xs:element name="CBP_GROUP" type="xs:string" minOccurs="0"/>
      <xs:element name="EFFECTIVE_DATE" type="xs:dateTime" minOccurs="0"/>
   </xs:sequence>
</xs:complexType>
</xs:element> */}

module.exports = class AgentInfo {
    constructor() {
    }
    
    //UPD_DATE
    set updateDate(updateDate) {
        this._updateDate = updateDate;
    }
    get updateDate() {
        return this._updateDate;
    }

    //DATEMONTH
    set dateMonth(dateMonth) {
        this._dateMonth = dateMonth;
    }
    get dateMonth() {
        return this._dateMonth;
    }

    //PINCODE
    set pin(pin) {
        this._pin = pin;
    }
    get pin() {
        return this._pin;
    }

    //AGENT
    set fullName(fullName) {
        this._fullName = fullName;
    }
    get fullName() {
        return this._fullName;
    }
    
    //USERNAME
    set username(username) {
        this._username = username;
    }
    get username() {
        return this._username;
    }

    //LOGIN_ID
    set loginId(loginId) {
        this._loginId = loginId;
    }
    get loginId() {
        return this._loginId;
    }

    //PINCODE_MANAGER
    set managerPin(managerPin) {
        this._managerPin = managerPin;
    }
    get managerPin() {
        return this._managerPin;
    }

    //MANAGER
    set managerFullName(managerFullName) {
        this._managerFullName = managerFullName;
    }
    get managerFullName() {
        return this._managerFullName;
    }

    //PINCODE_SUP
    set supervisorPin(supervisorPin) {
        this._supervisorPin = supervisorPin;
    }
    get supervisorPin() {
        return this._supervisorPin;
    }

    //SUPERVISOR
    set supervisorFullName(supervisorFullName) {
        this._supervisorFullName = supervisorFullName;
    }
    get supervisorFullName() {
        return this._supervisorFullName;
    }

    //CBP_TEAM_ID
    set cbpTeamId(cbpTeamId) {
        this._cbpTeamId = cbpTeamId;
    }
    get cbpTeamId() {
        return this._cbpTeamId;
    }

    //CBP_TEAM
    set cbpTeamName(cbpTeamName) {
        this._cbpTeamName = cbpTeamName;
    }
    get cbpTeamName() {
        return this._cbpTeamName;
    }

    //CBP_GROUP_ID
    set cbpGroupId(cbpGroupId) {
        this._cbpGroupId = cbpGroupId;
    }
    get cbpGroupId() {
        return this._cbpGroupId;
    }

    //CBP_GROUP
    set cbpGroupName(cbpGroupName) {
        this._cbpGroupName = cbpGroupName;
    }
    get cbpGroupName() {
        return this._cbpGroupName;
    }

    //EFFECTIVE_DATE
    set effectiveDate(effectiveDate) {
        this._effectiveDate = effectiveDate;
    }
    get effectiveDate() {
        return this._effectiveDate;
    }

    //AgentLowerInfoList
    set agentLowerInfoList(agentLowerInfoList) {
        this._agentLowerInfoList = agentLowerInfoList;
    }
    get agentLowerInfoList() {
        return this._agentLowerInfoList
    }

    toJSON() {
        return {
            "pin": this._pin,
            "full_name": this._fullName,
            "username": this._username,
            "login_id": this._loginId,
            "update_date" : this._updateDate,
            "date_month" : this._dateMonth,
            "manager_pin" : this._managerPin,
            "manager_full_name" : this._managerFullName,
            "supervisor_pin" : this._supervisorPin,
            "supervisor_full_name" : this._supervisorFullName,
            "cbp_team_id" : this._cbpTeamId,
            "cbp_team_name" : this._cbpTeamName,
            "cbp_group_id" : this._cbpGroupId,
            "cbp_group_name" : this._cbpGroupName,
            "effective_date" : this._effectiveDate,
            "agent_lower_info" : this._agentLowerInfoList
        };
    }
}