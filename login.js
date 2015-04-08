var COOKIE_FIELD = 'sid';

exports.loginState = function (event) {
    var self = this;

    // TODO go to login page if url is private and no sid is set
    // TODO and go back to previous url after successful login

    if (SID.get()) {
        self.emit('userLoggedIn');
    } else {
        self.emit('userLoggedOut');
    }
}

exports.auth = function (event, data) {
    var self = this;

    // check arguments
    if (!data.email || !data.pass) {
        return console.error(new Error('Missing username or password.'));
    }

    var link = this.link('auth', function (err, data) {

        if (err || !data || !data.sid) {
            alert(err || 'No session created');
            return;
        }

        // set session cookie
        SID.set(data.sid);
        location.reload();

    }).send(null, data);
}

exports.logout = function (event) {
    var link = this.link('logout', function (err, data) {
    
        if (err) {
            alert(err);
            return;
        }

        location.reload();

    }).send(null, SID.get());

    // remove session cookie
    SID.rm();
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
