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
        
        // TODO test if user is not logged in.
        //  if the url is not public, go to the login
        //  and return to the previous url after a successful login
        config.routeToLogin = ["/(?!login/).*"];
        if (!document.cookie && config.routeToLogin) {
            for (var i = 0; i < config.routeToLogin.length; ++i) {
                if (window.location.pathname.match(new RegExp(config.routeToLogin[i]))) {
                    view.state.emit(config.out);
                    break;
                }
            }
        }
        
        // listen to logout event
        self.on('logout', logout);
        
        // handle session event
        self.on('session', function (err, session) {
            
            if (err) {
                return authError.call(self, err);
            }
            
            // remove current session id
            document.cookie = 'sid=;path=/;Max-Age=0';
            
            if (session) {
                // set session id
                document.cookie = 'sid=' + session[0] + ';path=/';
                
                // push i18n event to all modules
                self.pushAll('i18n', null, session[1]);
                
                // emit login state
                return view.state.emit(config.out === previousState ? config.in : previousState);
            }
            
            // reload to public page, to remove all cached data
            window.location = config.out;
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
            var username = $(config.usr, view.template.dom);
            var password = $(config.pwd, view.template.dom);
            var remember = $(config.remember, view.template.dom);
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
