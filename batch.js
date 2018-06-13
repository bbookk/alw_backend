const express = require('express');
const bodyParser = require('body-parser');
//const log4js = require('log4js');

// Set up the express app
const app = express();

//batch
const cron = require('node-cron');
const fs = require('fs');
const summaryService = require('./alwapp/service/summary-service');
const batchService = require('./alwapp/service/batch-service');
const commonService = require('./alwapp/service/common-service');
const logger = require('./alwapp/service/log-service')

// Parse incoming requests data (https://github.com/expressjs/body-parser)
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// console.log("process.env.NODE_ENV 1" + process.env.NODE_ENV)
// Setup a default catch-all route that sends back a welcome message in JSON format.
// require('./alwapp/router')(app);

//batch 
// cron.schedule('2 * * * * *', async function () {
//   console.log('running every 3 second');


// });
loadMstParam();

app.get('/start', (req, res) => {
  summaryService.processSummaryDetail(req, res);
  // res.status(200).send({
  //   message: 'Welcome to the beginning of nothingness.',
});


batch();

module.exports = app;

function loadMstParam() {
  try {
    logger.info('loadParamConstant')
    commonService.loadParamConstant();
  } catch (e) {
    logger.error(e)
  }
}

function batch() {
  // batchService.testCBP();
  batchService.copyFromNas();
  batchService.importSL();
  batchService.importTR();
}



