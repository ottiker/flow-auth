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
    if (this.C.emitEvents) {
        this.emit({ event: eventName, all: true })
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

    // initialize defaults
    this.C.redirect = Boolean(this.C.redirect);
    this.C.emitEvents = Boolean(this.C.emitEvents);
    this.C.homeUrl = this.C.homeUrl || DEFAULTS.HOME_URL;
    this.C.loginUrl = this.C.loginUrl || DEFAULTS.LOGIN_URL;
    this.C.successUrl = this.C.successUrl || DEFAULTS.SUCCESS_URL;
    this.C.returnParam = this.C.returnParam || DEFAULTS.RETURN_PARAM;
    this.C.sessionCookie = this.C.sessionCookie || DEFAULTS.SESSION_COOKIE;

    // normalize pathname and login URL (must end with / for comparison)
    var pn = window.location.pathname;
    if (pn.substr(-1) !== '/') {
        pn += '/';
    }
    var lu = this.C.loginUrl;
    if (lu.substr(-1) !== '/') {
        lu += '/';
    }

    // add return URL query string parameter if not on the login page
    if (pn.indexOf(lu) !== 0 && !SID.get(this.C.sessionCookie) && pn !== this.C.homeUrl) {
        var returnUrl = window.location.pathname + window.location.search + window.location.hash;
        window.location = this.C.loginUrl + '?' + this.C.returnParam + '=' + encodeURIComponent(returnUrl);
    }
};

exports.signup = function (event, data) {

    var self = this;

    // check arguments
    if (!data.email || !data.pass) {
        return error('Please provide both an email and a password.', true);
    }

    emit.call(self, 'login_signup');

    var link = self.link('signup', function (err, data) {

        if (err) {
            emit.call(self, 'login_signup_error');
            alert(err);
            return;
        }

        emit.call(self, 'login_signup_ok');

        // navigate to success URL
        navigateSuccess.call(self);

    }).send(null, data);
};

exports.login = function (event, data) {

    var self = this;

    // check arguments
    if (!data.email || !data.pass) {
        return error('Missing email or password.', true);
    }

    emit.call(self, 'login_login');

    var link = self.link('login', function (err, data) {

        if (err || !data || !data.sid) {
            emit.call(self, 'login_login_error');
            return error(err || 'No session created', true);
        }

        emit.call(self, 'login_login_ok');

        // set session cookie
        SID.set(self.C.sessionCookie, data.sid);
        // navigate to success URL
        navigateSuccess.call(self);

    }).send(null, data);
};

exports.logout = function (event) {

    var self = this;

    emit.call(self, 'login_logout');

    var link = self.link('logout', function (err, data) {
    
        if (err) {
            emit.call(self, 'login_logout_error');
            return error(err, true);
        }

        emit.call(self, 'login_logout_ok');

        // navigate to home URL
        window.location = self.C.homeUrl;

    }).send(null, SID.get(self.C.sessionCookie));

    // remove session cookie
    SID.rm(self.C.sessionCookie);
};

// TODO
exports.forgot = function (event, data) {

    // check arguments
    if (!data.email) {
        return error('We need an email address to send you the reset password link.', true);
    }

    var link = this.link('forgot', function (err, data) {

        if (err) {
            return error(err, true);
        }

        // TODO only emit something otherwise this is hardcoded here
        alert('A reset link was sent to your email address.');
        location.pathname = '/';

    }).send(null, data);
};

// TODO
exports.reset = function (event, data) {

    // check arguments
    if (!data.pass) {
        return error('You can not have an empty password.', true);
    }

    var link = this.link('reset', function (err, data) {

        if (err) {
            return error(err, true);
        }

        // TODO only emit something otherwise this is hardcoded here
        location.pathname = '/login';

    }).send(null, data);
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
