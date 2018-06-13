const jwt = require('hapi-auth-jwt2');

var env = process.env.NODE_ENV || 'local';
var secret = require('../config/jwt-key.json')[env].secret;

const authJwt = {
  name: 'auth-jwt',
  version: '1.0.0',
  register: function(server, options) {
    // server.register(jwt, registerAuth);
    // server.register(jwt, registerAuth);

    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validate: require('../service/authentication-service').verifyClaims,
      verifyOptions: {algorithms: [ 'HS256' ]}
    });
  
    server.auth.default('jwt');
  }
};

module.exports = authJwt;