module.exports = init;

var COOKIE_FIELD = 'sid';

/*
    type: constructor
*/
function init (config, ready) {
    var self = this;

    // extend instance
    self.auth = auth;
    self.logout = logout;

    self.on('route', loginState);

    ready();
}

function loginState (state) {
    var self = this;

    // TODO go to login page if url is private and no sid is set
    // TODO and go back to previous url after successful login

    if (SID.get()) {
        self.emit('userLoggedIn');
    } else {
        self.emit('userLoggedOut');
    }
}

/*
    type: receiver
*/
function session (err, data) {
    var self = this;

    if (err) {
        // TODO show error message
        return;
    }

    // handle successful login
    if (data && data.s) {

        // set session id
        SID.set(data.s);

        // push i18n event to all modules
        self.emit({
            event: 'i18n',
            all: true
        }, data.l);
    }

    location.reload();
}

/*
    type: actor
*/
function auth (event, data) {
    var self = this;

    // get dom elements
    var username = document.getElementById(data.user);
    var password = document.getElementById(data.pass);

    // check arguments
    if (!username || !username.value || !password || !password.value) {
        return console.error(new Error('Missing username or password.'));
    }

    // get a session from the server
    self.emit('auth>', null, {u: username.value, p: password.value}, session);
}

/*
    type: actor
*/
function logout () {
    var self = this;

    // sever logout
    self.emit('deauth>', null, null, session);

    // remove session id
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
