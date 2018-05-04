
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

// Set up the express app
const app = express();

//batch
const cron = require('node-cron');
const fs = require('fs');
const batchService = require('./alwapp/service/batch-service');
const summaryService = require('./alwapp/service/summary-service');
const attendanceService = require('./alwapp/service/attendace-service');
// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
console.log("process.env.NODE_ENV 1" + process.env.NODE_ENV)
// Setup a default catch-all route that sends back a welcome message in JSON format.
require('./alwapp/router')(app);

//batch 

//  cron.schedule('*/10 * * * * *', async function () {
//   console.log('running every 3 second');


batchService.copyFromNas();
// batchService.importSL();

batchService.importTR();
// batchService.testQuery();

// attendanceService.isPerfectAttenDance();
// attendanceService.imPerfectAttenDance();
// summaryService.processSummaryDetail();

// });



app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of nothingness.',
}));

module.exports = app; 