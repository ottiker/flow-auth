/**
 * Add a new user if it does not exist.
 *
 * Type: WS
 */
exports.signupUser = function (stream) {
    stream.data(function (err, data) {
        stream.write("Not implemented");
        return stream.end();
    });
};

/**
 * Activate user after signup.
 *
 * Type: HTTP
 */
exports.activateUser = function (link) {
    // TODO HTTP is different
    link.end('Not implemented');
};

/**
 * Check login credentials and create session.
 *
 * Type: WS
 */
exports.loginUser = function (stream) {
    stream.data([this, function (err, data) {

        if (!data || !data.email || !data.pass || !this._config.credentials || !this._config.credentials[data.email] || this._config.credentials[data.email] !== data.pass) {
            stream.write('Invalid user name or password');
            return stream.end();
        }

        var user = {
            role: 'service_user',
            locale: 'en_US',
            id: 'Ion'
        };

        stream.socket.session.create(user.role, user.locale, user.id, function () {
            stream.write(null, { sid: stream.socket.session.sid });
            stream.end();
        });
    }]);
};

/**
 * Destroy current session and set public session.
 *
 * Type: WS
 */
exports.logoutUser = function (stream) {
    stream.data(function (err, data) {
        var session = stream.socket.session;

        if (!session || !session.destroy) {
            stream.write('You are already out. Stay out!');
            return stream.end();
        }

        // destroy session
        session.destroy(function () {
            stream.write();
            return stream.end();
        });
    });
};

/**
 * Start a password reset.
 *
 * Type: WS
 */
exports.forgotPassword = function (stream) {
    stream.data(function (err, data) {
        stream.write("Not implemented");
        return stream.end();
    });
};

/**
 * Finish a password reset.
 *
 * Type: WS
 */
exports.resetPassword = function (stream) {
    stream.data(function (err, data) {
        stream.write("Not implemented");
        return stream.end();
    });
};
