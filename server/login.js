var M = process.mono;
var View = require(M.config.paths.MODULE_ROOT + 'github/jillix/view/v0.0.1/server/view');

module.exports = init;

function init (config) {
    var self = this;
    
    View(this);
    
    self.on('auth', auth);
}

function auth () {
    var self = this;
    
    self.emit('session', null, {test: 'response'});
}
