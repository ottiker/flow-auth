var env = process.env;

module.exports = init;

function init (config, ready) {
    var self = this;

    if (!config.model) {
        return ready(new Error('No model configured'));
    }

    self.modelName = config.model.name;

    self.on('auth>', auth);
    self.on('deauth>', logout);

    // instance is ready
    ready();
}

// check login credentials and create session
function auth (err, data) {
    var self = this;
    var session = self.link.ws.session;

    if (!data || !data.p || !data.u) {
        return self.emit('<session', 'no data');
    }

    var request = {
        m: 'findOne',
        q: {
            name: data.u,
            pwd: data.p
        }
    };

    // get users model
    self._model(self.modelName, "user", function (err, users) {

        if (err) {
            return self.emit('<session', err);
        }

        users.request(request, function (err, user) {

            if (err || !user) {
                return self.emit('<session', err || 'User not found.');
            }

            // create session
            session.create(user.role, user.locale, function (err, session) {

                if (err) {
                    return self.emit('<session', err);
                }

                // set session on this connection
                self.link.ws.session = session;

                self.emit('<session', null, {s: session.sid, l: session[env.Z_SESSION_LOCALE_KEY]});
            });
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
