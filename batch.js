const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');

// Set up the express app
const app = express();

//batch
const cron = require('node-cron');
const fs = require('fs');

const batchService = require('./alwapp/service/batch-service');

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

batchService.copyFromNas();
batchService.importSL();
batchService.importTR();

module.exports = app; 

