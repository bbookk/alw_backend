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
const SamlStrategy = require('passport-saml').Strategy;
const passport = require('passport');

const summaryService = require('../service/summary-service');

passport.use(new SamlStrategy(
  {
    path: '/login/callback',
    entryPoint: 'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
    issuer: 'passport-saml'
  },
  function (profile, done) {
    console.log(profile)
    console.log(done)
    findByEmail(profile.email, function (err, user) {
      if (err) {
        return done(err);
      }
      return done(null, user);
    });
  })
);

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));
  app.post('/api/accessInfo', infoAccessController.create);
  app.get('/api/accessInfo/find', infoAccessController.list);
  app.get('/api/test', (req, res) => {
    res.redirect('http://10.137.16.118:80/home')
  });
  app.post('/api/accessInfo/findall', infoAccessController.create);
  app.get('/api/mstParam/findall', mstParamController.list);
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
  app.get('/start', (req, res) => {
    summaryService.processSummaryDetail(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });

  app.get('/login',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function (req, res) {
      console.log(req)
      console.log(res)
      res.redirect('/');
    });

  app.get('/login/callback', (req, res) => {
    console.log('xx')
    res.redirect('http://10.137.16.118:80/home')
  });
};
