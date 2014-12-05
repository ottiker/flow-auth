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
    var session = self.link.session;

    if (!data || !data.p || !data.u) {
        return callback('no data');
    }

    var request = {
        name: data.u.toString(),
        pwd: data.p.toString()
    };

    // get users model
    self.model(self.modelName, env.Z_ROLE_MODULE, function (err, users) {

        if (err) {
            return callback(err);
        }

        users.queries.auth(request, function (err, user) {

            if (err || !user) {
                return callback(err || 'User not found.');
            }

            // create session
            session.create(user.role, user.locale, user._id.toString(), function (err) {

                if (err) {
                    return callback(err);
                }

                callback(null, {s: session.sid, l: session[env.Z_SESSION_LOCALE_KEY]});
            });
        });
    });
}

// destroy current session and set public session
function logout (err, data, callback) {
    var self = this;
    var session = self.link.session;

    if (!session || !session.destroy) {
        return callback('no session on logout.');
    }

    // destroy session
    session.destroy(callback);
}
