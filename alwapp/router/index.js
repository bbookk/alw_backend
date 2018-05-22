/**
  * Info Controller
  */

const infoAccessController = require('../controllers').infoAccessController
const infoAvayaPinController = require('../controllers').infoAvayaPinController
const infoHolidayController = require('../controllers').infoHolidayController
const infoRoleObjectController = require('../controllers').infoRoleObjectController
const infoScheduleController = require('../controllers').infoScheduleController
const infoUsedQuotaController = require('../controllers').infoUsedQuotaController
const infoActivityController = require('../controllers').infoActivityController

/**
   * log Controller
   */


const activityLogController = require('../controllers').activityLogController;
const batchLogController = require('../controllers').batchLogController;
const transactionLogController = require('../controllers').transactionLogController;


/**
   * MST Controller
   */
const mstDDlController = require('../controllers').mstDDlController;
const mstObjectController = require('../controllers').mstObjectController;
const mstParamController = require('../controllers').mstParamController;
const mstRoleController = require('../controllers').mstRoleController;

/**
   * TX Controller
   */
const txSLHeaderController = require('../controllers').txSLHeaderController
const txSLDetailController = require('../controllers').txSLDetailController
const txTRHeaderController = require('../controllers').txTRHeaderController
const txTRDetailController = require('../controllers').txTRDetailController
const txUsedQuotaDetailController = require('../controllers').txUsedQuotaDetailController
const txUsedQuotaHeaderController = require('../controllers').txUsedQuotaHeaderController
const txSummaryDetailController = require('../controllers').txSummaryDetailController
const txAvayaPinDetailController = require('../controllers').txAvayaPinDetailController
const txAvayaPinHeaderController = require('../controllers').txAvayaPinHeaderController
const txActivityDetailController = require('../controllers').txActivityDetailController
const txActivityHeaderController = require('../controllers').txActivityHeaderController

/**
   * Employee Controller
   */
const employeeController = require('../controllers').employeeController

const summaryService = require('../service/summary-service');

var express = require('express');
var router = express.Router();

/**
 * Logging service
 */
var logService = require('../service/log-service');

router.use(function (req, res, next) {
  logService.info('Start :' + req.url);

  // keep start time in milliseconds
  var start = Date.now();
  next();
  // keep finish time in milliseconds
  var end = Date.now();
  // log access log with processing time (end-start)
  logService.log_access(req, res, end-start);

  logService.info('End :' + req.url);
});

router.get('/', (req, res) => res.status(200).send({
  message: 'Welcome to the Todos API!',
}));

router.post('/accessInfo', infoAccessController.create);
router.get('/accessInfo/find', infoAccessController.list);
// router.get('/test', (req, res) => {
//   //res.redirect('http://10.137.16.118:80/home')
//   res.set('Content-Type', 'text/plain');
//   res.status(200).send('asdsadsd')
// });
router.post('/accessInfo/findall', infoAccessController.create);
router.get('/mstParam/findall', mstParamController.list);
// app.post('/api/txDetailActivity', txActivityDetailController.create);
// app.post('/api/headerActivity', txActivityHeaderController.create);

//   app.get('/api/todos', todosController.list);
//   app.get('/api/todos/:todoId', todosController.retrieve);
//   app.put('/api/todos/:todoId', todosController.update);
//   app.delete('/api/todos/:todoId', todosController.destroy);

//   app.post('/api/todos/:todoId/items', todoItemsController.create);
//   app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.update);
//   app.delete(
//     '/api/todos/:todoId/items/:todoItemId', todoItemsController.destroy
//   );
//   app.all('/api/todos/:todoId/items', (req, res) => res.status(405).send({
//     message: 'Method Not Allowed',
//   }));

router.get('/start', (req, res) => {
  summaryService.processSummaryDetail(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});



router.post('/report/getSummaryMonthly', (req, res) => {
  txSummaryDetailController.getSummaryMonthly(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});

router.post('/report/getSummarySupervisor', (req, res) => {
  txSummaryDetailController.getSummarySupervisor(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});
router.post('/report/getSummaryOrganization', (req, res) => {
  txSummaryDetailController.getSummaryOrganization(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});
router.post('/report/getSummaryAdjust', (req, res) => {
  txSummaryDetailController.getSummaryAdjust(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});
router.post('/report/getApproveAllowanceReport', (req, res) => {
  txSummaryDetailController.getApproveAllowanceReport(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});
router.post('/report/getSummaryDaily', (req, res) => {
  txSummaryDetailController.getSummaryDaily(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});

router.get('/test', (req, res) => {
  return res.json({
    todo: 'list() is not implemented yet!'
  });
});

router.post('/testPost', (req, res) => {

  console.log('>>>>>>> /testPost <<<<<<<')
  console.log('body', req.body)
  console.log('body messsge', req.body.start)
  console.log('body messsge', req.body.end)
  return res.json({
    "start": "test Post pass1",
    "end": "test Post pass2"
  });

});

/**
 * /api/employee/00009218
 */
router.get('/employee/:pin', async (req, res) => {
  var employeeInfoReq = new (require('../class').employeeInfo)();
  employeeInfoReq.pin = req.params.pin;

  employeeController.getEmployeeInfoByPin(req, res);
});

/**
 *  /api/holiday?start=2018/01/01&end=2018/01/31
 */
router.get('/holiday', async (req, res) => {
  employeeController.getHolidayByDate(req, res);
});

module.exports = router;
