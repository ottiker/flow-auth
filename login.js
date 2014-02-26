M.wrap('github/jillix/login/v0.0.1/login.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

module.exports = init;

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    if (!config.view) {
        return console.error('[login: no view config]');
    }
    
    // listen to logout event
    self.on('logout', logout);
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        if (err) {
            return console.error('[login: ' + err.toString() + ']');
        }
        
        // TODO test if user is not logged in.
        //  if the url is not public, go to the login
        //  and return to the previous url after a successful login
        config.routeToLogin = ["/(?!login/).*"];
        config.loginState = "/login/";
        if (!document.cookie && config.routeToLogin) {
            for (var i = 0; i < config.routeToLogin.length; ++i) {
                if (window.location.pathname.match(new RegExp(config.routeToLogin[i]))) {
                    view.state.emit(config.loginState);
                    break;
                }
            }
        }
        
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
            var username = $(config.usr, view.template.dom);
            var password = $(config.pwd, view.template.dom);
            var remember = $(config.remember, view.template.dom);
            $(config.submit, view.template.dom).on('click', function (event) {
                
                // prevent site reloading
                event.preventDefault();
                
                auth.call(self, username.val(), password.val());
            });
            
            // handle session
            self.on('session', function (err, session) {
                if (err) {
                    return authError.call(self, err);
                }
                
                // set session
                document.cookie = 'sid=;Max-Age=0';
                document.cookie = 'sid=' + session[0] + ';path=/';
                
                // push i18n event to all modules
                self.pushAll('i18n', null, session[1]);
                
                // TODO handle success
                
                // emit state
                view.state.emit('/');
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
    
    // delete session cookie
    document.cookie = 'sid=;Max-Age=0';
    
    // sever logout
    self.emit('logout');
}

function authError (err) {
    var self = this;
    console.error(err);
}

return module;

});
