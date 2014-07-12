Z.wrap('github/jillix/login/v0.0.1/login.js', function (require, module, exports) {

module.exports = init;

function init (config, ready) {
    var self = this;
    var previousState = location.pathname;

    // normalize path
    previousState += previousState[previousState.length - 1] === '/' ? '' : '/';

    // go to login state if user is not logged in and tries to acces a private page
    if (!document.cookie && config.routeToLogin) {
        for (var i = 0; i < config.routeToLogin.length; ++i) {
            if (window.location.pathname.match(new RegExp(config.routeToLogin[i]))) {
                self.route(config.out);
                break;
            }
        }

    // route to private page if logged in
    } else if (document.cookie && config.out === previousState) {
        self.route(config.in);
    }

    self.auth = auth;
    self.logout = logout;
    self.login = login;

    // render template
    self.view.layout.render();
    self.$username = $(config.usr, self.view.layout.dom);
    self.$password = $(config.pwd, self.view.layout.dom);
    self.$login = $(config.login, self.view.layout.dom);
    self.$logout = $(config.logout, self.view.layout.dom);

    // TODO check if session set, not just a cookie
    if (document.cookie) {
        self.$login.hide();
        self.$logout.show();
    } else {
        self.$login.show();
        self.$logout.hide();
    }

    console.log('login:', self._name);
    ready();
}

function login (err, session) {
    var self = this;

    // remove current session id
    document.cookie = 'sid=;path=/;Max-Age=0';

    if (err) {
        // TODO show error message
        return authError.call(self, err);
    }

    if (session) {
        // set session id
        document.cookie = 'sid=' + session[0] + ';path=/';

        // show logout button
        self.$login.hide();
        self.$logout.show();

        // push i18n event to all modules
        self.emit({
            event: 'i18n',
            all: true
        }, null, session[1]);

        self.emit('login');

        // emit login state
        return;
    }

    // reload client, to remove all cached data
    self._reload();
}

function auth () {
    var self = this;
    var username = self.$username.val();
    var password = self.$password.val();

    // check arguments
    if (!username || !password) {
        return authError.call(self, new Error('Missing username or password.'));
    }

    // get a session from the server
    self.emit('auth>', null, [username, password]);
}

function logout () {
    var self = this;

    // sever logout
    self.emit('deauth>');
}

function authError (err) {
    var self = this;
    console.error(err);
}

return module;

});
