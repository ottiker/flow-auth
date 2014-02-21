M.wrap('github/jillix/login/v0.0.1/login.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    if (!config.view) {
        return console.error('[login: no view config]');
    }
    
    // init view
    View(self).load(config.view, function (err) {
        // get dom refs
    });
}

module.exports = init;

return module;

});
