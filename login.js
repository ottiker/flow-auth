M.wrap('github/jillix/login/v0.0.1/login.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

module.exports = init;

function init () {
    var self = this;
    var config = self.mono.config.data;
    var previousState = location.pathname;
    
    // normalize path
    previousState += previousState[previousState.length - 1] === '/' ? '' : '/';
    
    if (!config.view) {
        return console.error('[login: no view config]');
    }
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        if (err) {
            return console.error('[login: ' + err.toString() + ']');
        }
        
        // go to login state if user is not logged in and tries to acces a private page
        if (!document.cookie && config.routeToLogin) {
            for (var i = 0; i < config.routeToLogin.length; ++i) {
                if (window.location.pathname.match(new RegExp(config.routeToLogin[i]))) {
                    self.route(config.out);
                    break;
                }
            }
        }
        
        // route to private page if logged in
        if (document.cookie && config.out === previousState) {
            self.route(config.in);
        }
        
        // listen to logout event
        self.on('logout', logout);
        
        // handle session event
        self.on('session', function (err, session) {
            
            // remove current session id
            document.cookie = 'sid=;path=/;Max-Age=0';
            
            if (err) {
                // TODO show error message
                return authError.call(self, err);
            }
            
            if (session) {
                // set session id
                document.cookie = 'sid=' + session[0] + ';path=/';
                
                // push i18n event to all modules
                self.spill('i18n', null, session[1]);
                
                // TODO show logout button
                self.login.hide();
                self.logout.show();
                
                // emit login state
                return self.route(config.out === previousState ? config.in : previousState);
            }
            
            // reload mono, to remove all cached data
            M.reload();
        });
        
        // init model
        view.model(config.model, function (err, model) {
            
            if (err) {
                return console.error('[login: ' + err.toString() + ']');
            }
            
            // save model on instance
            self.model = model;
            
            // render template
            view.template.render();
            
            // get dom refs
            self.login = $('.login_form', view.template.dom);
            self.logout = $('.logout_form', view.template.dom);
            var username = $(config.usr, view.template.dom);
            var password = $(config.pwd, view.template.dom);
            var remember = $(config.remember, view.template.dom);
            
            // logout click
            $('.logout', self.logout).on('click', function () {
                self.emit('logout');
                
                // TODO use states for logout animation
                // reload to public page, to remove all cached data
                self.logout.css("-webkit-animation-duration", "0.25s");
                
                // start animation
                self.logout.addClass('animated flipOutY');
            });
            
            // show/hide forms
            if (document.cookie) {
                self.login.hide();
                self.logout.show();
            } else {
                self.logout.hide();
                self.login.show();
            }
            
            $(config.submit, view.template.dom).on('click', function (event) {
                
                // prevent site reloading
                event.preventDefault();
                
                auth.call(self, username.val(), password.val());
            });
            
            self.emit('ready');
        });
    });
}

function auth (username, password) {
    var self = this;
    
    // check arguments
    if (!username || !password) {
        return authError.call(self, new Error('Missing username or password.'));
    }
    
    // get a session from the server
    self.emit('auth', null, [username, password]);
}

function logout () {
    var self = this;
    // sever logout
    self.emit('deauth');
}

function authError (err) {
    var self = this;
    console.error(err);
}

return module;

});
