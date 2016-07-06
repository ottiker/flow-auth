var sessions = require('client-sessions');

exports.create = function (options, data, next) {

    if (!data.content) {
        var error = new Error('Flow-auth.token.create: No token content.');
        error._ = data;
        return next(error);
    }

    data.token = sessions.util.encode(this._token, data.content, this._token.duration);
    next(null, data);
};

exports.validate = function (options, data, next) {

    if (!data.token) {
        var error = new Error('Flow-auth.token.validate: No token found.');
        error._ = data;
        return next(error);
    }

    // validate token
    var token = sessions.util.decode(this._token, data.token);
    if (!token) {
        var error = new Error('Flow-auth.token.validate: Invalid.');
        error._ = data;
        return next(error);
    }

    // validate duration
    if ((token.createdAt + token.duration) <= new Date().getTime()) {
        var error = new Error('Flow-auth.token.validate: Expired.');
        error._ = data;
        return next(error);
    }

    data.content = token.content;

    next(null, data);
};
