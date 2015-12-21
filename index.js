// cookie handling
var SID = {

    get: function (name) {
        // credentials: https://developer.mozilla.org/en-US/docs/Web/API/Document.cookie
        return document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + name.replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1') || null;
    },

    set: function (name, value) {
        document.cookie = name + '=' + value + ';path=/';
    },

    rm: function (name) {
        document.cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

// set or remove cookie session
exports.session = function (_options, data, next) {

    options = _options || {
        sid: this._config.cookie || 'sid'
    };
    
    // set session
    if (!options.remove && data && data[options.sid]) {
        SID.set(options.sid, data[options.sid]);

    // remove session
    } else {
        SID.rm(options.sid);
    }
    
    next(null, data)
};
