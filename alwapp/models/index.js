'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

/**
 * Logging service
 */
const logService = require('../service/log-service');

// to override logging config
config.logging = function(str) {
  if (logService.isDebugEnabled()) {
    logService.debug("[SQL] " + str);
  }
}

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// console.log("model")
// /* eslint global-require: "off" */


// console.log('__dirname'+__dirname)
// console.log('basename'+basename)
// console.log('path'+path)
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    //  console.log("file"+file);
    // console.log((path.join(__dirname, file)));
    // console.log(sequelize['import'](path.join(__dirname, file)));
    var model = sequelize['import'](path.join(__dirname, file));
    // module.exports = model;
    // console.log('./'+file)
    // require('./'+file).initRelations();
    db[model.name] = model;
    module.exports = model
  });

Object.keys(db).forEach(modelName => {
 // console.log('associate:'+db[modelName].associate);
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
