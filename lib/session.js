var sessions = require('client-sessions');
var clientSession;
var sessionConfig;

exports.init = function (config) {
    sessionConfig = config;
    clientSession = sessions(config);
};

// get session data
exports.get = function (options, data, next) {
    var req = data.req;
    var res = data.res;

    clientSession(req, res, function () {

        if (req.session._exp <= new Date().getTime()) {
            return next('Flow-auth.session.get: Expired.');
        }

        data.session = req.session
        next(null, data);
    });
};

// set session data
exports.set = function (options, data, next) {

    if (!data.req || !data.req.session) {
        return next(new Error('Flow-auth.session.set: No session found.'));
    }

    data.req.session.user = data.user;
    data.req.session.role = data.role;
    data.req.session.lang = data.lang;
    data.req.session._exp = new Date().getTime() + sessionConfig.duration;
    next(null, data);
};

// destroy the session
exports.destroy = function (options, data, next) {
    data.req.session.reset();
    next(null, data);
};
