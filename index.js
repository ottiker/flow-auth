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
		var req = data.req;
		var res = data.res;

        clientSession(req, res, function () {

			if (req.session._exp <= new Date().getTime()) {
				return next('Flow-auth.session.get: Expired.');
			}

			data.session = req.session
		    next(null, data);
        });
	},

    // set session data
	set: function (options, data, next) {

		if (!data.req || !data.req.session) {
			return next(new Error('Flow-auth.session.set: No session found.'));
		}

		data.req.session.user = data.user;
		data.req.session.role = data.role;
		data.req.session.lang = data.lang;
		data.req.session._exp = new Date().getTime() + defaultSession.duration;
		next(null, data);
	},

    // destroy the session
	destroy: function (options, data, next) {
		data.req.session.destroy();
		next(null, data);
	}
};

exports.token = {
	create: function (options, data, next) {

		var content = [new Date().getTime() + (1000 * 60 * 10), 'USER_ID'];

		var token = sessions.util.encode(defaultSession, content);
		data.token = token;
		console.log('Encoded:', token);
		next(null, data);
	},
	validate: function (options, data, next) {

		var token = data.token;
		var content = sessions.util.decode(defaultSession, tocken);
		var now = new Date().getTime();

		console.log('Decoded:', content);

		if (now <= content[0]) {
			return next(new Error('Flow-auth.token.validate: Expired.'));
		}

		next(null, data);
	}
};
