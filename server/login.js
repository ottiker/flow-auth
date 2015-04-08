var credentials = require('../credentials.json');

// check login credentials and create session
exports.authenticateUser = function (link) {
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
            link.end(null, { sid: link.session.sid });
        });
    });
}

// destroy current session and set public session
exports.logoutUser = function (link) {
    var session = link.session;

    if (!session || !session.destroy) {
        return link.end('You are already out. Stay out!');
    }

    // destroy session
    session.destroy(function () {
        link.end();
    });
}
