var DEFAULTS = {
    COOKIE_NAME: 'sid',
    RETURN_ATTR: 'return',
    SUCCESS_URL: '/'
};

function error(err, isAlert) {
    console.error(new Error(err));
    if (isAlert) {
        alert(err);
    }
}

exports.init = function () {
    this._config.cookieName = this._config.cookieName || DEFAULTS.COOKIE_NAME;
    this._config.returnAttr = this._config.returnAttr || DEFAULTS.RETURN_ATTR;
    this._config.successUrl = this._config.successUrl || DEFAULTS.SUCCESS_URL;
};

exports.signup = function (event, data) {

    var self = this;

    // check arguments
    if (!data.email || !data.pass) {
        return error('Please provide both an email and a password.', true);
    }

    var link = self.link('signup', function (err, data) {

        if (err) {
            alert(err);
            return;
        }

        // reload is necessary because of the cookie
        location.pathname = self._config.successUrl;

    }).send(null, data);
};

exports.login = function (event, data) {

    var self = this;

    // check arguments
    if (!data.email || !data.pass) {
        return error('Missing email or password.', true);
    }

    var link = self.link('login', function (err, data) {

        if (err || !data || !data.sid) {
            return error(err || 'No session created', true);
        }

        // set session cookie
        SID.set(self._config.cookieName, data.sid);
        location.pathname = self._config.successUrl;

    }).send(null, data);
};

exports.logout = function (event) {

    var self = this;

    var link = self.link('logout', function (err, data) {
    
        if (err) {
            return error(err, true);
        }

        location.reload();

    }).send(null, SID.get(self._config.cookieName));

    // remove session cookie
    SID.rm(self._config.cookieName);
};

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
