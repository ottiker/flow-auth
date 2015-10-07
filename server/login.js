/**
 * Add a new user if it does not exist.
 *
 * Type: WS
 */
exports.signupUser = function (stream) {
    var self = this;
    stream.data(function (data) {

        if (!data || !data.email || !data.pass || !data.user) {
            return stream.write('User information not provided');
        }

        // user create stream
        var createStream = self.flow("create", true);

        // register user
        var user = {
            email: data.email,
            pass: data.pass,
            user: data.user
        };
        createStream.write(null, {
            db_name: "users",
            data: user
        });

        // listen for create response
        createStream.data(function (data) {
            stream.write(null, {});
            createStream.end();
        });
        createStream.error(function (err) {
            stream.write(err);
            createStream.end();
        });
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
    var self = this;
    stream.data([this, function (data) {

        if (!data || !data.email || !data.pass) {
            stream.write('User information not provided');
            return;
        }
        data.email = data.email || "";
        data.pass = data.pass || "";

        // create the read stream
        var readStream = self.flow("read", true);

        // get the user
        readStream.write(null, {
            db_name: "users",
            query: {
                email: data.email,
                pass: data.pass
            }
        });

        // listen for read response
        readStream.data(function (data) {

            if (!data.docs || !data.docs[0]) {
                return stream.write("Username or password invalid");
            };

            var user = {
                role: 'service_user',
                locale: 'en_US',
                id: data.docs[0]._id
            };

            stream.context.socket.session.create(user.role, user.locale, user.id, function () {
                stream.write(null, { sid: stream.context.socket.session.sid });
                readStream.end();
            });
        });
        readStream.error(function (err) {
            stream.write(err);
            readStream.end();
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
