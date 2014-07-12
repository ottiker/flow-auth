var M = process.mono;

module.exports = init;

function init (config) {
    var self = this;

    if (!config.model) {
        self.emit('ready', 'No model configured');
    }

    self.on('auth>', auth);
    self.on('deauth>', logout);

    // get users model
    self.Z.model(config.model, function (err, users) {

        // save user model on instance
        if (users) {
            self.users = users;
        }

        // instance is ready
        self.emit('ready', err);
    });
}

// check login credentials and create session
function auth (err, data) {
    var self = this;

    if (!data) {
        return self.emit('<session', 'no data');
    }

    var request = {
        m: 'findOne',
        q: {
            name: data[0],
            pwd: data[1]
        }
    };

    self.users.request(request, function (err, user) {

        if (err || !user) {
            return self.emit('<session', err || 'User not found.');
        }

        // create session
        M.session.create(user.role, user.locale, function (err, session) {

            if (err) {
                return self.emit('<session', err);
            }

            // set session on this connection
            self.link.ws.session = session;

            self.emit('<session', null, [session.sid, session[M.config.session.locale]]);
        });
    });
}

// destroy current session and set public session
function logout (err) {
    var self = this;
    var session = self.link.ws.session;

    if (!session || !session.destroy) {
        return self.emit('<session', 'no session on logout.');
    }

    // destroy session
    session.destroy(function (err) {
        self.emit('<session', err);
    });
}
