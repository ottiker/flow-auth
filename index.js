var crypto = require('crypto');
var clientSessions = require('client-sessions');
var session = require('./lib/session');
var token = require('./lib/token');

exports.init = function (config, ready) {

    config = Object.keys(config).length ? config : process.config.flow;

    if (!config || !config.session || !config.token) {
        return ready(new Error('Flow-auth.init: Invalid config.'));
    }

    this.clientSessions = clientSessions(process.config.flow.session);
    this._session = process.config.flow.session;
    this._token = process.config.flow.token;
    this._token.cookieName = 'token';

    ready();
};

exports.session = session;
exports.token = token;
