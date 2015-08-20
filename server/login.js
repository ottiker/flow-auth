/**
 * Add a new user if it does not exist.
 *
 * Type: WS
 */
exports.signupUser = function (stream) {
    stream.data(function (data) {
        stream.write("Not implemented");
    });
    stream.error(function (err) {
        stream.write(err);
    });
};

/**
 * Check login credentials and create session.
 *
 * Type: WS
 */
exports.loginUser = function (stream) {
    stream.data([this, function (data) {

        if (!data || !data.email || !data.pass || !this._config.credentials || !this._config.credentials[data.email] || this._config.credentials[data.email] !== data.pass) {
            stream.write('Invalid user name or password');
            return;
        }

        var user = {
            role: 'service_user',
            locale: 'en_US',
            id: 'Ion'
        };

        stream.context.socket.session.create(user.role, user.locale, user.id, function () {
            stream.write(null, { sid: stream.context.socket.session.sid });
        });
    }]);

    stream.error(function (err) {
        stream.write(err);
    });
};

/**
 * Destroy current session and set public session.
 *
 * Type: WS
 */
exports.logoutUser = function (stream) {
    stream.data(function (data) {
        var session = stream.context.socket.session;

        if (!session || !session.destroy) {
            stream.write('No session to destroy.');
            return;
        }

        // destroy session
        session.destroy(function () {
            stream.write();
        });
    });
};

/**
 * Finish a password reset.
 *
 * Type: WS
 */
exports.resetPassword = function (stream) {
    stream.data(function (data) {
        stream.write("Not implemented");
    });
    stream.error(function (err) {
        stream.write(err);
    });
};
