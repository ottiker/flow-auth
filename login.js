var COOKIE_FIELD = 'sid';

function error(err, isAlert) {
    console.error(new Error(err));
    if (isAlert) {
        alert(err);
    }
}

exports.signup = function (event, data) {

    // check arguments
    if (!data.email || !data.pass) {
        return error('Please provide both an email and a password.');
    }

    var link = this.link('signup', function (err, data) {

        if (err) {
            alert(err);
            return;
        }

        // TODO emit only something
        location.pathname = '/';

    }).send(null, data);
}

exports.login = function (event, data) {

    // check arguments
    if (!data.email || !data.pass) {
        return error('Missing email or password.', true);
    }

    var link = this.link('login', function (err, data) {

        if (err || !data || !data.sid) {
            return error(err || 'No session created', true);
        }

        // set session cookie
        SID.set(data.sid);
        location.reload();

    }).send(null, data);
}

exports.logout = function (event) {

    var link = this.link('logout', function (err, data) {
    
        if (err) {
            return error(err, true);
        }

        location.reload();

    }).send(null, SID.get());

    // remove session cookie
    SID.rm();
}

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
}

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
}

// cookie handling
var SID = {

    get: function () {
        // credentials: https://developer.mozilla.org/en-US/docs/Web/API/Document.cookie
        return document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + COOKIE_FIELD.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") || null;
    },

    set: function (sValue) {
        document.cookie = COOKIE_FIELD + "=" + sValue + ';path=/';
    },

    rm: function () {
        document.cookie = COOKIE_FIELD + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};
