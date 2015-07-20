var DEFAULTS = {
    HOME_URL: '/',
    LOGIN_URL: '/login',
    SUCCESS_URL: '/',
    RETURN_PARAM: 'return',
    SESSION_COOKIE: 'sid'
};

function error(err, isAlert) {
    console.error(new Error(err));
    if (isAlert) {
        alert(err);
    }
}

function emit(eventName, data) {
    var self = this;

    if (this.C.emitEvents) {
        var str = self._streams[eventName] || (self._streams[eventName] = self.flow(eventName));
        str.write(null, data);
    }
}

function navigateSuccess() {
    var ls = window.location.search;
    var ra = this.C.returnParam;

    // either the success URL or the return URL
    var redirectUrl = this.C.successUrl;
    if (ls.indexOf(ra + '=') >= 0) {
        redirectUrl = decodeURIComponent(ls.substr(ls.indexOf(ra + '=') + ra.length + 1));
    }

    // navigate
    if (window.history.pushState && !this.C.redirect) {
        try {
            engine.route(redirectUrl);
            engine.reload();
        } catch (err) {
            // in case the return URL was a hijacked external URL
            engine.route(this.C.successUrl);
            engine.reload();
        }
    } else {
        window.location = redirectUrl;
    }
}

exports.init = function () {
    // this makes sure we avoid massive code changes on future API changes
    this.C = this._config;
    this._streams = {};

    // initialize defaults
    this.C.redirect = Boolean(this.C.redirect);
    this.C.emitEvents = Boolean(this.C.emitEvents);
    this.C.homeUrl = this.C.homeUrl || DEFAULTS.HOME_URL;
    this.C.successUrl = this.C.successUrl || DEFAULTS.SUCCESS_URL;
    this.C.returnParam = this.C.returnParam || DEFAULTS.RETURN_PARAM;
    this.C.sessionCookie = this.C.sessionCookie || DEFAULTS.SESSION_COOKIE;
};

exports.signup = function (stream) {
    var self = this;

    stream.data(function (err, data) {

        if (err) {
            return error(err, false);
        }

        // check arguments
        if (!data.email || !data.pass) {
            return error('Please provide both an email and a password.', true);
        }

        emit.call(self, 'login_signup');

        // create stream
        var str = self.flow("signupUser");

        // listen for response
        str.data(function (err, data) {

            if (err) {
                emit.call(self, 'login_signup_error');
                alert(err);
                return;
            }

            emit.call(self, 'login_signup_ok');

            // navigate to success URL
            navigateSuccess.call(self);
        });

        // send data
        str.write(null, {
            email: data.email,
            pass: data.pass
        });
    });
};

exports.login = function (stream) {
    var self = this;

    stream.data(function (err, data) {

        if (err) {
            return error(err, false);
        }

        // check arguments
        if (!data.email || !data.pass) {
            return error('Missing email or password.', true);
        }

        emit.call(self, 'login_login');

        // create the stream
        var str = self.flow("loginUser");

        // listen for response
        str.data(function (err, data) {

            if (err || !data || !data.sid) {
                emit.call(self, 'login_login_error');
                return error(err || 'No session created', true);
            }

            emit.call(self, 'login_login_ok');

            // set session cookie
            SID.set(self.C.sessionCookie, data.sid);
            // navigate to success URL
            navigateSuccess.call(self);
        });

        str.write(null, {
            email: data.email,
            pass: data.pass
        });
    });
};

exports.logout = function (stream) {
    var self = this;

    stream.data(function (err, data) {

        if (err) {
            return error(err, false);
        }

        // create stream
        var str = self.flow("logoutUser");

        // listen for response
        str.data(function (err, data) {

            if (err) {
                emit.call(self, 'login_logout_error');
                return error(err, true);
            }

            emit.call(self, 'login_logout_ok');

            // navigate to home URL
            window.location = self.C.homeUrl;
        });

        // send data
        str.write(null, SID.get(self.C.sessionCookie));

        // remove session cookie
        SID.rm(self.C.sessionCookie);
    });
};

// TODO
exports.forgot = function (stream) {
    var self = this;

    stream.data(function (err, data) {

        if (err) {
            return error(err, false);
        }

        // check arguments
        if (!data.email) {
            return error('We need an email address to send you the reset password link.', true);
        }

        // create stream
        var str = self.flow("forgotPassword");

        // listen for response
        str.data(function (err, data) {

            if (err) {
                return error(err, true);
            }

            // TODO only emit something otherwise this is hardcoded here
            alert('A reset link was sent to your email address.');
            location.pathname = '/';
        });

        // send data
        str.write(null, data);
    });
};

// TODO
exports.reset = function (event, data) {
    var self = this;

    stream.data(function (err, data) {

        if (err) {
            return error(err, false);
        }

        // check arguments
        if (!data.pass) {
            return error('You can not have an empty password.', true);
        }

        // create stream
        var str = self.flow("resetPassword");

        // listen for response
        str.data(function (err, data) {

            if (err) {
                return error(err, true);
            }

            // TODO only emit something otherwise this is hardcoded here
            location.pathname = '/login';
        });

        // send data
        str.write(null, data);
    });
};

// cookie handling
var SID = {

    get: function (name) {
        // credentials: https://developer.mozilla.org/en-US/docs/Web/API/Document.cookie
        return document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + name.replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1') || null;
    },

    set: function (name, value) {
        document.cookie = name + '=' + value + ';path=/';
    },

    rm: function (name) {
        document.cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};
