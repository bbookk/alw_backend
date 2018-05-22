const omService = require('../service/om-service');
const rdpService = require('../service/rdp-service');

module.exports = {
  async getEmployeeInfoByPin(request, reply) {
    // mapping json response to EmployeeInfo
    var employeeInfoReq = new (require('../class').employeeInfo)();
    employeeInfoReq.pin = request.params.pin;

    try {
      await omService.searchEmployeeDetail(employeeInfoReq)
      .then(_employeeInfoResp => {
          employeeInfoResp = _employeeInfoResp;
      })
      .catch(err => {
          throw err;
      });
      
      return reply.response(employeeInfoResp).code(200);
    } catch (err) {
      return reply.response(err.message).code(400);
    }
  },

  async getHolidayByDate(request, reply) {
    var holidayList = null;
    try {
        // get start / end from http request parameter
        var start = request.query.start;
        var end = request.query.end;
    
        await rdpService.getHolidayByDate(start, end)
        .then(_holidayList => {
            holidayList = _holidayList;
        })
        .catch(err => {
          throw err;
        });

        return reply.response(holidayList).code(200);
    } catch (err) {
        return reply.response(err.message).code(400);
    }
  },
};
