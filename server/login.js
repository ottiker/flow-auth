var credentials = require('../credentials.json');

/**
 * Add a new user if it does not exist.
 *
 * Type: WS
 */
exports.signupUser = function (link) {
    link.end('Not implemented');
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
exports.loginUser = function (link) {
    var session = link.session;

    link.data(function(err, data) {

        if (!data || !data.email || !data.pass || !credentials || !credentials[data.email] || credentials[data.email] !== data.pass) {
            link.end('Invalid user name or password');
        }

        var user = {
            role: 'service_user',
            locale: 'en_US',
            id: 'Ion'
        };

        link.session.create(user.role, user.locale, user.id, function () {
setTimeout(function() {
            link.end(null, { sid: link.session.sid });
}, 6000);
        });
    });
};

/**
 * Destroy current session and set public session.
 *
 * Type: WS
 */
exports.logoutUser = function (link) {
    var session = link.session;

    if (!session || !session.destroy) {
        return link.end('You are already out. Stay out!');
    }

    // destroy session
    session.destroy(function () {
        link.end();
    });
};

/**
 * Start a password reset.
 *
 * Type: WS
 */
exports.forgotPassword = function (link) {
    link.end('Not implemented');
};

/**
 * Finish a password reset.
 *
 * Type: WS
 */
exports.forgotPassword = function (link) {
    link.end('Not implemented');
};
