module.exports = init;

var COOKIE_FIELD = "sid";

/*
    type: constructor
*/
function init (config, ready) {
    var self = this;

    if (typeof $ === "undefined") {
        throw new Error("This module requires jQuery.");
    }

    if (typeof $.cookie === "undefined") {
        throw new Error("This module requires jQuery cookie.");
    }

    self.auth = auth;
    self.logout = logout;

    // render template
    self.view.layout.render();
    self.$username = $(config.usr, self.view.layout.dom);
    self.$password = $(config.pwd, self.view.layout.dom);
    self.$login = $(config.login, self.view.layout.dom);
    self.$logout = $(config.logout, self.view.layout.dom);

    // TODO check if session set, not just a cookie
    if ($.cookie(COOKIE_FIELD)) {
        self.$login.hide();
        self.$logout.show();
    } else {
        self.$login.show();
        self.$logout.hide();
    }

    ready();
}

/*
    type: receiver
*/
function session (err, data) {
    var self = this;

    if (err) {
        // TODO show error message
        return authError.call(self, err);
    }
    data = data || {};
    login.call(self, data.s, data.l);
}

/*
    type: actor
*/
function auth () {
    var self = this;
    var username = self.$username.val();
    var password = self.$password.val();

    // check arguments
    if (!username || !password) {
        return authError.call(self, new Error('Missing username or password.'));
    }

    // get a session from the server
    self.emit('auth>', null, {u: username, p: password}, session);
}

/*
    type: actor
*/
function logout () {
    var self = this;

    // sever logout
    self.emit('deauth>', null, null, session);
}

/*
    type: private
*/
function login (session, locale) {
    var self = this;

    if (session) {

        // set session id
        $.cookie(COOKIE_FIELD, session);

        // show logout button
        self.$login.hide();
        self.$logout.show();

        // push i18n event to all modules
        self.emit({
            event: 'i18n',
            all: true
        }, locale);

        self.emit('login');

        // emit login state
        return;
    }

    // reload client, to remove all cached data
    self._reload();
}

/*
    type: private
*/
function authError (err) {
    var self = this;
    console.error(err);
}
