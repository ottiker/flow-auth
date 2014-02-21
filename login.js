M.wrap('github/jillix/login/v0.0.1/login.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

module.exports = init;

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    if (!config.view) {
        return console.error('[login: no view config]');
    }
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        
        if (err) {
            return console.error('[login: ' + err.toString() + ']');
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
                
                auth.call(self, username.val(), password.val(), function (err) {
                    
                    if (err) {
                        return authError.call(self, err);
                    }
                    
                    // emit state
                    view.state.emit('/');
                });
            });
            
            self.emit('ready');
        });
    });
}

function auth (username, password, callback) {
    var self = this;
    
    // check arguments
    if (!username || !password) {
        return callback(new Error('Missing username or password.'));
    }
    
    // get a session from the server
    self.emit('auth', null, [username, password], function (err, session) {
        
        if (err) {
            return callback(err);
        }
        
        setSessionCookie.call(self, session);
        
        callback();
    });
}

function setSessionCookie (session) {
    // set session
    // reload ws
}

function authError (err) {
    var self = this;
}

return module;

});
