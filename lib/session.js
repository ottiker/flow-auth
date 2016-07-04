function checkRequest (data, checkSession) {
    if (!data.req || !data.res) {
        return new Error('Flow-auth.check: No HTTP request.');
    }

    if (checkSession && !data.req.session) {
        return new Error('Flow-auth.check: No session found.');
    }
}

// get session data
exports.get = function (options, data, next) {

    var error = checkRequest(data);
    if (error) {
        return next(error);
    }

    var req = data.req;
    var res = data.res;

    this.clientSessions(data.req, data.res, function () {
        data.session = data.req.session
        next(null, data);
    });
};

// set session data
exports.set = function (options, data, next) {

    var error = checkRequest(data, true);
    if (error) {
        return next(error);
    }

    // TODO what data can be set in a session?
    data.req.session.user = data.user;
    data.req.session.role = data.role;
    data.req.session.lang = data.lang;
    next(null, data);
};

// destroy the session
exports.destroy = function (options, data, next) {

    var error = checkRequest(data, true);
    if (error) {
        return next(error);
    }

    data.req.session.reset();
    next(null, data);
};
