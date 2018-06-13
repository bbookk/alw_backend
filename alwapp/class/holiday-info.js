/* <b:END_DATE>14/03/2014</b:END_DATE>
<b:HOLIDAY_DESCRIPTION>Holiday</b:HOLIDAY_DESCRIPTION>
<b:ID>13</b:ID>
<b:IS_ACTIVE>1</b:IS_ACTIVE>
<b:Nbr>1</b:Nbr>
<b:START_DATE>14/03/2014</b:START_DATE> */

module.exports = class HolidayInfo {
    constructor() {
    }

    // ID
    set id(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }

    // START_DATE
    set startDate(startDate) {
        this._startDate = startDate;
    }
    get startDate() {
        return this._startDate;
    }

    // END_DATE
    set endDate(endDate) {
        this._endDate = endDate;
    }
    get endDate() {
        return this._endDate;
    }

    // HOLIDAY_DESCRIPTION
    set holidayDesc(holidayDesc) {
        this._holidayDesc = holidayDesc;
    }
    get holidayDesc() {
        return this._holidayDesc;
    }

    // IS_ACTIVE
    set isActive(isActive) {
        this._isActive = isActive;
    }
    get isActive() {
        return this._isActive;
    }

    // Nbr
    set nbr(nbr) {
        this._nbr = nbr;
    }
    get nbr() {
        return this._nbr;
    }
    
    toJSON() {
        return {
            "id": this._id,
            "start_date": this._startDate,
            "end_date": this._endDate,
            "holiday_desc": this._holidayDesc,
            "is_active": this._isActive,
            "nbr": this._nbr
        }
    }
}