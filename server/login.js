/**
 * Add a new user if it does not exist.
 *
 * Type: WS
 */
exports.signupUser = function (stream) {
    var self = this;
    stream.data(function (data) {

        if (!data || !data.email || !data.pass || !data.user || !data.confirm) {
            return stream.write(new Error('ERR_MISSING_DATA'));
        }

        // user pass must be the same as the confirm
        if (data.pass !== data.confirm) {
            return stream.write(new Error('ERR_BAD_CONFIRM'));
        }

        var user = {
            email: data.email,
            pass: data.pass,
            user: data.user
        };

        // validate user information
        validateUser.call(self, user, function (err) {
            if (err) {
                return stream.write(err);
            }

            // insert user
            self.flow('create').write(null, {
                store: 'users',
                data: user
            }).data(function (result) {
                return stream.write(null, {
                    result: result
                });
            }).error(function (err) {
                return stream.write(err);
            });
        })
    });
    stream.error(function (err) {
        stream.write(err);
    });
};

function validateUser (user, callback) {
    var self = this;

    // validate schema
    self.flow('validate').write(null, {
        schema: 'users',
        data: user
    }).data(function (res) {
        if (!res.valid) {
            return callback(new Error('ERR_SCHEMA_VALIDATION_FAILED'));
        }

        // username must be unique
        self.flow('read').write(null, {
            store: 'users',
            query: {
                user: user.user
            }
        }).data(function (result) {
            if (!result) {
                return callback(new Error('ERR_EMPTY_RESPONSE'));
            }
            if (result.length) {
                return callback(new Error('ERR_USERNAME_TAKEN'));
            }

            // email must be unique
            self.flow('read').write(null, {
                store: 'users',
                query: {
                    email: user.email
                }
            }).data(function(result) {
                if (!result) {
                    return callback(new Error('ERR_EMPTY_RESPONSE'));
                }
                if (result.length) {
                    return callback(new Error('ERR_EMAIL_TAKEN'));
                }

                return callback(null);
            }).error(function (error) {
                return callback(error);
            });;
        }).error(function (error) {
            return callback(error);
        });
    }).error(function (error) {
        return callback(error);
    });
}

/**
 * Check login credentials and create session.
 *
 * Type: WS
 */
exports.loginUser = function (stream) {
    var self = this;
    stream.data([this, function (data) {

        if (!data || !data.email || !data.pass) {
            stream.write(new Error('ERR_MISSING_DATA'));
            return;
        }
        data.email = data.email || '';
        data.pass = data.pass || '';

        // get the user
        self.flow('read').write(null, {
            store: 'users',
            query: {
                email: data.email,
                pass: data.pass
            }
        }).data(function (result) {
            if (!result || !result[0]) {
                return stream.write(new Error('ERR_INVALID_USER_OR_PASS'));
            };

            var user = {
                role: 'service_user',
                locale: 'en_US',
                id: result[0]._id
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
        stream.write('Not implemented');
    });
    stream.error(function (err) {
        stream.write(err);
    });
};
