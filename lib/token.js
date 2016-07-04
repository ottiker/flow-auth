var sessions = require('client-sessions');

exports.create = function (options, data, next) {

    // TODO save user info in token
    data.token = sessions.util.encode(this._token, 'USER_ID');
    next(null, data);
};

exports.validate = function (options, data, next) {

    if (!data.token) {
        return next(new Error('Flow-auth.token.validate: No token found.'));
    }

    var content = sessions.util.decode(this._token, data.token);

    if (!content) {
        var error = new Error('Flow-auth.token.validate: Invalid.');
        error._ = data;
        return next(error);
    }

    data.content = content.content;

    next(null, data);
};
