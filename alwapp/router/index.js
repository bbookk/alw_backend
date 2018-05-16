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
// const mailer = require("nodemailer");

//const httpntlm = require('httpntlm');

let payload = {
  "methodName": "OM_WS_SearchEmployeeDetail",
  "omCode": "OMTESTALLOWANCE",
  "parameterList":
    [
      {
        "name": "CO",
        "value": "Advanced Info Service"
      },
      {
        "name": "BU",
        "value": ""
      },
      {
        "name": "DP",
        "value": ""
      },
      {
        "name": "SC",
        "value": ""
      },
      {
        "name": "FC",
        "value": ""
      },
      {
        "name": "NameEN",
        "value": ""
      },
      {
        "name": "SurnameEN",
        "value": ""
      },
      {
        "name": "NameTH",
        "value": ""
      },
      {
        "name": "SurnameTH",
        "value": ""
      },
      {
        "name": "PositionName",
        "value": ""
      },
      {
        "name": "NickName",
        "value": ""
      },
      {
        "name": "JobDesc",
        "value": ""
      },
      {
        "name": "Pin",
        "value": ""
      },
      {
        "name": "Username",
        "value": ""
      },
      {
        "name": "TelNo",
        "value": ""
      },
      {
        "name": "MobileNo",
        "value": ""
      },
      {
        "name": "ManagerName",
        "value": ""
      }
    ],
  "transactionID": "8e1f2a96-69d5-4bc4-ac01-99e771c024e3"
}


passport.use(new SamlStrategy(
  {
    // path:'/login/callback',
    //path: 'https://10.138.44.159/Auth/CheckLogin',
    path: 'https://10.137.16.118:80/index.html',
    //entryPoint: 'https://test-ids.intra.ais:9443/samlsso',
    entryPoint: ' https://test-ids.ais.co.th/samlsso',
    //entryPoint: 'https://stg-itap.intra.ais/SSOAuthentication/Login',
    // cert: 'MIICNTCCAZ6gAwIBAgIES343gjANBgkqhkiG9w0BAQUFADBVMQswCQYDVQQGEwJVUzELMAkGA1UECAwCQ0ExFjAUBgNVBAcMDU1vdW50YWluIFZpZXcxDTALBgNVBAoMBFdTTzIxEjAQBgNVBAMMCWxvY2FsaG9zdDAeFw0xMDAyMTkwNzAyMjZaFw0zNTAyMTMwNzAyMjZaMFUxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJDQTEWMBQGA1UEBwwNTW91bnRhaW4gVmlldzENMAsGA1UECgwEV1NPMjESMBAGA1UEAwwJbG9jYWxob3N0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCUp/oV1vWc8/TkQSiAvTousMzOM4asB2iltr2QKozni5aVFu818MpOLZIr8LMnTzWllJvvaA5RAAdpbECb+48FjbBe0hseUdN5HpwvnH/DW8ZccGvk53I6Orq7hLCv1ZHtuOCokghz/ATrhyPq+QktMfXnRS4HrKGJTzxaCcU7OQIDAQABoxIwEDAOBgNVHQ8BAf8EBAMCBPAwDQYJKoZIhvcNAQEFBQADgYEAW5wPR7cr1LAdq+IrR44iQlRG5ITCZXY9hI0PygLP2rHANh+PYfTmxbuOnykNGyhM6FjFLbW2uZHQTY1jMrPprjOrmyK5sjJRO4d1DeGHT/YnIjs9JogRKv4XHECwLtIVdAbIdWHEtVZJyMSktcyysFcvuhPQK8Qc/E/Wq8uHSCo=',
    issuer: 'ACCALW'
    //issuer: 'FingerScan'
  },
  function (profile, done) {
    console.log(profile)
    return done(profile)
    // test(profile.email, function (err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   return done(null, user);
    // });
  })
);

// var smtp = {
//   host: '10.252.160.41', //set to your host name or ip
//   port: 25, //25, 465, 587 depend on your 
//   secure: false, // use SSL
//   auth: {
//     user: 'supanm97@orcsf.postbox.in.th', //user account
//     pass: 'ais@MAY18' //user password
//   }
// };
//var smtpTransport = mailer.createTransport(smtp);

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));
  app.post('/api/accessInfo', infoAccessController.create);
  app.get('/api/accessInfo/find', infoAccessController.list);
  app.get('/api/test', (req, res) => {
    //res.redirect('http://10.137.16.118:80/home')
    res.set('Content-Type', 'text/plain');
    res.status(200).send('asdsadsd')
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



  app.post('/api/report/getSummaryMonthly', (req, res) => {
    txSummaryDetailController.getSummaryMonthly(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });
  app.post('/api/report/getSummarySupervisor', (req, res) => {
    txSummaryDetailController.getSummarySupervisor(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });
  app.post('/api/report/getSummaryOrganization', (req, res) => {
    txSummaryDetailController.getSummaryOrganization(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });
  app.post('/api/report/getSummaryAdjust', (req, res) => {
    txSummaryDetailController.getSummaryAdjust(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });
  app.post('/api/report/getApproveAllowanceReport', (req, res) => {
    txSummaryDetailController.getApproveAllowanceReport(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });
  app.post('/api/report/getSummaryDaily', (req, res) => {
    txSummaryDetailController.getSummaryDaily(req, res);
    // res.status(200).send({
    //   message: 'Welcome to the beginning of nothingness.',
  });

  app.get('/test', (req, res) => {
    return res.json({
      todo: 'list() is not implemented yet!'
    });
  });

  app.post('/testPost', (req, res) => {

    console.log('>>>>>>> /testPost <<<<<<<')
    console.log('body', req.body)
    console.log('body messsge', req.body.start)
    console.log('body messsge', req.body.end)
    return res.json({
      "start": "test Post pass1",
      "end": "test Post pass2"
    });

  });

  app.get('/api/login',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function (req, res) {
      console.log('res:', res)
      res.redirect('/');
    });

  app.get('/login/callback', (req, res) => {
    console.log('xx')
    //res.redirect('http://10.137.16.118:80/home')
  });



  // app.get('/mail', async (req, res) => {

  //   var mail = {
  //     from: '', //from email (option)
  //     to: 'maneenus@corp.ais900dev.org', //to email (require)
  //     subject: "Subject Text", //subject
  //     html: `<p>Test ALW</p>`  //email body
  //   }
  //   await smtpTransport.sendMail(mail, function (error, response) {
  //     smtpTransport.close();
  //     if (error) {
  //       //error handler
  //       console.log(error)
  //     } else {
  //       //success handler 
  //       console.log('send email success');
  //     }
  //   });
  //   return res.status(200).send('mail server test')
  // });

  // app.get('/om', async (req, res) => {
  //   httpntlm.post({
  //     url: "https://test-omws.ais.co.th/omws/api/WS_OM_OMService.svc/queryProfileData",
  //     username: 'stg-um_ehr',
  //     password: 'gSkZ#@D2ax!P',
  //     workstation: '',
  //     domain: 'corp-ais900dev',
  //     body: payload,
  //     // headers: {
  //     //   'Content-type': 'application/json',
  //     // }
  //   }, function (err, res) {
  //     if (err) return res.status(200).send(err);

  //     return res.status(200).send(res.body)
  //   });

  // });
};


