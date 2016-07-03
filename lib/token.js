var sessions = require('client-sessions');
var sessionConfig;

exports.init = function (config) {
    sessionConfig = config;
};

exports.create = function (options, data, next) {

    var content = [new Date().getTime() + (1000 * 60 * 10), 'USER_ID'];

    var token = sessions.util.encode(sessionConfig, content);
    data.token = token;
    console.log('Encoded:', token);
    next(null, data);
};

exports.validate = function (options, data, next) {

    var token = data.token;
    var content = sessions.util.decode(sessionConfig, token);
    var now = new Date().getTime();

    console.log('Decoded:', content);

    if (now <= content[0]) {
        return next(new Error('Flow-auth.token.validate: Expired.'));
    }

    next(null, data);
};
