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

        var user = {
            email: data.email,
            pass: data.pass,
            user: data.user
        };

        // validate user
        self.flow("validate").write(null, {
            schema: "users",
            data: user
        }).data(function (res) {
            if (!res.valid) {
                return stream.write(res.errors[0] || "Error while validating schema");
            }

            // insert user
            self.flow("create").write(null, {
                db_name: "users",
                data: user
            }).data(function (data) {
                return stream.write(null, {});
            }).error(function (error) {
                return stream.write(error);
            });

        }).error(function (error) {
            return stream.write(error);
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


        // get the user
        self.flow("read").write(null, {
            db_name: "users",
            query: {
                email: data.email,
                pass: data.pass
            }
        }).data(function (data) {
            if (!data.docs || !data.docs[0]) {
                return stream.write("Username or password invalid");
            };

            var user = {
                role: 'service_user',
                locale: 'en_US',
                id: data.docs[0]._id
            };

            stream.context.socket.session.create(user.role, user.locale, user.id, function () {
                return stream.write(null, { sid: stream.context.socket.session.sid });
            });
        }).error(function (error) {
            return stream.write(error);
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
