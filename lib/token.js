var sessions = require('client-sessions');

exports.create = function (options, data, next) {

    // TODO save user info in token
    data.token = sessions.util.encode(this._token, 'USER_ID', this._token.duration);
    next(null, data);
};

exports.validate = function (options, data, next) {

    if (!data.token) {
        return next(new Error('Flow-auth.token.validate: No token found.'));
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
