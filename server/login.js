var M = process.mono;
var View = require(M.config.paths.MODULE_ROOT + 'github/jillix/view/v0.0.1/server/view');

module.exports = init;

// handle sessions
M.on('request', function (req, res, callback) {
    
    // add public role to request
    req.session = {};
    req.session[M.config.session.role] = M.config.session.publicRole;
    
    callback(req, res);
});

function init (config) {
    var self = this;
    
    View(this);
    
    self.on('auth', auth);
}

// check login credentials and create session
function auth (err, data) {
    var self = this;
    
    var username = data[0];
    var password = data[1];
    var users = M.db.mono.collection('m_users');
    
    if (self.link.ws.session) {
        console.log(self.link.ws.session);
    }
    
    users.findOne({name: username, pwd: password}, function (err, user) {
        
        if (err || !user) {
            return self.emit('session', err || 'User not found.');
        }
        
        // TODO create session
        var session = {
            id: 'truckenid',
            loc: user.locale || 'en_US',
            rid: user.role
        };
        
        // set session on this connection
        self.link.ws.session = session;
        
        self.emit('session', err, session);
    });
}

// destroy current session and set public session
function logout (err) {
    var self = this;
    
    if (!self.link.ws.session) {
        
    }
    
}
