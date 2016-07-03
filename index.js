var crypto = require('crypto');
var session = require('./lib/session');
var token = require('./lib/token');

// TODO handle configurations
// - session
// - token
var config = process.config.flow['flow-auth'];

console.log('Flow-auth.config:', config);

session.init(config.session);
token.init(config.token);

exports.session = session;
exports.token = token;
