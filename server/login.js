var M = process.mono;
var View = require(M.config.paths.MODULE_ROOT + 'github/jillix/view/v0.0.1/server/view');

// TODO make the model configurable
var model = {name: 'users'};

module.exports = init;

function init (config) {
    var self = this;
    
    // TODO remove when db is updated
    config.model = model;
    
    if (!config.model) {
        self.emit('ready', 'No model configured');
    }
    
    self.on('auth', auth);
    self.on('deauth', logout);
    
    // plug View
    View(self, function (err) {
        
        // get users model
        self.model(config.model, function (err, users) {
            
            // save user model on instance
            if (users) {
                self.users = users;
            }
            
            // instance is ready
            self.emit('ready', err);
        });
    });
}

// check login credentials and create session
function auth (err, data) {
    var self = this;
    
    var username = data[0];
    var password = data[1];
    
    self.users.read({q: {name: username, pwd: password}, o: {limit: 1}}, function (err, user) {
        
        user = user[0];
        
        if (err || !user) {
            return self.emit('session', err || 'User not found.');
        }
        
        // create session
        M.session.create(user.role, user.locale, function (err, session) {
            
            if (err) {
                return self.emit('session', err);
            }
            
            // set session on this connection
            self.link.ws.session = session;
            
            self.emit('session', null, [session.sid, session[M.config.session.locale]]);
        });
    });
}

// destroy current session and set public session
function logout (err) {
    var self = this;
    var session = self.link.ws.session;
    
    if (!session) {
        return self.emit('session', 'no session on logout.');
    }
    
    // destroy session
    session.destroy(function (err) {
        self.emit('session', err);
    });
}
