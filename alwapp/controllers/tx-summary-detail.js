/**
 * Summary-detailController
 *
 * @description :: Server-side logic for managing summary-details
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const model = require('../models').TxSummaryDetail;

module.exports = {



  /**
   * `Summary-detailController.list()`
   */
  list: async function (req, res) {
    return await model.
      findAll({
        where: {
          groupType: param
        },
        include: [{
          all: true
        }], raw: true,
      })
  },


  /**
   * `Summary-detailController.show()`
   */
  show: function (req, res) {
    return res.json({
      todo: 'show() is not implemented yet!'
    });
  },


  /**
   * `Summary-detailController.create()`
   */
  create: function (req, res) {
    return res.json({
      todo: 'create() is not implemented yet!'
    });
  },


  /**
   * `Summary-detailController.update()`
   */
  update: function (req, res) {
    return res.json({
      todo: 'update() is not implemented yet!'
    });
  },


  /**
   * `Summary-detailController.remove()`
   */
  remove: function (req, res) {
    return res.json({
      todo: 'remove() is not implemented yet!'
    });
  },

  getSummaryDaily: function (req, res) {
    // let obj = {
    //   name: req.name,
    //   surname: req.surname,
    //   pin: req.pin,
    //   date_from: req.date_from,
    //   date_to: req.date_to,
    // }

    // // cal om return pin

    // let where = {}

    // if (isNotEmpty(obj.date_from) && isNotEmpty(obj.date_to)) {
    //   where = {
    //     from: {
    //       $between: [obj.date_from, obj.date_to]
    //     }
    //   };
    // } else if (isNotEmpty(obj.date_from)) {

    // } else if (isNotEmpty(obj.date_from)) {

    // }

    return res.json({

      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "search_daily_resp": {
        "employee_detail": {
          "PIN": "1234",
          "Name": "book",
          "BL": "test",
          "Company": "Advanced Contact Center",
          "BU": "Contact Center BKK",
          "Department": "Center"
        },
        "result_record": [
          {
            "id": "1",
            "Date": "1/12/2018",
            "Record_type": "OFF",
            "Schedule": { "Start": "", "End": "" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "", "Clock_out": "" },
            "Trans": "0.00",
            "Shift": "0.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "Lost (06:00 - 15:00)",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "2",
            "Date": "2/12/2018",
            "Record_type": "ON",
            "Schedule": { "Start": "06:00", "End": "15:00" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "06:30", "Clock_out": "15:30" },
            "Trans": "0.00",
            "Shift": "0.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "3",
            "Date": "3/12/2018",
            "Record_type": "ON",
            "Schedule": { "Start": "06:00", "End": "15:00" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "06:00", "Clock_out": "14:30" },
            "Trans": "0.00",
            "Shift": "0.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "4",
            "Date": "4/12/2018",
            "Record_type": "ON",
            "Schedule": { "Start": "06:00", "End": "15:00" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "06:00", "Clock_out": "15:00" },
            "Trans": "0.00",
            "Shift": "100.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "5",
            "Date": "5/12/2018",
            "Record_type": "OT ก่อน",
            "Schedule": { "Start": "08:00", "End": "17:00" },
            "OT": { "Start": "06:00", "End": "08:00" },
            "Actual": { "Clock_in": "06:00", "Clock_out": "20:00" },
            "Trans": "0.00",
            "Shift": "100.00",
            "OT_Hours": { "ot_1": "2.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "6",
            "Date": "5/12/2018",
            "Record_type": "OT หลัง",
            "Schedule": { "Start": "08:00", "End": "17:00" },
            "OT": { "Start": "17:00", "End": "20:00" },
            "Actual": { "Clock_in": "06:00", "Clock_out": "20:00" },
            "Trans": "0.00",
            "Shift": "100.00",
            "OT_Hours": { "ot_1": "3.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "7",
            "Date": "6/12/2018",
            "Record_type": "OFF",
            "Schedule": { "Start": "", "End": "" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "", "Clock_out": "" },
            "Trans": "0.00",
            "Shift": "0.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "OFF",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "8",
            "Date": "7/12/2018",
            "Record_type": "VL",
            "Schedule": { "Start": "06:00", "End": "15:00" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "", "Clock_out": "" },
            "Trans": "0.00",
            "Shift": "0.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "VL (06:00 - 15:00)",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          },
          {
            "id": "9",
            "Date": "8/12/2018",
            "Record_type": "BL",
            "Schedule": { "Start": "06:00", "End": "15:00" },
            "OT": { "Start": "", "End": "" },
            "Actual": { "Clock_in": "", "Clock_out": "" },
            "Trans": "0.00",
            "Shift": "0.00",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
            "Remark": "BL (06:00 - 15:00)",
            "UpdatedDate": "15/12/2018",
            "UpdatedBy": "Interim"
          }
        ]
      }


    });

  },
  getSummaryAdjust: function (req, res) {
    return res.json({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "search_adjust_resp": {
        "employee_detail": {
          "PIN": "1234",
          "Name": "book",
          "BL": "test",
          "Company": "Advanced Contact Center",
          "BU": "Contact Center BKK",
          "Department": "Center"
        },
        "result_record": [
          {
            "id": "1",
            "PIN": "0001",
            "Name": "test test",
            "Organization_Short_Name": "CU-CC1",
            "Schedule_Date": "16/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          },

          {
            "id": "2",
            "PIN": "0002",
            "Name": "test",
            "Organization_Short_Name": "BU-CC1",
            "Schedule_Date": "12/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          },

          {
            "id": "3",
            "PIN": "0003",
            "Name": "book",
            "Organization_Short_Name": "BU-CC1",
            "Schedule_Date": "12/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          },

          {
            "id": "4",
            "PIN": "0004",
            "Name": "นันธิดา ทรัพย์ประเสริฐ",
            "Organization_Short_Name": "BU-CC1",
            "Schedule_Date": "13/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          },

          {
            "id": "5",
            "PIN": "0005",
            "Name": "test",
            "Organization_Short_Name": "BU",
            "Schedule_Date": "12/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          },

          {
            "id": "6",
            "PIN": "0006",
            "Name": "test",
            "Organization_Short_Name": "BU-CC1",
            "Schedule_Date": "12/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          },

          {
            "id": "7",
            "PIN": "0007",
            "Name": "test",
            "Organization_Short_Name": "BU-CC1",
            "Schedule_Date": "12/1/2018",
            "Adjust_Reason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "Adjust_Date": "15/12/2017 14:17:34"
          }
        ]
      }
    })
  },
  getApproveAllowanceReport: function (req, res) {
    return res.json({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "search_approve_resp": {
        "employee_detail": {
          "PIN": "1234",
          "Name": "book",
          "BL": "test",
          "Company": "Advanced Contact Center",
          "BU": "Contact Center BKK",
          "Department": "Center"
        },
        "result_record": [
          {
            "id": "1",
            "PIN": "0001",
            "Employee_Name": "นันธิดา ทรัพย์ประเสริฐ",
            "Organization_Short_Name": "BU-CC1",
            "Shift": { "Day": "06:00", "Total": "15:00" },
            "Trans": { "Day": "06:00", "Total": "15:00" },
            "Attendance": { "Imperfect": "06:00", "Perfect": "15:00" },
            "Leave": { "Annual": "6:00", "Business": "0:00", "Vacation": "4:00" },
            "Total": "2000.00",
            "Reason": "example"
          },

          {
            "id": "2",
            "PIN": "0002",
            "Employee_Name": "test test",
            "Organization_Short_Name": "BU-CC1",
            "Shift": { "Day": "06:00", "Total": "15:00" },
            "Trans": { "Day": "06:00", "Total": "15:00" },
            "Attendance": { "Imperfect": "06:00", "Perfect": "15:00" },
            "Leave": { "Annual": "6:00", "Business": "0:00", "Vacation": "4:00" },
            "Total": "2000.00",
            "Reason": "example"
          },
          {
            "id": "3",
            "PIN": "0003",
            "Employee_Name": "book",
            "Organization_Short_Name": "BU-CC1",
            "Shift": { "Day": "06:00", "Total": "15:00" },
            "Trans": { "Day": "06:00", "Total": "15:00" },
            "Attendance": { "Imperfect": "06:00", "Perfect": "15:00" },
            "Leave": { "Annual": "6:00", "Business": "0:00", "Vacation": "4:00" },
            "Total": "2000.00",
            "Reason": "example"
          },

          {
            "id": "4",
            "PIN": "0004",
            "Employee_Name": "test test",
            "Organization_Short_Name": "BU-CC1",
            "Shift": { "Day": "06:00", "Total": "15:00" },
            "Trans": { "Day": "06:00", "Total": "15:00" },
            "Attendance": { "Imperfect": "06:00", "Perfect": "15:00" },
            "Leave": { "Annual": "6:00", "Business": "0:00", "Vacation": "4:00" },
            "Total": "2000.00",
            "Reason": "example"
          },
          {
            "id": "5",
            "PIN": "0005",
            "Employee_Name": "test",
            "Organization_Short_Name": "BU-CC1",
            "Shift": { "Day": "06:00", "Total": "15:00" },
            "Trans": { "Day": "06:00", "Total": "15:00" },
            "Attendance": { "Imperfect": "06:00", "Perfect": "15:00" },
            "Leave": { "Annual": "6:00", "Business": "0:00", "Vacation": "4:00" },
            "Total": "2000.00",
            "Reason": "example"
          },

          {
            "id": "6",
            "PIN": "0006",
            "Employee_Name": "example",
            "Organization_Short_Name": "BU-CC1",
            "Shift": { "Day": "06:00", "Total": "15:00" },
            "Trans": { "Day": "06:00", "Total": "15:00" },
            "Attendance": { "Imperfect": "06:00", "Perfect": "15:00" },
            "Leave": { "Annual": "6:00", "Business": "0:00", "Vacation": "4:00" },
            "Total": "2000.00",
            "Reason": "example"
          }
        ]
      }

    })
  },
  getSummaryOrganization: function (req, res) {
    return res.json({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "search_organization_resp": {
        "employee_detail": {
          "PIN": "1111",
          "Name": "book jt",
          "BL": "test",
          "Company": "Advanced Contact Center",
          "BU": "Contact Center BKK",
          "Department": "Center"
        },
        "result_record": [
          {
            "id": "1",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "2",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "1",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "2",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          }, {
            "id": "1",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "2",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          }, {
            "id": "1",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "2",
            "Name": "Call center",
            "Org_Short_Name": "BU-CC1",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          }


        ]
      }
    })
  },
  getSummarySupervisor: function (req, res) {
    return res.json({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "search_supervisor_resp": {
        "employee_detail": {
          "PIN": "0000",
          "Name": "book jt",
          "BL": "test",
          "Company": "Advanced Contact Center",
          "BU": "Contact Center BKK",
          "Department": "Center"
        },
        "result_record": [
          {
            "id": "1",
            "PIN": "0001",
            "Supervisor_Name": "book",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "2",
            "PIN": "0002",
            "Supervisor_Name": "test",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "3",
            "PIN": "0003",
            "Supervisor_Name": "exam",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "4",
            "PIN": "0004",
            "Supervisor_Name": "exam",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "5",
            "PIN": "0005",
            "Supervisor_Name": "BK",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "6",
            "PIN": "0006",
            "Supervisor_Name": "MJ",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          },
          {
            "id": "7",
            "PIN": "0007",
            "Supervisor_Name": "book",
            "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
            "Shift": "500.00",
            "Trans": "1000.00",
            "Attendance": "200.00",
            "Absent": "0",
            "Late": "0.00",
            "Leave": {
              "Sick": "0.00",
              "Business": "0.00",
              "Holiday": "0.00",
              "Others": "0.00"
            }
          }
        ]
      }
    })
  },
  getSummaryMonthly: function (req, res) {
    if (isNotEmpty(req.query.Type)) {
      if (req.query.Type.toUpperCase() == 'agent'.toUpperCase()) {
        console.log('agent')
        return res.json({
          "header": {
            "status": "S",
            "resp_dttm": "2016-08-12T00:00:00+00:00"
          },
          "search_monthly_resp": {
            "employee_detail": {
              "PIN": "1111",
              "Name": "book jt",
              "BL": "test",
              "Company": "Advanced Contact Center",
              "BU": "Contact Center BKK",
              "Department": "Center"
            },
            "result_record": [
              {
                "id": "1",
                "Month_Year": "November-2017",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "2",
                "Month_Year": "December-2017",
                "OT_Hours": { "ot_1": "2.00", "ot_1_5": "3.00", "ot_3": "2.00" },
                "Shift": "1500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "2",
                "Month_Year": "Janurary-2018",
                "OT_Hours": { "ot_1": "2.00", "ot_1_5": "3.00", "ot_3": "2.00" },
                "Shift": "1500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "2",
                "Month_Year": "February-2018",
                "OT_Hours": { "ot_1": "2.00", "ot_1_5": "3.00", "ot_3": "2.00" },
                "Shift": "1500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "2",
                "Month_Year": "March-2018",
                "OT_Hours": { "ot_1": "2.00", "ot_1_5": "3.00", "ot_3": "2.00" },
                "Shift": "1500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "2",
                "Month_Year": "Aoril-2018",
                "OT_Hours": { "ot_1": "2.00", "ot_1_5": "3.00", "ot_3": "2.00" },
                "Shift": "1500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              }
            ]
          }
        })
      } else if (req.query.Type.toUpperCase() == 'supervisor'.toUpperCase()) {
        console.log('Supervisor')
        return res.json({
          "header": {
            "status": "S",
            "resp_dttm": "2016-08-12T00:00:00+00:00"
          },
          "search_monthly_resp": {
            "employee_detail": {
              "PIN": "1111",
              "Name": "book jt",
              "BL": "test",
              "Company": "Advanced Contact Center",
              "BU": "Contact Center BKK",
              "Department": "Center"
            },
            "result_record": [
              {
                "id": "1",
                "PIN": "0001",
                "Employee_Name": "test",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "2",
                "PIN": "0002",
                "Employee_Name": "test2",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "3",
                "PIN": "0003",
                "Employee_Name": "test3",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              }, {
                "id": "3",
                "PIN": "0004",
                "Employee_Name": "นันธิดา ทรัพย์ประเสริฐ",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "2.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "3",
                "PIN": "0005",
                "Employee_Name": "test test",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "3",
                "PIN": "0006",
                "Employee_Name": "MJ",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              },
              {
                "id": "3",
                "PIN": "0007",
                "Employee_Name": "book",
                "OT_Hours": { "ot_1": "0.00", "ot_1_5": "0.00", "ot_3": "0.00" },
                "Shift": "500.00",
                "Trans": "1000.00",
                "Attendance": "200.00",
                "Absent": "0",
                "Late": "0.00",
                "Leave": {
                  "Sick": "0.00",
                  "Business": "0.00",
                  "Holiday": "0.00",
                  "Others": "0.00"
                }
              }
            ]
          }
        })

      }


    }
  }

};

function isNotEmpty(str) {
  if (str == null || str == undefined || str == '') {
    return false
  }
  return true
}

