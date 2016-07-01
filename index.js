var sessions = require('client-sessions');
var crypto = require('crypto');

// default session config
var defaultSession = {
    cookieName: 'SES', // cookie name dictates the key name added to the request object
    requestKey: 'session', // requestKey overrides cookieName for the key name added to the request object
    secret: crypto.randomBytes(64).toString('hex'), // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    cookie: {
        ephemeral: true, // when true, cookie expires when the browser closes
        httpOnly: true, // when true, cookie is not accessible from javascript
        secure: true // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
    }
};

var clientSession = sessions(defaultSession);

exports.session = {

    // get session data
	get: function (options, data, next) {
        clientSession(data.req, data.res, function () {
			data.session = req.session
		    next(null, data);
        });
	},

    // set session data
	set: function () {},

    // destroy the session
	destroy: function () {}
};

exports.token = {
	create: function () {},
	validate: function () {}
};
