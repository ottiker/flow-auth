var M = process.mono;
var View = require(M.config.paths.MODULE_ROOT + 'github/jillix/view/v0.0.1/server/view');

module.exports = init;

function init (config) {
    var self = this;
    
    View(this);
    
    self.on('auth', auth);
    self.on('deauth', logout);
}

// check login credentials and create session
function auth (err, data) {
    var self = this;
    
    var username = data[0];
    var password = data[1];
    var users = M.db.mono.collection('m_users');
    
    if (self.link.ws.session) {
        // console.log(self.link.ws.session);
    }
    
    users.findOne({name: username, pwd: password}, function (err, user) {
        
        if (err || !user) {
            return self.emit('session', err || 'User not found.');
        }
        
        // create session
        var session = M.session.create(user.role, user.locale);
        session.on('saved', function (err) {
            
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
    
    session.on('destroyed', function (err) {
        self.emit('session', err);
    });
    session.destroy();
}
