var env = process.env;

module.exports = init;

function init (config, ready) {
    var self = this;

    if (!config.model) {
        return ready(new Error('No model configured'));
    }

    self.modelName = config.model.name;
    self.auth = auth;
    self.logout = logout;

    // instance is ready
    ready();
}

// check login credentials and create session
function auth (err, data, callback) {
    var self = this;
    var session = self.link.ws.session;

    if (!data || !data.p || !data.u) {
        return callback('no data');
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
            return callback(err);
        }

        users.request(request, function (err, user) {

            if (err || !user) {
                return callback(err || 'User not found.');
            }

            // create session
            session.create(user.role, user.locale, user._id.toString(), function (err, session) {

                if (err) {
                    return callback(err);
                }

                // set session on this connection
                self.link.ws.session = session;

                callback(null, {s: session.sid, l: session[env.Z_SESSION_LOCALE_KEY]});
            });
        });
    });
}

// destroy current session and set public session
function logout (err, data, callback) {
    var self = this;
    var session = self.link.ws.session;

    if (!session || !session.destroy) {
        return callback('no session on logout.');
    }

    // destroy session
    session.destroy(callback);
}
