const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Set up the express app
const app = express() ;

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// console.log("process.env.NODE_ENV 1" + process.env.NODE_ENV)
// Setup a default catch-all route that sends back a welcome message in JSON format.
// require('./alwapp/router')(app);

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var router = require('./alwapp/router');
app.use('/api', router);

module.exports = app; 
