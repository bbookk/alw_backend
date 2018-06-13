var env = process.env.NODE_ENV || 'local';
const batchService = require('../service/batch-service');

const batchImport = {
  name: 'batch-import',
  version: '1.0.0',
  register: function(server, options) {
    // server.register(jwt, registerAuth);
    // server.register(jwt, registerAuth);
    batchService.copyFromNas();
    batchService.importSL();
    batchService.importTR();
  }
};

module.exports = batchImport;