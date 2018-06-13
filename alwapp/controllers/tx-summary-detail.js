/**
 * Summary-detailController
 *
 * @description :: Server-side logic for managing summary-details
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const summaryDetailModel = require('../models').TxSummaryDetail;
const ApiResponse = require('../class/api-response');
const Constant = require('../class/constant').Constant;
const moment = require('moment');

const employeeService = require('../service/employee-service');
const omService = require('../service/om-service');
const EmployeeInfo = require('../class/employee-info');
const ServiceError = require('../class/service-error');
const Op = require('../models').Sequelize.Op;

/**
 * Logging service
 */
const logService = require('../service/log-service');

const formatTimeReport = 'HH:mm'
module.exports = {



  /**
   * `Summary-detailController.list()`
   */
  list: async function (request, reply) {
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
  show: function (request, reply) {
    return reply({
      todo: 'show() is not implemented yet!'
    });
  },


  /**
   * `Summary-detailController.create()`
   */
  create: function (req, reply) {
    return reply({
      todo: 'create() is not implemented yet!'
    });
  },


  /**
   * `Summary-detailController.update()`
   */
  update: function (request, reply) {
    return reply({
      todo: 'update() is not implemented yet!'
    });
  },


  /**
   * `Summary-detailController.remove()`
   */
  remove: function (request, reply) {
    return res.json({
      todo: 'remove() is not implemented yet!'
    });
  },

  getSummaryDaily: async function (request, reply) {

    //     name:"sadfasd"
    //     surname:"asdasd"
    // {"search_daily":{"pin":"123123","dateFrom":"03/05/2018","dateTo":"18/05/2018"},"header":{"ref_id":"ref_id","language":"EN"}}
    try {
      let whereFindAll = {}
      let payload = request.payload.search_daily
      // check whether pin or name and surname has provided
      if (isNotEmpty(payload.pin)) {
        whereFindAll['pin'] = payload.pin
      } else if (payload.name && payload.surname) {
        // get pin from provided name or surname
        var employeeInfo = new EmployeeInfo();
        employeeInfo.nameEn = payload.name || '';
        employeeInfo.surnameEn = payload.surname || '';
        
        await omService.searchEmployeeDetail(employeeInfo)
        .then(employeeInfoResp => {
          if (logService.isDebugEnabled()) {
            logService.debug("employeeInfoResp.length = " + employeeInfoResp.length);
          }
          whereFindAll['pin'] = employeeInfoResp[0].pin;
        });
      } else {
        throw new ServiceError("Missing required parameters", Constant.API.STATUS_CODE_INVALID_PARAM);
      }
      
      var dateFrom,dateTo;
      
      if (isNotEmpty(payload.dateFrom)) {
        dateFrom = moment(payload.dateFrom, 'DD/MM/YYYY').utc(7).toDate();
      } else {
        if (isNotEmpty(payload.dateTo)) {
          // set default dateFrom to dateTo - 1
          dateFrom = moment(payload.dateTo, 'DD/MM/YYYY').subtract(1,'day').utc(7).toDate();
        } else {
          // set default dateFrom to yesterday if dateTo not present
          dateFrom = moment(new Date()).subtract(1,'day').utc(7).toDate();
        }
      }
      if (isNotEmpty(payload.dateTo)) {
        dateTo = moment(payload.dateTo, 'DD/MM/YYYY').utc(7).toDate();
      } else {
        // set default dateTo to dateFrom + 1
        dateTo = moment(dateFrom).add(1, 'day').toDate();
      }
      
      if (logService.isDebugEnabled()) {
        logService.debug("dateFrom = " + dateFrom);
        logService.debug("dateTo = " + dateTo);
      }

      // create where clause of record_date
      whereFindAll['record_date'] = {
        [Op.between] : [dateFrom,dateTo]
      }

      // set value for partition column
      // create month and year array
      var monthYearList = [];
      var nextMonth = moment(dateFrom).utc(7).set({hour:0,minute:0,second:0,millisecond:0});
      while (true)
      {
        if (nextMonth.toDate() <= dateTo) {
          monthYearList.push(nextMonth.format('MMYYYY'));
          nextMonth.add(1,'month');
          continue;
        } else {
          break;
        }
      }

      // to use partition table
      whereFindAll['record_month'] = {
        [Op.in] : monthYearList
      }

      var employeeInfo = await employeeService.getEmployeeDetailWithOrganizeByPin(whereFindAll['pin']);

      if (logService.isTraceEnabled()) {
        logService.trace(JSON.stringify(employeeInfo));
      }

      let obj = await summaryDetailModel.findAll({
        where: whereFindAll,
      }).then((todos) => {
        return nodeData = todos.map((node) => node.get({ plain: true }));
      }).catch((error) => { console.log(error) });
      let employeeInfoResp = objToJsonDaily(employeeInfo, obj, reply)

      let apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_SUCCESS;
      apiResponse.name = 'searchDailyResp';
      apiResponse.response = employeeInfoResp;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(200);
    } catch (err) {
      console.log(err);
      let apiResponse = new ApiResponse();
      apiResponse.status = Constant.API.STATUS_ERROR;
      apiResponse.message = err.message;
      apiResponse.responseTime = new Date();

      return reply.response(apiResponse).code(400);
    }
    // return reply.response({

    //   "header": {
    //     "status": "S",
    //     "resp_dttm": "2016-08-12T00:00:00+00:00"
    //   },
    //   "search_daily_resp": {
    //     "employeeDetail": {
    //       "pin": "1234",
    //       "name": "book",
    //       "bl": "test",
    //       "company": "Advanced Contact Center",
    //       "bu": "Contact Center BKK",
    //       "department": "Center"
    //     },
    //     "resultRecord": [
    //       {
    //         "id": "1",
    //         "date": "1/12/2018",
    //         "recordType": "OFF",
    //         "schedule": { "start": "", "end": "" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "", "clockOut": "" },
    //         "trans": "0.00",
    //         "shift": "0.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "Lost (06:00 - 15:00)",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "2",
    //         "date": "2/12/2018",
    //         "recordType": "ON",
    //         "schedule": { "start": "06:00", "end": "15:00" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "06:30", "clockOut": "15:30" },
    //         "trans": "0.00",
    //         "shift": "0.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "3",
    //         "date": "3/12/2018",
    //         "recordType": "ON",
    //         "schedule": { "start": "06:00", "end": "15:00" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "06:00", "clockOut": "14:30" },
    //         "trans": "0.00",
    //         "shift": "0.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "4",
    //         "date": "4/12/2018",
    //         "recordType": "ON",
    //         "schedule": { "start": "06:00", "end": "15:00" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "06:00", "clockOut": "15:00" },
    //         "trans": "0.00",
    //         "shift": "100.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "5",
    //         "date": "5/12/2018",
    //         "recordType": "ot ก่อน",
    //         "schedule": { "start": "08:00", "end": "17:00" },
    //         "ot": { "start": "06:00", "end": "08:00" },
    //         "actual": { "clockIn": "06:00", "clockOut": "20:00" },
    //         "trans": "0.00",
    //         "shift": "100.00",
    //         "otHours": { "ot1": "2.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "6",
    //         "date": "5/12/2018",
    //         "recordType": "ot หลัง",
    //         "schedule": { "start": "08:00", "end": "17:00" },
    //         "ot": { "start": "17:00", "end": "20:00" },
    //         "actual": { "clockIn": "06:00", "clockOut": "20:00" },
    //         "trans": "0.00",
    //         "shift": "100.00",
    //         "otHours": { "ot1": "3.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "7",
    //         "date": "6/12/2018",
    //         "recordType": "OFF",
    //         "schedule": { "start": "", "end": "" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "", "clockOut": "" },
    //         "trans": "0.00",
    //         "shift": "0.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "OFF",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "8",
    //         "date": "7/12/2018",
    //         "recordType": "VL",
    //         "schedule": { "start": "06:00", "end": "15:00" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "", "clockOut": "" },
    //         "trans": "0.00",
    //         "shift": "0.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "VL (06:00 - 15:00)",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       },
    //       {
    //         "id": "9",
    //         "date": "8/12/2018",
    //         "recordType": "bl",
    //         "schedule": { "start": "06:00", "end": "15:00" },
    //         "ot": { "start": "", "end": "" },
    //         "actual": { "clockIn": "", "clockOut": "" },
    //         "trans": "0.00",
    //         "shift": "0.00",
    //         "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
    //         "remark": "bl (06:00 - 15:00)",
    //         "updatedDate": "15/12/2018",
    //         "updatedBy": "Interim"
    //       }
    //     ]
    //   }


    // });

  },
  getSummaryAdjust: function (request, reply) {
    return reply.response({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "searchAdjustResp": {
        "employeeDetail": {
          "pin": "1234",
          "name": "book",
          "bl": "test",
          "company": "Advanced Contact Center",
          "bu": "Contact Center BKK",
          "department": "Center"
        },
        "resultRecord": [
          {
            "id": "1",
            "pin": "0001",
            "name": "test test",
            "organizationShortName": "CU-CC1",
            "scheduleDate": "16/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          },

          {
            "id": "2",
            "pin": "0002",
            "name": "test",
            "organizationShortName": "bu-CC1",
            "scheduleDate": "12/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          },

          {
            "id": "3",
            "pin": "0003",
            "name": "book",
            "organizationShortName": "bu-CC1",
            "scheduleDate": "12/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          },

          {
            "id": "4",
            "pin": "0004",
            "name": "นันธิดา ทรัพย์ประเสริฐ",
            "organizationShortName": "bu-CC1",
            "scheduleDate": "13/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          },

          {
            "id": "5",
            "pin": "0005",
            "name": "test",
            "organizationShortName": "bu",
            "scheduleDate": "12/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          },

          {
            "id": "6",
            "pin": "0006",
            "name": "test",
            "organizationShortName": "bu-CC1",
            "scheduleDate": "12/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          },

          {
            "id": "7",
            "pin": "0007",
            "name": "test",
            "organizationShortName": "bu-CC1",
            "scheduleDate": "12/1/2018",
            "adjustReason": "Create Compensate Over 6 Days SOWFM-2017006334",
            "adjustDate": "15/12/2017 14:17:34"
          }
        ]
      }
    })
  },
  getApproveAllowanceReport: function (request, reply) {
    return reply.response({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "searchApproveResp": {
        "employeeDetail": {
          "pin": "1234",
          "name": "book",
          "bl": "test",
          "company": "Advanced Contact Center",
          "bu": "Contact Center BKK",
          "department": "Center"
        },
        "resultRecord": [
          {
            "id": "1",
            "pin": "0001",
            "employeeName": "นันธิดา ทรัพย์ประเสริฐ",
            "organizationShortName": "bu-CC1",
            "shift": { "Day": "06:00", "total": "15:00" },
            "trans": { "Day": "06:00", "total": "15:00" },
            "attendance": { "imperfect": "06:00", "perfect": "15:00" },
            "leave": { "annual": "6:00", "business": "0:00", "vacation": "4:00" },
            "total": "2000.00",
            "reason": "example"
          },

          {
            "id": "2",
            "pin": "0002",
            "employeeName": "test test",
            "organizationShortName": "bu-CC1",
            "shift": { "Day": "06:00", "total": "15:00" },
            "trans": { "Day": "06:00", "total": "15:00" },
            "attendance": { "imperfect": "06:00", "perfect": "15:00" },
            "leave": { "annual": "6:00", "business": "0:00", "vacation": "4:00" },
            "total": "2000.00",
            "reason": "example"
          },
          {
            "id": "3",
            "pin": "0003",
            "employeeName": "book",
            "organizationShortName": "bu-CC1",
            "shift": { "Day": "06:00", "total": "15:00" },
            "trans": { "Day": "06:00", "total": "15:00" },
            "attendance": { "imperfect": "06:00", "perfect": "15:00" },
            "leave": { "annual": "6:00", "business": "0:00", "vacation": "4:00" },
            "total": "2000.00",
            "reason": "example"
          },

          {
            "id": "4",
            "pin": "0004",
            "employeeName": "test test",
            "organizationShortName": "bu-CC1",
            "shift": { "Day": "06:00", "total": "15:00" },
            "trans": { "Day": "06:00", "total": "15:00" },
            "attendance": { "imperfect": "06:00", "perfect": "15:00" },
            "leave": { "annual": "6:00", "business": "0:00", "vacation": "4:00" },
            "total": "2000.00",
            "reason": "example"
          },
          {
            "id": "5",
            "pin": "0005",
            "employeeName": "test",
            "organizationShortName": "bu-CC1",
            "shift": { "Day": "06:00", "total": "15:00" },
            "trans": { "Day": "06:00", "total": "15:00" },
            "attendance": { "imperfect": "06:00", "perfect": "15:00" },
            "leave": { "annual": "6:00", "business": "0:00", "vacation": "4:00" },
            "total": "2000.00",
            "reason": "example"
          },

          {
            "id": "6",
            "pin": "0006",
            "employeeName": "example",
            "organizationShortName": "bu-CC1",
            "shift": { "Day": "06:00", "total": "15:00" },
            "trans": { "Day": "06:00", "total": "15:00" },
            "attendance": { "imperfect": "06:00", "perfect": "15:00" },
            "leave": { "annual": "6:00", "business": "0:00", "vacation": "4:00" },
            "total": "2000.00",
            "reason": "example"
          }
        ]
      }

    })
  },
  getSummaryOrganization: function (request, reply) {
    return reply.response({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "searchOrganizationResp": {
        "employeeDetail": {
          "pin": "1111",
          "name": "book jt",
          "bl": "test",
          "company": "Advanced Contact Center",
          "bu": "Contact Center BKK",
          "department": "Center"
        },
        "resultRecord": [
          {
            "id": "1",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "2",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "1",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "2",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          }, {
            "id": "1",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "2",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          }, {
            "id": "1",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "2",
            "name": "Call center",
            "orgShortName": "bu-CC1",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          }


        ]
      }
    })
  },
  getSummarySupervisor: function (request, reply) {
    return reply.response({
      "header": {
        "status": "S",
        "resp_dttm": "2016-08-12T00:00:00+00:00"
      },
      "searchSupervisorResp": {
        "employee_detail": {
          "pin": "0000",
          "name": "book jt",
          "bl": "test",
          "company": "Advanced Contact Center",
          "bu": "Contact Center BKK",
          "department": "Center"
        },
        "resultRecord": [
          {
            "id": "1",
            "pin": "0001",
            "supervisorName": "book",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "2",
            "pin": "0002",
            "supervisorName": "test",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "3",
            "pin": "0003",
            "supervisorName": "exam",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "4",
            "pin": "0004",
            "supervisorName": "exam",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "5",
            "pin": "0005",
            "supervisorName": "BK",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "6",
            "pin": "0006",
            "supervisorName": "MJ",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          },
          {
            "id": "7",
            "pin": "0007",
            "supervisorName": "book",
            "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
            "shift": "500.00",
            "trans": "1000.00",
            "attendance": "200.00",
            "absent": "0",
            "late": "0.00",
            "leave": {
              "sick": "0.00",
              "business": "0.00",
              "holiday": "0.00",
              "others": "0.00"
            }
          }
        ]
      }
    })
  },
  getSummaryMonthly: function (request, reply) {
    if (isNotEmpty(request.query.Type)) {
      if (request.query.Type.toUpperCase() == 'agent'.toUpperCase()) {
        console.log('agent')
        return reply.response({
          "header": {
            "status": "S",
            "resp_dttm": "2016-08-12T00:00:00+00:00"
          },
          "searchMonthlyResp": {
            "employeeDetail": {
              "pin": "1111",
              "name": "book jt",
              "bl": "test",
              "company": "Advanced Contact Center",
              "bu": "Contact Center BKK",
              "department": "Center"
            },
            "resultRecord": [
              {
                "id": "1",
                "monthYear": "November-2017",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "2",
                "monthYear": "December-2017",
                "otHours": { "ot1": "2.00", "ot15": "3.00", "ot3": "2.00" },
                "shift": "1500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "2",
                "monthYear": "Janurary-2018",
                "otHours": { "ot1": "2.00", "ot15": "3.00", "ot3": "2.00" },
                "shift": "1500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "2",
                "monthYear": "February-2018",
                "otHours": { "ot1": "2.00", "ot15": "3.00", "ot3": "2.00" },
                "shift": "1500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "2",
                "monthYear": "March-2018",
                "otHours": { "ot1": "2.00", "ot15": "3.00", "ot3": "2.00" },
                "shift": "1500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "2",
                "monthYear": "Aoril-2018",
                "otHours": { "ot1": "2.00", "ot15": "3.00", "ot3": "2.00" },
                "shift": "1500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              }
            ]
          }
        })
      } else if (request.query.Type.toUpperCase() == 'supervisor'.toUpperCase()) {
        console.log('Supervisor')
        return reply.response({
          "header": {
            "status": "S",
            "resp_dttm": "2016-08-12T00:00:00+00:00"
          },
          "searchMonthlyResp": {
            "employeeDetail": {
              "pin": "1111",
              "name": "book jt",
              "bl": "test",
              "company": "Advanced Contact Center",
              "bu": "Contact Center BKK",
              "department": "Center"
            },
            "resultRecord": [
              {
                "id": "1",
                "pin": "0001",
                "employeeName": "test",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "2",
                "pin": "0002",
                "employeeName": "test2",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "3",
                "pin": "0003",
                "employeeName": "test3",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              }, {
                "id": "3",
                "pin": "0004",
                "employeeName": "นันธิดา ทรัพย์ประเสริฐ",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "2.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "3",
                "pin": "0005",
                "employeeName": "test test",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "3",
                "pin": "0006",
                "employeeName": "MJ",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
                }
              },
              {
                "id": "3",
                "pin": "0007",
                "employeeName": "book",
                "otHours": { "ot1": "0.00", "ot15": "0.00", "ot3": "0.00" },
                "shift": "500.00",
                "trans": "1000.00",
                "attendance": "200.00",
                "absent": "0",
                "late": "0.00",
                "leave": {
                  "sick": "0.00",
                  "business": "0.00",
                  "holiday": "0.00",
                  "others": "0.00"
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

function convertShift(flag) {
  if (flag == 'Y') {
    return '170'
  } else {
    return '0.00'
  }
}
function convertTran(flag) {
  if (flag == 'Y') {
    return '200'
  } else {
    return '0.00'
  }
}

function convertOT(ot) {
  if (ot == 0) {
    return '0.00'
  } else {
    return ot
  }
}

function getObjRecordDaily() {
  return record = {
    id: '',
    date: '',
    recordType: '',
    schedule: {
      start: '',
      end: ''
    },
    ot: {
      start: '',
      end: ''
    },
    actual:
      {
        clockIn: '',
        clockOut: ''
      },
    trans: '',
    shift: '',
    otHours:
      {
        ot1: '',
        ot15: '',
        ot3: ''
      },
    remark: '',
    updatedDate: '',
    updatedBy: ''
  }
}

function toEmployeeDetail(employeeInfo) {

  // find bu and department
  var fc, sc, bl, bu, dp, co;

  if (employeeInfo.organizeInfoList && employeeInfo.organizeInfoList.length > 0) {
    employeeInfo.organizeInfoList.forEach(function (organizeInfo) {
      if (organizeInfo.orgLevel == 'BU') {
        bu = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
      } else if (organizeInfo.orgLevel == 'BL') {
        bl = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
      } else if (organizeInfo.orgLevel == 'DP') {
        dp = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
      } else if (organizeInfo.orgLevel == 'CO') {
        co = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
      } else if (organizeInfo.orgLevel == 'FC') {
        fc = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
      } else if (organizeInfo.orgLevel == 'SC') {
        sc = organizeInfo.orgName + "(" + organizeInfo.orgDesc + ")";
      }
    });
  }

  return {
    pin: employeeInfo.pin,
    name: employeeInfo.nameEng + ' ' + employeeInfo.surnameEng,
    bl: bl,
    company: co || employeeInfo.companyName,
    bu: bu,
    department: dp,
    sc : sc,
    fc : fc
  }
}

function objToJsonDaily(employeeInfo, obj, reply) {
  // console.log(reply)
  let employeeInfoResp = {
    employeeDetail: toEmployeeDetail(employeeInfo),
    resultRecord: []
  }

  for (let rec of obj) {
    let record = getObjRecordDaily();
    record.date = moment(rec.recordDate).format('DD/MM/YYYY')
    record.recordType = rec.recordType
    record.schedule.start = isNotEmpty(rec.scheduleStartDt) ? moment(rec.scheduleStartDt).format(formatTimeReport) : ''
    record.schedule.end = isNotEmpty(rec.scheduleEndDt) ? moment(rec.scheduleEndDt).format(formatTimeReport) : ''
    record.ot.start = isNotEmpty(rec.otStartDt) ? moment(rec.otStartDt).format(formatTimeReport) : ''
    record.ot.end = isNotEmpty(rec.otEndDt) ? moment(rec.otEndDt).format(formatTimeReport) : ''
    record.actual.clockIn = isNotEmpty(rec.actualClockinDt) ? moment(rec.actualClockinDt).format(formatTimeReport) : ''
    record.actual.clockOut = isNotEmpty(rec.actualClockoutDt) ? moment(rec.actualClockoutDt).format(formatTimeReport) : ''
    record.trans = convertTran(rec.transportFlag)
    record.shift = convertShift(rec.shiftFlag)
    record.otHours.ot1 = convertOT(rec.ot10)
    record.otHours.ot15 = convertOT(rec.ot15)
    record.otHours.ot3 = convertOT(rec.ot30)
    record.remark = rec.remark
    record.updatedDate = isNotEmpty(rec.createDt) ? moment(rec.createDt).format('DD/MM/YYYY') : ''
    record.updatedBy = rec.createBy

    employeeInfoResp.resultRecord.push(record)
  }

  return employeeInfoResp
}

